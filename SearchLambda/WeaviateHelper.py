import time
import weaviate
import google.generativeai as genai
from MysqlHelper import MysqlHelper
import os


API_KEY = os.environ.get("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)


class WeaviateGlmHelper:
    def __init__(
        self,
        port: int = 8090,
        glm_token=API_KEY,
        init=False,
    ) -> None:
        self.client = weaviate.connect_to_local(
            port=port,
            headers={"X-Google-Studio-Api-Key": glm_token, "X-Palm-Api-Key": glm_token},
        )
        if init:
            self.client.collections.delete("Paper")
            self.client.collections.create(
                "Paper",
                vectorizer_config=[weaviate.classes.config.Configure.NamedVectors.text2vec_google(
                    name="dl2",
                    project_id="961837247520",
                    source_properties=["title", "abstract"],
                    model_id="embedding-001",
                    api_endpoint="generativelanguage.googleapis.com",
                )],
                properties=[
                    weaviate.classes.config.Property(
                        name="title",
                        data_type=weaviate.classes.config.DataType.TEXT,
                    ),
                    weaviate.classes.config.Property(
                        name="abstract",
                        data_type=weaviate.classes.config.DataType.TEXT,
                    ),
                    weaviate.classes.config.Property(
                        name="arxiv_id",
                        data_type=weaviate.classes.config.DataType.TEXT,
                        skip_vectorization=True,
                    ),
                ],
            )
        papers = self.client.collections.get("Paper")
        self.papers_schema = papers
        self.mysql_helper = MysqlHelper(
            url="localhost", user="chen", pwd="030108", db="dl2"
        )

    def insert_paper(self, title: str, abs: str, id: str):
        for item in self.papers_schema.iterator():
            if item.properties["arxiv_id"] == id:
                return
        return self.papers_schema.data.insert(
            {"title": title, "abstract": abs, "arxiv_id": id}
        )

    def insert_papers(self, start=0, count=1200):
        papers = self.mysql_helper.getPapers(start=start, count=count)
        for i, (title, abstract, id) in enumerate(papers):
            self.insert_paper(title, abstract, id)
            print(f"Inserted {title}, {i + 1}/{len(papers)}")
            time.sleep(2)

    def search(self, query: str) -> list[dict[str, str]]:
        self.mysql_helper = MysqlHelper(
            url="localhost", user="chen", pwd="030108", db="dl2"
        )
        response = self.papers_schema.query.near_text(
            query=query, distance=0.5, limit=50
        )
        return self.mysql_helper.getPaperByArxivIds(
            [o.properties["arxiv_id"] for o in response.objects]
        )

    def close(self):
        self.client.close()


if __name__ == "__main__":
    glm_token = API_KEY    
    helper = WeaviateGlmHelper(init=False)
    for start in range(0, 4801, 1200):
        helper.insert_papers(start=start, count=1200)
        time.sleep(3700)  # 1 hour
    # helper.search("attention is all you need")
    helper.close()
