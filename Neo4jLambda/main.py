from MysqlHelper import MysqlHelper
from N4JHelper import Neo4JSearchHelper
import json


def handler(event, context):
    print(event)
    body: str = event['body']
    paperId = json.loads(body)['query']
    n4jHelper = Neo4JSearchHelper()
    paperIds = n4jHelper.findNearbyPapers(paperId)
    n4jHelper.close()
    mysqlHelper = MysqlHelper()
    papers = mysqlHelper.getPaperByArxivIds(paperIds)
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
