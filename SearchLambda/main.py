from MysqlHelper import MysqlHelper
from WeaviateHelper import WeaviateHelper
import json

def handler(event, context):
    print(event)
    body: str = event['body']
    query = json.loads(body)['query']
    weaviateHelper = WeaviateHelper()
    results = weaviateHelper.getNear(query)['data']['Get']['Abstract']
    mysqlHelper = MysqlHelper()
    if results:
        paperIds = [i['arxiv_id'] for i in results]
        papers = mysqlHelper.getPaperByArxivIds(paperIds)
    else:
        papers = mysqlHelper.getPaperByTitle(query)
    return {
        'statusCode': 200,
        "isBase64Encoded": False,
        "headers": {
            "Content-Type": "application/json",
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
        },
        "body": json.dumps({
            "papers": papers
        })
    }

