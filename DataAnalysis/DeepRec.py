import torch
from torch.utils.data import Dataset
import weaviate
import neo4j


class DeepRec(torch.nn.Module):
    def __init__(self, paper_embedding, user_embedding):
        super().__init__()
        self.user2paper = torch.nn.Linear(user_embedding, paper_embedding)

    def forward(self, paper, user):
        user = self.user2paper(user)
        logit = (user * paper).sum(1, keepdims=True)
        return logit


