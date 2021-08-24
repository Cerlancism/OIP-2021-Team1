import threading
import serial_coms

import components

print("Python Server")

serial_coms.run()

from flask import Flask, config, request
from flask_cors import CORS

app = Flask(__name__, static_url_path="", static_folder="../ui/build/")
CORS(app)


@app.route("/start")
def start_process():
    print("Starting process", request.query_string)

    config = {
        "fan": request.args.get("fan", default=0, type=int),  # in seconds, 0 is auto
        "uv": request.args.get("uv", default=300, type=int),  # in seconds
        "concurrent": request.args.get("concurrent") is not None,
        "ignore_door": request.args.get("ignore_door") is not None,
    }

    return config


@app.route("/stop")
def stop_process():
    print("Stopping process", request.query_string)
    return "ok\n"


@app.route("/door")
def get_door():
    status = components.get_sensors().get("door")
    print("Get door status", status)
    return "open" if status < 350 else "close"


@app.route("/fan")
def fan():
    state = None
    if request.args.get("on") is not None:
        state = True
    if request.args.get("off") is not None:
        state = False
    components.set_fan(state)
    message = "fan: " + str(state) + "\n"
    print(message)
    return message


@app.route("/uv")
def uv():
    state = None
    if request.args.get("on") is not None:
        state = True
    if request.args.get("off") is not None:
        state = False
    components.set_fan(state)
    message = "uv: " + str(state) + "\n"
    print(message)
    return message


def run():
    print("Running Serial Run time")


runner = threading.Thread(target=run)
runner.start()
