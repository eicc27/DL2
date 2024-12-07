import random
from time import sleep
from llama_index.graph_stores.neo4j import Neo4jGraphStore
import weaviate
import json
import os

glm_token = os.environ.get("GOOGLE_API_KEY")
print(glm_token)
gs = Neo4jGraphStore(
    username="neo4j",
    password="030108chen",
    url="bolt://localhost:7687",
    database="neo4j",
)
client = weaviate.connect_to_local(
    port=8090,
    headers={"X-Google-Studio-Api-Key": glm_token, "X-Palm-Api-Key": glm_token},
)
papers_schema = client.collections.get("Paper")


def get_num_of_papers_with_top_n_tasks(n: int) -> int:
    query = f"""
    match r=(t:Task)--() with count(r) as num, t order by num  desc limit {n} with t
    match (p:Paper)--(t) where p.title is not null return count(distinct(p)) as num
    """
    return gs.query(query)[0]["num"]


def query_ratios():
    total_of_papers = gs.query(
        "MATCH (n:Paper) WHERE n.title IS NOT NULL RETURN count(distinct(n)) as num"
    )[0]["num"]
    print("total of papers:", total_of_papers)
    top_ns = list(range(1, 6)) + list(range(10, 101, 10))
    result = []
    for n in top_ns:
        num = get_num_of_papers_with_top_n_tasks(n)
        print(
            f"Number of papers with top {
              n} methods ratio: {num/total_of_papers:.2f}"
        )
        result.append([n, num / total_of_papers])
    print(result)


def get_top_n_tasks(n: int) -> list[tuple[str, int]]:
    query = f"""
    match r=(t:Task)--() with count(r) as num, t return t.name as name, num order by num desc limit {n}
    """
    return [[q["name"], q["num"]] for q in gs.query(query)]


def sample_by_exponential_decrease(limit: int, p=0.9) -> int:
    for i in range(1, limit + 1):
        if random.random() > p:
            return i
        p *= p
    return limit


def distinct(a: list[any]) -> dict[any, int]:
    result = {}
    for i in a:
        if i in result:
            result[i] += 1
        else:
            result[i] = 1
    return result


def get_ranked_papers_by_task(task: str, ref_coef=0.25, limit=100):
    query = f"""
match (p:Paper)-[:PERFORMS]->(t:Task) where t.name = $task and p.title is not null
with p
match citations=(p)<-[:CITES]-(), references=()<-[:CITES]-(p)
with count(citations) as c, count(references) as r, p
with c + r * $coef as rank, p
return p.arxivId as id, rank
order by rank desc
limit $limit
"""
    result = gs.query(query, {"task": task, "coef": ref_coef, "limit": limit})
    return [[r["id"], r["rank"]] for r in result]


def sample_by_distribution(items: list[str], ranks: list[float], num: int) -> list[str]:
    if sum(ranks) == 0:
        return random.sample(items, num)
    probs = [r / sum(ranks) for r in ranks]
    result = []
    for _ in range(num):
        result.append(random.choices(items, probs)[0])
    return result


def simulate_reader_favourites(fav_task: str, limit: int = 10):
    limit = sample_by_exponential_decrease(limit)
    papers = get_ranked_papers_by_task(fav_task, ref_coef=0.1, limit=100)
    favs = sample_by_distribution([p[0] for p in papers], [p[1] for p in papers], 1)
    print(f"User likes {fav_task} and favours {favs[0]}")
    for _ in range(limit - 1):
        last_fav = favs[-1]
        # we get new favs by embeddings
        papers = papers_schema.query.near_text(
            last_fav, distance=0.5, limit=10, return_metadata=["distance"]
        )
        sleep(2) # avoid rate limit
        favs.extend(
            sample_by_distribution(
                [p.properties["arxiv_id"] for p in papers.objects],
                [p.metadata.distance for p in papers.objects],
                1,
            )
        )
    return favs


def read_generation_hist():
    hist = {}
    if os.path.exists("user_favs.json"):
        with open("user_favs.json") as f:
            hist = json.load(f)
    if not len(list(hist.keys())):
        total = -1
    else:
        total = max([int(k) for k in list(hist.keys())])
    return hist, total


def simulate_users_favourites(num_users: int):
    hist, total = read_generation_hist()
    i = total + 1
    tasks = get_top_n_tasks(50)
    rand_tasks = sample_by_distribution(
        [t[0] for t in tasks], [t[1] for t in tasks], num_users
    )
    for j, task in enumerate(rand_tasks):
        try:
            favs = simulate_reader_favourites(task, 10)
            hist[i] = favs
            print(f"User {i} favs: {favs}")
            i += 1
        except Exception as e:
            print(f"Generated {j + 1} users.")
            with open("user_favs.json", "w+") as f:
                json.dump(hist, f, indent=4)
            print("Error occurred, saved history.")
            print(e)
            exit(1)
    print(f"Generated {num_users} users.")
    with open("user_favs.json", "w+") as f:
        json.dump(hist, f, indent=4)


def sample_num_requests():
    # ME: ~ 350 users per 1200 reqs/hour
    r = []
    total = 0
    for k, v in distinct(
        [sample_by_exponential_decrease(10, 0.9) for _ in range(1000000)]
    ).items():
        total += k * v
        r.append([k, v])
    print(r)
    print(1200 / (total / 1000000))
    return r


def write_paper_kg(base_dir="."):
    query = """
MATCH (p1:Paper)-[r:CITES]->(p2:Paper)
WHERE p1.title IS NOT NULL AND p2.title IS NOT NULL AND p1.title <> "" AND p2.title <> ""
RETURN p1, p2
"""
    result = gs.query(query)
    papers = {}
    i = 0
    for r in result:
        from_paper = r["p1"]["arxivId"]
        to_paper = r["p2"]["arxivId"]
        if from_paper not in papers:
            papers[from_paper] = i
            i += 1
        if to_paper not in papers:
            papers[to_paper] = i
            i += 1
    with open(os.path.join(base_dir, "kg_final.txt"), "w+") as f:
        for r in result:
            from_paper = papers[r["p1"]["arxivId"]]
            to_paper = papers[r["p2"]["arxivId"]]
            f.write(f"{from_paper} 0 {to_paper}\n")
    with open("papers.json", "w+") as f:
        json.dump(papers, f, indent=4)


def write_method_kg(base_dir="."):
    query = """
MATCH (p1:Paper)-[r:APPLIES]->(m:Method)
WHERE p1.title IS NOT NULL AND p1.title <> ""
RETURN p1, m
"""
    result = gs.query(query)
    with open("papers.json") as f:
        paper_mappings = json.load(f)
    method_mappings = {}
    im = 10000
    ip = max(paper_mappings.values()) + 1
    for r in result:
        paper = r["p1"]["arxivId"]
        method = r["m"]["name"]
        if paper not in paper_mappings:
            paper_mappings[paper] = ip
            ip += 1
        if method not in method_mappings:
            method_mappings[method] = im
            im += 1
    with open(os.path.join(base_dir, "kg_final.txt"), "a+") as f:
        for r in result:
            paper = paper_mappings[r["p1"]["arxivId"]]
            method = method_mappings[r["m"]["name"]]
            f.write(f"{paper} 1 {method}\n")
    with open("papers.json", "w+") as f:
        json.dump(paper_mappings, f, indent=4)
    with open("methods.json", "w+") as f:
        json.dump(method_mappings, f, indent=4)


def write_task_kg(base_dir="."):
    query = """
MATCH (p1:Paper)-[r:PERFORMS]->(m:Task)
WHERE p1.title IS NOT NULL AND p1.title <> ""
RETURN p1, m
"""
    result = gs.query(query)
    with open("papers.json") as f:
        paper_mappings = json.load(f)
    task_mappings = {}
    im = 100000
    ip = max(paper_mappings.values()) + 1
    for r in result:
        paper = r["p1"]["arxivId"]
        task = r["m"]["name"]
        if paper not in paper_mappings:
            paper_mappings[paper] = ip
            ip += 1
        if task not in task_mappings:
            task_mappings[task] = im
            im += 1
    with open(os.path.join(base_dir, "kg_final.txt"), "a+") as f:
        for r in result:
            paper = paper_mappings[r["p1"]["arxivId"]]
            task = task_mappings[r["m"]["name"]]
            f.write(f"{paper} 2 {task}\n")
    with open("papers.json", "w+") as f:
        json.dump(paper_mappings, f, indent=4)
    with open("tasks.json", "w+") as f:
        json.dump(task_mappings, f, indent=4)


def write_training_data(base_dir="."):
    with open("papers.json") as f:
        paper_mappings = json.load(f)
    with open("user_favs.json") as f:
        user_favs = json.load(f)
    with open(os.path.join(base_dir, "train.txt"), "w+") as f:
        for user, favs in user_favs.items():
            favs = [str(paper_mappings[f]) for f in favs]
            f.write(f"{user} {' '.join(favs)}\n")


def write_testing_data(base_dir="."):
    with open("papers.json") as f:
        paper_mappings = json.load(f)
    with open("user_favs.json") as f:
        user_favs = json.load(f)
    with open(os.path.join(base_dir, "test.txt"), "w+") as f:
        for user, favs in user_favs.items():
            papers = [str(paper_mappings[f]) for f in favs]
            if len(papers) < 2:
                continue
            favs = random.sample(papers, random.randint(1, len(papers) - 1))
            f.write(f"{user} {' '.join(favs)}\n")


def write_kg():
    write_paper_kg()
    write_method_kg()
    write_task_kg()


def write_data():
    write_training_data()
    write_testing_data()


def get_wv_item_by_arxiv_id(arxiv_id: str):
    for item in papers_schema.iterator():
        if item.properties["arxiv_id"] == arxiv_id:
            return item


def get_most_referenced_papers(arxiv_id: str, limit=10):
    query = f"""
MATCH (p1:Paper)--(p2:Paper)
WHERE p1.arxivId = $arxiv_id AND p2.title IS NOT NULL
RETURN p2.arxivId as id, p2.citedNum as num
ORDER BY num DESC
LIMIT {limit}
"""
    result = gs.query(query, {"arxiv_id": arxiv_id})
    return [[r["id"], r["num"]] for r in result]


def enhance_user_data(from_id=-1):
    with open("user_favs.json") as f:
        user_favs = json.load(f)
    for user, favs in list(user_favs.items()):
        if int(user) < from_id:
            continue
        # enhance the favs by offline queries
        print("User", user)
        new_favs = [f for f in favs]
        for fav in favs:
            ps = get_most_referenced_papers(fav)
            if not len(ps):
                continue
            new_favs.extend(
                sample_by_distribution([p[0] for p in ps], [p[1] for p in ps], 1)
            )
        user_favs[user] = list(set(favs))
    with open("user_favs.json", "w+") as f:
        json.dump(user_favs, f, indent=4)


if __name__ == "__main__":
    r = [sample_num_requests() for _ in range(100)]
    print(r)
    write_kg()
    simulate_users_favourites(350)
    write_data()
    enhance_user_data()
