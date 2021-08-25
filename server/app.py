import threading
import serial_coms
import door
print("Python Server")
serial_coms.run()

from flask import Flask, config, request
from flask_cors import CORS

app = Flask(__name__, static_url_path='', static_folder='../ui/build/')
CORS(app)

@app.route("/start")
def start_process():
    print("Starting process", request.query_string)

    config = {
        "fan": request.args.get("fan", default=0, type=int), # in seconds, 0 is auto
        "uv": request.args.get("uv", default=300, type=int), # in seconds
        "concurrent": request.args.get("concurrent") is not None,
        "ignore_door": request.args.get("ignore_door") is not None
    }

    return config

@app.route("/stop")
def stop_process():
    print("Stopping process", request.query_string)
    return "ok\n"

@app.route("/door")
def get_door():
    print("Get door status", door.doorStatus)
    return "open" if door.doorStatus else "close"

def run():
    print("Running Serial Run time")


runner = threading.Thread(target=run)
runner.start()