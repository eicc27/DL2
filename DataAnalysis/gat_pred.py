from torch_geometric.data import HeteroData
from tqdm import tqdm
from transformers import AutoTokenizer, AutoModel
from llama_index.graph_stores.neo4j import Neo4jGraphStore
import torch
import json
import torch_geometric.transforms as T
from torch_geometric.nn import GATConv, to_hetero
from torch_geometric.data import HeteroData
from flask import Flask, request
from flask_cors import CORS
application = Flask(__name__)
CORS(application)


def get_key_by_value(d: dict, value):
    for k, v in d.items():
        if v == value:
            return k


class DataBuilder:
    def __init__(self):
        self.data = HeteroData()
        self.tokenizer = AutoTokenizer.from_pretrained(
            "microsoft/deberta-v3-base", use_fast=False
        )
        self.model = AutoModel.from_pretrained("microsoft/deberta-v3-base").to("cuda")
        self.gs = Neo4jGraphStore(
            username="neo4j",
            password="030108chen",
            url="bolt://localhost:7687",
            database="neo4j",
        )

    def get_content_by_name(self, key: str, name: str):
        keyprop = "arxivId" if key == "Paper" else "name"
        query = f"MATCH (n:{key}) WHERE n.{keyprop} = $name RETURN n"
        result = self.gs.query(query, {"name": name})[0]["n"]
        return (
            f"Title: {result['title']}\nAbstract: {result['abs']}"
            if key == "Paper"
            else f"Name: {result['name']}\nDescription: {result['desc']}"
        )

    def embed(self, contents: list[str]):
        tokens = self.tokenizer(
            contents, padding=True, truncation=False, return_tensors="pt"
        ).to("cuda")
        with torch.no_grad():
            outputs = self.model(**tokens)
        return outputs.last_hidden_state.mean(dim=1)

    def load_papers(self, papers_path="papers.json"):
        self.papers = json.load(open(papers_path))
        self.data["paper"].x = torch.zeros(len(self.papers), 768)
        for arxiv_id, index in tqdm(self.papers.items()):
            content = self.get_content_by_name("Paper", arxiv_id)
            self.data["paper"].x[index] = self.embed(content)

    def load_methods(self, methods_path="methods.json"):
        self.methods = json.load(open(methods_path))
        self.data["method"].x = torch.zeros(len(self.methods), 768)
        for method_name, index in tqdm(self.methods.items()):
            content = self.get_content_by_name("Method", method_name)
            self.data["method"].x[index - 10000] = self.embed(content)

    def load_tasks(self, tasks_path="tasks.json"):
        self.tasks = json.load(open(tasks_path))
        self.data["task"].x = torch.zeros(len(self.tasks), 768)
        for task_name, index in tqdm(self.tasks.items()):
            content = self.get_content_by_name("Task", task_name)
            self.data["task"].x[index - 100000] = self.embed(content)

    def load_relations(self, relations_path="kg_final.txt", user_favs_path="train.txt"):
        cites, applies, performs = [], [], []
        with open(relations_path, "r") as f:
            for line in f.readlines():
                a, r, b = map(int, line.strip().split())
                if r == 0:
                    cites.append((a, b))
                elif r == 1:
                    applies.append((a, b - 10000))  # method
                else:
                    performs.append((a, b - 100000))  # task
        self.data["paper", "cites", "paper"].edge_index = torch.tensor(cites).T
        self.data["paper", "applies", "method"].edge_index = torch.tensor(applies).T
        self.data["paper", "performs", "task"].edge_index = torch.tensor(performs).T
        self.load_user_favs(user_favs_path)

    def load_user_favs(self, relations_path="train.txt"):
        # relations
        favs = []
        self.data["user"].x = torch.zeros(
            len(open(relations_path, "r").readlines()), 768
        )
        for line in open(relations_path, "r"):
            line = list(map(int, line.strip().split()))
            user, papers = line[0], line[1:]
            favs.extend([(user, paper) for paper in papers])
            self.data["user"].x[user] = self.data["paper"].x[papers].mean(dim=0)
        self.data["user", "likes", "paper"].edge_index = torch.tensor(favs).T

    def load_all(self):
        self.load_papers()
        self.load_methods()
        self.load_tasks()
        self.load_relations()

    def get_near(self, arxiv_id: str, degs=1, limit=10):
        results = self.gs.query(
            f"MATCH (n:Paper{{arxivId: '{arxiv_id}'}})-[:CITES*{degs}]-(m:Paper) WHERE n.title IS NOT NULL AND n.title <> '' RETURN m LIMIT {limit}"
        )
        return [result["m"]["arxivId"] for result in results]


class GNN(torch.nn.Module):
    def __init__(
        self,
    ):
        super().__init__()
        self.conv1 = GATConv(768, 128, heads=8, add_self_loops=False)
        self.relu = torch.nn.ReLU()
        self.conv2 = GATConv(128 * 8, 768, heads=1, add_self_loops=False)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = self.relu(x)
        x = self.conv2(x, edge_index)
        return x


class GATPred(torch.nn.Module):
    def __init__(
        self,
        data: HeteroData,
    ):
        super().__init__()
        self.gnn = to_hetero(GNN(), metadata=data.metadata())

    def forward(self, x: HeteroData):
        x_dict = self.gnn(
            {
                "user": x["user"].x,
                "paper": x["paper"].x,
                "method": x["method"].x,
                "task": x["task"].x,
            },
            x.edge_index_dict,
        )
        edge_label_index = x["likes"].edge_label_index
        user_edge_features = x_dict["user"][edge_label_index[0]]
        paper_edge_features = x_dict["paper"][edge_label_index[1]]
        return torch.sum(user_edge_features * paper_edge_features, dim=-1)


def load_test_data(builder: DataBuilder, user_favs: list[str], limits=[50, 20]):
    test_data = HeteroData()
    papers = [builder.papers[p] for p in user_favs]
    print(papers)
    test_data["user"].x = builder.data["paper"].x[papers].mean(dim=0).unsqueeze(0)
    test_data["paper"].x = builder.data["paper"].x
    test_data["method"].x = builder.data["method"].x
    test_data["task"].x = builder.data["task"].x
    test_data["paper", "cites", "paper"].edge_index = builder.data[
        "paper", "cites", "paper"
    ].edge_index
    test_data["paper", "applies", "method"].edge_index = builder.data[
        "paper", "applies", "method"
    ].edge_index
    test_data["paper", "performs", "task"].edge_index = builder.data[
        "paper", "performs", "task"
    ].edge_index
    near_papers = []
    for deg, limit in enumerate(limits):
        for paper in user_favs:
            near_papers.extend(
                builder.get_near(
                    paper, limit=int(limit / len(papers)) + 1, degs=deg + 1
                )
            )
    near_papers = list(set(near_papers))
    print(near_papers)
    test_data["user", "likes", "paper"].edge_index = torch.tensor(
        [(0, builder.papers[p]) for p in near_papers if p in builder.papers]
    ).T
    test_data = T.ToUndirected()(test_data.to("cuda"))
    test_data["likes"].edge_label_index = test_data["likes"].edge_index
    print(test_data)
    return test_data


builder = DataBuilder()
builder.load_all()
data = T.ToUndirected()(builder.data.to("cuda"))
model = GATPred(data).to("cuda")
model.load_state_dict(torch.load("gat_pred.pth"))


def predict(user_favs: list[str], limits=[50, 20], nums=10):
    model.eval()
    with torch.no_grad():
        data = load_test_data(builder, user_favs, limits)
        pred = model(data)
    pred, labels = (
        pred.detach().cpu().numpy(),
        data["likes"].edge_index[1].detach().cpu().numpy(),
    )
    indices = pred.argsort()[-nums:][::-1]
    return [get_key_by_value(builder.papers, labels[i]) for i in indices]

@application.route("/predict", methods=["POST"])
def predict_handler():
    user_favs = request.json["user_favs"]
    return {"result": predict(user_favs)}


if __name__ == "__main__":
    # print(
    #     predict(
    #         ["1911.05248", "2104.05240", "1404.1356", "1808.09468"],
    #         limits=[50, 20],
    #         nums=10,
    #     )
    # )
    application.run(port=8093)
