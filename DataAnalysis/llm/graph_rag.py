import json
from typing import Dict, List
from llama_index.llms.gemini import Gemini as GeminiLLM
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.core.prompts.prompt_type import PromptType
from llama_index.graph_stores.neo4j import Neo4jPropertyGraphStore
from llama_index.core.indices.property_graph import  TextToCypherRetriever
from llama_index.core.query_engine.retriever_query_engine import RetrieverQueryEngine
from llama_index.core import PropertyGraphIndex, QueryBundle
from llama_index.core import Settings, PromptTemplate

import google.generativeai as genai
import os
from flask import Flask, request
from flask_cors import CORS

API_KEY = os.environ.get("GOOGLE_API_KEY")
# set the environment variable first
os.environ["GOOGLE_API_KEY"] = API_KEY
genai.configure(api_key=API_KEY)

# Prompt
DEFAULT_NEO4J_NL2CYPHER_PROMPT_TMPL = (
    "Task: Neo4j Graph Query Synthesis\n"
    "Schema: {schema}\n"
    "Use only the provided relationship types and properties in the schema.\n"
    "Do not use any other relationship types or properties that are not provided.\n"
    "Use ambiguous searching if necessary, and do not care about keyword capitalization. e.g. WHERE toLower(method.name) CONTAINS toLower('graph')."
    "If the user do not provide a specific property of the keyword, search it extensively among the different types of nodes. e.g.:\n"
    "A: MATCH (x: Method | Task | Paper)\n"
    "WHERE toLower(x.name) CONTAINS toLower('name')\n"
    "OR (x:Paper AND toLower(x.title) CONTAINS toLower('name'))\n"
    "RETURN x"
    "Always add limitations to the query.\n"
    "Do not include any explanations or apologies in your responses.\n"
    "Do not respond to any questions that might ask anything else than for you "
    "to construct a Cypher statement. \n"
    "Do not include any text except the generated Cypher statement.\n"
    "Write it in plain text, do not use any markdown or code formatting.\n"
    "If user provides a question with a wide range of possible answers, "
    "sort the results by most cited papers and give a limit.\n"
    "Question: {question}\n"
)

DEFAULT_KG_RESPONSE_ANSWER_PROMPT_TMPL = """
    "Context information is below.\n"
    "---------------------\n"
    "{context_str}\n"
    "---------------------\n"
    "Given the context information and not prior knowledge, "
    "answer the query.\n"
    "Use of markdown is allowed. Provide links to necessary keywords 
    (e.g., if context contains arxiv id for certain papers, compose them as link to original paper in arxiv and provide the link within markdown for the papers) if needed.\n"
    "Note, the answer should be extensive, explaining the concepts and providing examples for methods and tasks.\n"
    "The answer should be natural and informative, without mentioning the queries done before.\n"
    "Do not forget that whenever possible(e.g. Asking for a method, answering for methods and tasks), provide the arxiv id link to relevant papers 
    (e.g. the original paper, or the paper that cited the original paper, or some paper that uses the method and applies the task) in markdown,
    even if the user did not ask for it.\n"
    "Query: {query_str}\n"
    "Answer: "
"""


class DL2Neo4jGraphStore(Neo4jPropertyGraphStore):
    def detect_subject_type(self, subj: str):
        paper_query = """
        MATCH (p:Paper)
        WHERE toLower(p.title) contains toLower("{}")
        RETURN p 
        """.format(
            subj
        )
        result = self.query(paper_query)
        print(result)
        if result:
            return "Paper", "title", result[0]["p"]["title"]
        task_query = """
        MATCH (t:Task)
        WHERE toLower(t.name) contains toLower("{}")
        return t
        """.format(
            subj
        )
        result = self.query(task_query)
        if result:
            return "Task", "name", result[0]["t"]["name"]
        method_query = """
        MATCH (m:Method)
        WHERE toLower(m.name) contains toLower("{}")
        return m
        """.format(
            subj
        )
        result = self.query(method_query)
        if result:
            return "Method", "name", result[0]["m"]["name"]
        raise ValueError("Subject not found in the DL2 database")

    def construct_query(self, subj: str, depth: int = 2, limit: int = 30):
        node_label, key_attr, subj = self.detect_subject_type(subj)
        return (
            f"""MATCH p=(n1:{node_label})-[*..{depth}]-(n2) """
            f"""WHERE toLower(n1.{key_attr}) = "{subj.lower()}" """
            """AND (NOT (n2:Paper) OR n2.title IS NOT NULL)"""  # filter out papers without title
            f"""RETURN p LIMIT {limit}"""
        )

    def get_rel_map(
        self, subjs: List[str] | None = None, depth: int = 1, limit: int = 5
    ):
        """
        Since we have a different data structure from which is constructed by the original Neo4jGraphStore,
        we need to override this method to get the correct relationship map.
        """
        rel_map = {}
        for subj in subjs:
            try:
                query = self.construct_query(subj, depth, limit)
            except ValueError:
                print(f"{subj} not found in the DL2 database, skipped")
                continue
            print("rel_map query: ", query)
            data = self.query(query)
            # with open('llm/sample_query_result.json', 'w+') as f:
            #     json.dump(data, f, indent=4)
            paths = [d["p"][1:] for d in data]
            paths = [p for p in paths if len(p) > 2]  # filter out empty paths
            rel_map[subj] = []
            for i, path in enumerate(paths):
                rel_map[subj].append([])
                for node in path:
                    if isinstance(node, str):
                        rel_map[subj][i].append(node)
                    elif "name" in node:
                        rel_map[subj][i].append(node["name"])
                    elif "title" in node:
                        rel_map[subj][i].append(node["title"])
        return rel_map


llm = GeminiLLM(api_key=API_KEY)
embed_model = GeminiEmbedding(api_key=API_KEY)
gs = DL2Neo4jGraphStore(
    username="neo4j",
    password="030108chen",
    url="bolt://localhost:7687",
    database="neo4j",
)
# stc = StorageContext.from_defaults(graph_store=gs)
gq_synthesis_prompt = PromptTemplate(
    DEFAULT_NEO4J_NL2CYPHER_PROMPT_TMPL, prompt_type=PromptType.TEXT_TO_GRAPH_QUERY
)
kg_answer_prompt = PromptTemplate(
    DEFAULT_KG_RESPONSE_ANSWER_PROMPT_TMPL, prompt_type=PromptType.QUESTION_ANSWER
)
Settings.llm = llm
Settings.embed_model = embed_model
Settings.chunk_size = 512

index = PropertyGraphIndex.from_existing(gs)
retriever = TextToCypherRetriever(gs, text_to_cypher_template=gq_synthesis_prompt)
qe = RetrieverQueryEngine.from_args(retriever, llm, text_qa_template=kg_answer_prompt)

def query(keyword: str):
    response = qe.query(keyword)
    return response


application = Flask(__name__)
CORS(application)


@application.route("/search", methods=["GET"])
def search():
    keyword = request.args.get("query")
    answer = query(keyword).response
    print(answer)
    return {"answer": answer}


# test
if __name__ == "__main__":
    application.run(port=8092)
    # nodes = retreiver.retrieve_from_graph(QueryBundle("Tell me about attention mechanism."))
    # [print(node.text) for node in nodes]
    # resp = qe.query("Tell me about attention mechanism.").response
    # print(resp)
    # with open('llm/sample_metadata.json', 'w+') as f:
    #     json.dump(response.metadata, f, indent=4)
