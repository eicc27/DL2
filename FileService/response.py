class Response:
    def __init__(self, code: int = 200, msg: str = "", data: dict = {}):
        self.code = code
        self.msg = msg
        self.data = data