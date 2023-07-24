import json
import boto3
import urllib.parse

s3 = boto3.client('s3')

def handler(event, context):
    print(event)
    return event