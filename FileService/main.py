from flask import Flask, request, jsonify
from flask_cors import CORS
from constants import USER_BASEDIR
from response import Response
import os
import jedi

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes


@app.route("/fs", methods=["POST"])
def get_filesystem():
    def get_dirs_with_type(base_dir: str, dirs: list[str]):
        dirs_with_type = []
        for d in dirs:
            actual_dir = os.path.join(base_dir, d)
            if os.path.isfile(actual_dir):
                dirs_with_type.append({"name": d, "type": "file"})
            elif os.path.isdir(actual_dir):
                dirs_with_type.append({"name": d, "type": "dir"})
        return dirs_with_type

    user_id = request.json["userId"]
    is_new = False
    if not os.path.exists(USER_BASEDIR + user_id):
        os.mkdir(USER_BASEDIR + user_id)
        is_new = True
    base_dir = USER_BASEDIR + user_id
    if "parent" not in request.json:  # request of root directory
        dirs = os.listdir(base_dir)
        dirs_with_type = get_dirs_with_type(base_dir, dirs)
        return {
            "code": 200,
            "msg": "ask for root directory",
            "data": {
                "new": is_new,
                "userId": user_id,
                "parent": f"{user_id}",
                "dirs": dirs_with_type,
            },
        }
    else:
        parent = request.json["parent"]
        base_dir = "users/" + parent
        dirs = os.listdir(base_dir)
        dirs_with_type = get_dirs_with_type(base_dir, dirs)
        return {
            "code": 200,
            "msg": "ask for non-root directory",
            "data": {
                "new": is_new,
                "userId": user_id,
                "parent": parent,
                "dirs": dirs_with_type,
            },
        }


@app.route("/open", methods=["POST"])
def openFile():
    path = request.json["path"]
    print(path)
    uesr_id = request.json["userId"]
    try:
        with open(f"users/{path}", "r") as f:
            lines = f.read()
        print(lines)
        return {
            "code": 200,
            "msg": "open file",
            "data": {"userId": uesr_id, "path": path, "content": lines},
        }
    except Exception as e:  # tried to open a binary file
        try:
            f = open(path, "rb")
            f.close()
            return {
                "code": 201,
                "msg": "binary file",
                "data": {
                    "userId": uesr_id,
                    "path": path,
                    "content": "This is a binary file.",
                },
            }
        except Exception as e:  # file not exist
            print(e)
            return {
                "code": 400,
                "msg": "file not exist",
                "data": {"userId": uesr_id, "path": path, "content": ""},
            }


@app.route("/suggestion", methods=["POST"])
def getSuggestion():
    row = request.json["row"]
    col = request.json["col"]
    text = request.json["text"]
    script = jedi.Script(text)
    completions = script.complete(row, col)
    return {
        "code": 200,
        "msg": "get suggestion",
        "data": {"completions": [c.name for c in completions]},
    }


if __name__ == "__main__":
    app.run(port=5000)
