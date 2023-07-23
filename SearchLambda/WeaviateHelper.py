import weaviate


class WeaviateHelper:
    def __init__(self, url="https://dl2-6ld8p0k2.weaviate.network", key="ugyXUyDB0ODDjlivf1URI9lQBCQEc1t8orke", api_key="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"):
        self.client = weaviate.Client(url=url, auth_client_secret=weaviate.AuthApiKey(
            api_key=key), additional_headers={'X-HuggingFace-Api-Key': api_key})

    def getNear(self, query):
        return self.client.query.get("Abstract", ["arxiv_id"]).with_near_text({"concepts": [query]}).with_limit(20).do()


if __name__ == '__main__':
    helper = WeaviateHelper()
    print(helper.getNear("Attention is all you need"))
