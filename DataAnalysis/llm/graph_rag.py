import json
from typing import Dict, List
from llama_index.llms.gemini import Gemini as GeminiLLM
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.core.prompts.prompt_type import PromptType
from llama_index.graph_stores.neo4j import Neo4jGraphStore
from llama_index.core import StorageContext, ServiceContext
from llama_index.core.query_engine import KnowledgeGraphQueryEngine
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.retrievers import KnowledgeGraphRAGRetriever
from llama_index.legacy.query_engine import KnowledgeGraphQueryEngine
from llama_index.core import Settings, PromptTemplate
import google.generativeai as genai
import os
from flask import Flask, request
from flask_cors import CORS

API_KEY = "AIzaSyBKuPcGeQEWnWunyMGneXaRH3ZiH8ufHaw"
# set the environment variable first
os.environ["GOOGLE_API_KEY"] = API_KEY
genai.configure(api_key=API_KEY)

# Settings.llm = llm
# Settings.embed_model = embed_model
# Settings.chunk_size = 512

# Prompt
DEFAULT_NEO4J_NL2CYPHER_PROMPT_TMPL = (
    "Task:Generate Cypher statement to query a graph database.\n"
    "Instructions:\n"
    "Use only the provided relationship types and properties in the schema.\n"
    "Do not use any other relationship types or properties that are not provided.\n"
    "Use ambiguous searching if necessary, and do not care about keyword capitalization. e.g. WHERE toLower(method.name) CONTAINS toLower('graph')."
    "If the user do not provide a specific property of the keyword, search it extensively among the different types of nodes. e.g.:\n"
    "Q: What is LoRA?\n"
    "A: MATCH (x: Method | Task | Paper)\n"
    "WHERE toLower(x.name) CONTAINS toLower('lora')\n"
    "OR (x:Paper AND toLower(x.title) CONTAINS toLower('lora'))\n"
    "RETURN x"
    "Always add limitations to the query, such as LIMIT 1, LIMIT 5, etc.\n"
    "Schema:\n"
    "{schema}\n"
    "Note: Do not include any explanations or apologies in your responses.\n"
    "Do not respond to any questions that might ask anything else than for you "
    "to construct a Cypher statement. \n"
    "Do not include any text except the generated Cypher statement.\n"
    "Write it in plain text, do not use any markdown or code formatting.\n"
    "\n"
    "The question is:\n"
    "{query_str}\n"
)

DEFAULT_KG_RESPONSE_ANSWER_PROMPT_TMPL = """
The original question is given below.
This question has been translated into a Graph Database query.
Both the Graph query and the response are given below.
Given the Graph Query response, synthesise a response to the original question.
Use as much information provided in the Graph Query response as possible to provide a detailed answer.
When possible, provide papers that are relevant to the original question as recommendations.

Original question: {query_str}
Graph query: {kg_query_str}
Graph response: {kg_response_str}
Response:
"""


class DL2Neo4jGraphStore(Neo4jGraphStore):
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
stc = StorageContext.from_defaults(graph_store=gs)
gq_synthesis_prompt = PromptTemplate(
    DEFAULT_NEO4J_NL2CYPHER_PROMPT_TMPL, prompt_type=PromptType.TEXT_TO_GRAPH_QUERY
)
kg_answer_prompt = PromptTemplate(
    DEFAULT_KG_RESPONSE_ANSWER_PROMPT_TMPL, prompt_type=PromptType.QUESTION_ANSWER
)
Settings.llm = llm
Settings.embed_model = embed_model
Settings.chunk_size = 512


retriever = KnowledgeGraphRAGRetriever(
    storage_context=stc,
    verbose=True,
    with_nl2graphquery=True,
    # these kwargs are necessary
    graph_query_synthesis_prompt=gq_synthesis_prompt,
    graph_response_answer_prompt=kg_answer_prompt,
)
qe = RetrieverQueryEngine.from_args(
    retriever=retriever,
)


def query(keyword: str):
    response = qe.query(
        keyword
    )
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

    # with open('llm/sample_metadata.json', 'w+') as f:
    #     json.dump(response.metadata, f, indent=4)
