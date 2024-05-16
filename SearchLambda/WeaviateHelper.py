import time
import requests.auth
import weaviate
import requests
import json
import google.generativeai as genai
from MysqlHelper import MysqlHelper
API_KEY = 'AIzaSyD0NpI_90atLTdjD7ODsEpPAWErX1UhPoc'
genai.configure(api_key=API_KEY)

# class WeaviateHelper:
#     def __init__(self, url="https://dl2-6ld8p0k2.weaviate.network", key=os.environ['WEAVIATE_API_KEY'], api_key=os.environ['HUGGINGFACE_API_KEY']):
#         self.client = weaviate.Client(url=url, auth_client_secret=weaviate.AuthApiKey(
#             api_key=key), additional_headers={'X-HuggingFace-Api-Key': api_key})

#     def getNear(self, query):
#         return self.client.query.get("Abstract", ["arxiv_id"]).with_near_text({"concepts": [query]}).with_limit(20).do()


class WeaviateGlmHelper:
    def __init__(self, port: int = 8090,  glm_token='AIzaSyD0NpI_90atLTdjD7ODsEpPAWErX1UhPoc', init=False) -> None:
        self.client = weaviate.connect_to_local(port=port, headers={
            'X-Google-Api-Key': glm_token,
            'X-PaLM-Api-Key': glm_token
        })
        papers = self.client.collections.get("Paper")
        if init:
            with open('schema.json') as f:
                requests.delete(f"http://localhost:{port}/v1/schema/Paper")
                result = requests.post(
                    f"http://localhost:{port}/v1/schema", json=json.load(f))
                print(result.json())
        self.papers_schema = papers
        self.mysql_helper = MysqlHelper(url='localhost', user='chan',
                                        pwd='030108', db='dl2')

    def insert_paper(self, title: str, abs: str, id: str):
        for item in self.papers_schema.iterator():
            if item.properties['arxiv_id'] == id:
                return
        return self.papers_schema.data.insert({
            "title": title,
            "abstract": abs,
            "arxiv_id": id
        })

    def insert_papers(self, start=0, count=1200):
        papers = self.mysql_helper.getPapers(start=start, count=count)
        for i, (title, abstract, id) in enumerate(papers):
            self.insert_paper(title, abstract, id)
            print(f"Inserted {title}, {i + 1}/{len(papers)}")

    def search(self, query: str) -> list[dict[str, str]]:
        self.mysql_helper = MysqlHelper(url='localhost', user='chan',
                                        pwd='030108', db='dl2')
        response = self.papers_schema.query.near_text(
            query=query, distance=0.5, limit=50)
        return self.mysql_helper.getPaperByArxivIds([o.properties['arxiv_id'] for o in response.objects])

    def close(self):
        self.client.close()


def create_paper_schema(wv_url: str, wv_token: str):
    with open('schema.json') as f:
        resp = requests.post(wv_url, headers={
            "Authorization": f"Bearer {wv_token}"
        }, json=json.load(f))
    return resp.json()


if __name__ == '__main__':
    wv_url = 'https://dl2-yj8nf7pd.weaviate.network'
    wv_token = 'IGMJX7aEBo9GyUEEuuzKEKVE6i0fZ9RLjrKu'
    glm_token = 'AIzaSyD0NpI_90atLTdjD7ODsEpPAWErX1UhPoc'
    # create_paper_schema(wv_url, wv_token)
    helper = WeaviateGlmHelper(init=False)
    for start in range(1200, 2401, 1200):
        helper.insert_papers(start=start, count=1200)
        time.sleep(3700) # 1 hour 
    # helper.search("attention is all you need")
    helper.close()
