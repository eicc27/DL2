from flask import Flask, request
from flask_cors import CORS
from WeaviateHelper import WeaviateGlmHelper
from MysqlHelper import MysqlHelper

application = Flask(__name__)
CORS(application)  # This will enable CORS for all routes
helper = WeaviateGlmHelper()


@application.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')
    papers = helper.search(query)
    return {
        "papers": papers
    }


if __name__ == "__main__":
    application.run(port=8091)
