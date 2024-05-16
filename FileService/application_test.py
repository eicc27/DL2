from flask import Flask, request
from flask_cors import CORS
import os


def walk(root="users/"):
    dirs = [root]
    for root, dirs, files in os.walk(root):
        for file in files:
            dirs.append(os.path.join(root, file))
        for dir in dirs:
            dirs.append(os.path.join(root, dir))


application = Flask(__name__)
CORS(application)  # This will enable CORS for all routes


@application.route("/fs", methods=["POST"])
def get_filesystem():
    print(request.json)
    user_id = request.json["userId"]
    is_new = not os.path.exists(f"users/{user_id}")
    print(is_new)
    if is_new:
        os.mkdir(f"users/{user_id}")
    # this lists all objects in the bucket
    # add root directory
    dirs_with_type = [{"name": f"{user_id}", "type": "folder"}]
    for root, dirs, files in os.walk(f"users/{user_id}"):
        root = root.split("users/")[-1]
        for file in files:
            dirs_with_type.append({"name": os.path.join(root, file), "type": "file"})
        for dir in dirs:
            dirs_with_type.append({"name": os.path.join(root, dir), "type": "folder"})
    print(dirs_with_type)
    return {
        "code": 200,
        "msg": "ask for root directory",
        "data": {
            "new": is_new,
            "userId": user_id,
            "dirs": dirs_with_type,
        },
    }


@application.route("/open", methods=["POST"])
def openFile():
    path = request.json["path"]
    print("open path: ", path)
    user_id = os.path.split(path)[0]
    try:
        data = open(os.path.join("users", path), 'r').read()
        return {
            "code": 200,
            "msg": "open file",
            "data": {"userId": user_id, "path": path, "content": data},
        }
    except Exception as e:  # tried to open a binary file
        try:
            return {
                "code": 201,
                "msg": "binary file",
                "data": {
                    "userId": user_id,
                    "path": path,
                    "content": "This is a binary file.",
                },
            }
        except Exception as e:  # file not exist
            print(e)
            return {
                "code": 400,
                "msg": "file not exist",
                "data": {"userId": user_id, "path": path, "content": ""},
            }


@application.route("/add", methods=["POST"])
def addFile():
    if request.is_json:
        type = request.json["type"]
        name = request.json["name"]
        parent = request.json["parent"]
    else:
        type = request.form["type"]
        name = request.form["name"]
        parent = request.form["parent"]
    try:
        print(f"new object: {parent}{name}/")
        fname = f"users/{parent}{name}"
        if type == 'folder':
            os.mkdir(fname)
        elif type == 'file':
            open(fname, 'w').close()
        else:
            file = request.files['file']
            file.save(fname)
        return {
            "code": 200,
            "msg": "add file",
            "data": {"type": type, "name": name, "parent": parent},
        }
    except Exception as e:
        print(e)
        return {
            "code": 400,
            "msg": "add file failed",
            "data": {"type": type, "name": name, "parent": parent},
        }


@application.route("/save", methods=["POST"])
def saveFile():
    path = request.json["path"]
    text = request.json["text"]
    user_id = request.json["userId"]
    print(request.json)
    try:
        open(os.path.join("users", path), 'w').write(text)
        return {
            "code": 200,
            "msg": "save file",
            "data": {"path": path, "userId": user_id},
        }
    except Exception as e:
        print(e)
        return {
            "code": 400,
            "msg": "save file failed",
            "data": {"path": path, "userId": user_id},
        }


@application.route("/copy", methods=["POST"])
def copyFile():
    user_id = request.json["userId"]
    dataset = request.json["dataset"]
    dataset_path = os.path.join(dataset, 'public') + '/'
    path = os.path.join(user_id, 'datacomp', dataset) + '/'
    try:
        # first list objects in dataset_path
        dirs = s3.list_objects_v2(
            Bucket=BUCKET_NAME, Prefix=dataset_path)["Contents"]
        for dir in dirs:
            if dir['Key'] == dataset_path:
                continue
            s3.copy_object(Bucket=BUCKET_NAME, CopySource={
                           'Bucket': BUCKET_NAME, 'Key': dir['Key']}, Key=f"{path}{dir['Key'].split('/')[-1]}")
        return {
            "code": 200,
            "msg": "copy file",
            "data": {"path": path, "userId": user_id},
        }
    except Exception as e:
        print(e)
        return {
            "code": 400,
            "msg": "copy file failed",
            "data": {"path": path, "userId": user_id},
        }


if __name__ == "__main__":
    application.run(host='0.0.0.0', port=5000)
