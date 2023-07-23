from faker import Faker
import random
from tqdm import tqdm
import os
import json
from scipy.stats import beta, nbinom

path = "D://Data"

al = 2
be = 30

trial = 2
pr = 0.4

fake = Faker()

fields = {}
papers = []

for f in tqdm(os.listdir(path)):
    p = path + '/' + f
    with open(p, 'r', encoding='utf-8') as subFiles:
        subFiles = json.load(subFiles)
        for i in subFiles['tasks']:
            if i['name'] not in fields:
                fields[i['name']] = 1
            else:
                fields[i['name']] += 1

fields = set([i for i in fields if fields[i] >= 15])
print(len(fields))

for f in tqdm(os.listdir(path)):
    p = path + '/' + f
    with open(p, 'r', encoding='utf-8') as subFiles:
        subFiles = json.load(subFiles)
        paper = {'arxiv_id': subFiles['id'], 'task': [], 'citations': subFiles['citations']}
        for i in subFiles['tasks']:
            if i['name'] in fields:
                paper['task'].append(i['name'])
        papers.append(paper)

users = []
follow = []

for i in tqdm(range(10000)):
    user = {
        'name': fake.unique.user_name(),
        'email': fake.unique.email(),
        'favorite_field': random.sample(list(fields), 1 + nbinom.rvs(10, 0.8)),
        'viewed_papers': [],
        'followers': 0
    }
    users.append(user)


def jaccard(a, b):
    temp1 = set(a)
    temp2 = set(b)
    return len(temp1.union(temp2)) / ((len(temp1) + len(temp2) - len(temp1.intersection(temp2))) + 0.00001)


for u in tqdm(users):
    diligent = beta.rvs(al, be)
    for p in papers:
        reputation = p['citations'] / 9999
        near = jaccard(p['task'], u['favorite_field']) + 0.00001
        prob = diligent * reputation * near
        if random.random() < prob:
            if random.random() < reputation * near:
                u['viewed_papers'].append((p['arxiv_id'], 2))
            else:
                u['viewed_papers'].append((p['arxiv_id'], 1))

for i in tqdm(range(1000000)):
    user1, user2 = random.sample(users, 2)
    prob = (jaccard(user1['favorite_field'], user2['favorite_field']) + jaccard(user1['viewed_papers'],
                                                                                user2['viewed_papers'])) / 2
    p1 = user1['followers'] / (len(follow) * 2 + 0.00001) + len(user1['viewed_papers']) / len(papers)
    p2 = user2['followers'] / (len(follow) * 2 + 0.00001) + len(user2['viewed_papers']) / len(papers)

    if random.random() < (prob + p2) / 2:
        follow.append((user1['name'], user2['name']))
        user2['followers'] += 1
    if random.random() < (prob + p1) / 2:
        follow.append((user2['name'], user1['name']))
        user1['followers'] += 1

print(sum([len(u['viewed_papers']) for u in users]) / len(users), len(follow))

with open('sim_user.json', 'w') as f:
    json.dump(users, f)

with open('sim_follow.json', 'w') as g:
    json.dump(follow, g)
