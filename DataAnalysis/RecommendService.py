from flask import Flask, request
from flask_restful import Resource, Api
import weaviate
import numpy as np
import json
import os

app = Flask(__name__)
api = Api(app)

client = weaviate.Client(
    url='https://dl2-6ld8p0k2.weaviate.network',
    auth_client_secret=weaviate.AuthApiKey(api_key=os.getenv('WEAVIATE_API_KEY')),
    additional_headers={
        "X-huggingFace-Api-Key": os.getenv('HF_API_KEY'),
    }
)


def cosine_similarity(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))


def get_text_vec(arxiv_list):
    cond = [{"path": ["arxiv_id"], "operator": "Equal", "valueText": aid['arxiv_id']} for aid in arxiv_list]
    return [{'arxiv_id': object['arxiv_id'], 'text_vec': np.array(object['_additional']['vector'])} for object in
            client.query.get("Abstract", ["arxiv_id"]).with_where({
                "operator": "Or", "operands": cond
            }).with_additional("vector").do()['data']['Get']['Abstract']]


def get_graph_vec(arxiv_list):
    cond = [{"path": ["arxiv_id"], "operator": "Equal", "valueText": aid['arxiv_id']} for aid in arxiv_list]
    return [{'arxiv_id': object['arxiv_id'], 'text_vec': np.array(object['_additional']['vector'])} for object in
            client.query.get("Graph", ["arxiv_id"]).with_where({
                "operator": "Or", "operands": cond
            }).with_additional("vector").do()['data']['Get']['Abstract']]


'''
Input: {"recent":[{"arxiv_id":..,"score":..}], "candidates":[{"arxiv_id":..,"citations":..}], "field":[{"name":..}]}
Output: ["results":{"arxiv_id":..}]
'''


@app.route("/rec", methods=["POST"])
def post():
    recent = request.json['recent']
    scores = {i['arxiv_id']: i['score'] for i in recent}
    print(scores)
    r_vec = get_text_vec(recent)
    r_gvec = get_graph_vec(recent)
    print([r['arxiv_id'] for r in r_vec])
    candidates = request.json['candidates']
    citations = {i['arxiv_id']: i['citations'] for i in candidates}
    print(citations)
    c_vec = get_text_vec(candidates)
    c_gvec = get_graph_vec(candidates)
    print([c['arxiv_id'] for c in c_vec])
    result = []
    for c in c_vec:
        score = 0
        for r in r_vec:
            score += scores[r['arxiv_id']] * cosine_similarity(r['text_vec'], c['text_vec']) + np.log(citations[c['arxiv_id']])
        result.append({'arxiv_id': c['arxiv_id'], 'score': score})
    winner = sorted(result, key=lambda x: x['score'], reverse=True)
    return json.dumps({"results": [{'arxiv_id': i['arxiv_id']} for i in winner[:5]]})


if __name__ == '__main__':
    app.run(debug=True, port=1145)
