from neo4j import GraphDatabase
import json
import collections

class load_data:

    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def load(self, path1, path2):
        with self.driver.session() as session:
            session.execute_write(self._load_data, path1, path2)

    @staticmethod
    def _load_data(tx, path1, path2):
        with open(path1, "r") as f:
            data1 = json.load(f)
        with open(path2, "r") as f:
            data2 = json.load(f)

        cited_num_dict = {item["arxiv_id"]: item["citations"] for item in data2}



        for item in data1:
            paperId1 = item[0]
            paperId2 = item[1]
            citedNum1 = cited_num_dict.get(paperId1, 0)  # 如果没找到，则默认值为0
            citedNum2 = cited_num_dict.get(paperId2, 0)

            query = """
                MERGE (a:Paper {paperId: $paperId1, citedNum: $citedNum1})
                MERGE (b:Paper {paperId: $paperId2, citedNum: $citedNum2})
                MERGE (a)-[:CITED]->(b)
                    """
            tx.run(query, paperId1=paperId1, citedNum1 = citedNum1, paperId2=paperId2, citedNum2 = citedNum2)

        # for node in data["nodes"]:
        #     query = """
        #         create (n:Node {id: $id, field: $field})
        #         """
        #     tx.run(query, id=node["id"], field=node["field"])

        # for edge in data["edges"]:
        #     query = """
        #         MATCH (n1:Node {id: $source})
        #         MATCH (n2:Node {id: $target})
        #         MERGE (n1)-[r:LINK]->(n2)
        #         """
        #     tx.run(query, source=edge["source"], target=edge["target"])

if __name__ == "__main__":
    greeter = load_data("bolt://localhost:7687", "neo4j", "Jise246808642")
    greeter.load("D://graph.json", "D://citations.json")
    greeter.close()
