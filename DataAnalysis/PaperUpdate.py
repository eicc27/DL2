import sys
import torch
from torch_geometric.data import Data, DataLoader
from torch_geometric.nn import GCNConv
import torch.nn.functional as F
from transformers import DebertaModel, DebertaTokenizer
import weaviate
import neo4j
import json
from tqdm import tqdm
import os
import csv
import numpy as np


tokenizer = DebertaTokenizer.from_pretrained('s3://chore20307130030/Models/Tokenizer')
encoder = DebertaModel.from_pretrained('s3://chore20307130030/Models/Encoder')

model = torch.load('s3://chore20307130030/Models/BGCN.pt')

data = None

tasks = model.predict(sys.argv[0])
