from neo4j import GraphDatabase, Transaction
from neo4j.graph import Node

class Neo4JSearchHelper:
    def __init__(self, uri: str = 'neo4j+s://34f448f0.databases.neo4j.io',
                 user: str = 'neo4j',
                 pwd: str = 'K6RKUHHdvZA2iHaFYuErhmIhpNIRTRj-Mu5qbvNQAUk') -> None:
        self.driver = GraphDatabase.driver(uri, auth=(user, pwd))
    
    def close(self) -> None:
        self.driver.close()

    @staticmethod
    def _findByPaperId(tx: Transaction, paperId: str):
        result = tx.run("MATCH (p:Paper) WHERE p.paperId = $paperId RETURN p",
                        paperId=paperId)
        return result.single(strict=False)[0]

    def findByPaperId(self, paperId: str) -> Node:
        with self.driver.session() as session:
            return session.execute_read(self._findByPaperId, paperId)
    
    @staticmethod
    def _findNearbyPapers(tx: Transaction, paperIds: list[str]):
        result = tx.run("MATCH (p:Paper)-[:CITED]->(n:Paper) WHERE p.paperId IN $paperIds RETURN n",
                        paperIds=paperIds)
        return [record[0] for record in result]
    
    def findNearbyPapers(self, paperIds: list[str]) -> list[str]:
        with self.driver.session() as session:
            result = session.execute_read(self._findNearbyPapers, paperIds)
        # sort result by citedNum and limit to 5
        result.sort(key=lambda x: x.get('citedNum'), reverse=True)
        return [r.get('paperId') for r in result[:5]]

# test
if __name__ == '__main__':
    helper = Neo4JSearchHelper()
    result = helper.findByPaperId('1311.2524')
    print(result.get('paperId'))
    results = helper.findNearbyPapers(['1311.2524', '1406.1078', '1409.0473'])
    print(results)
    helper.close()