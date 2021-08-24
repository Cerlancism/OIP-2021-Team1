
import time
import threading

import components

from context import Context

print("Python Server")

from flask import Flask, config, request
from flask_cors import CORS

app = Flask(__name__, static_url_path="", static_folder="../ui/build/")
CORS(app)

context: Context = None

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

@app.route("/ping")
def ping():
    print("Ping")
    return "ok"

@app.route("/stop")
def stop_process():
    print("Stopping process", request.query_string)
    return "ok\n"


@app.route("/door")
def get_door():
    status = components.get_sensors().get("door")
    print("Get door status", status)
    return "open" if status < 350 else "close"


@app.route("/motor")
def motor():
    state = None
    if request.args.get("on") is not None:
        state = True
    if request.args.get("off") is not None:
        state = False
    components.set_motor(state)
    message = "motor: " + str(state) + "\n"
    print(message)
    return message

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
    components.set_uv(state)
    message = "uv: " + str(state) + "\n"
    print(message)
    return message

@app.route("/sensors")
def sensors():
    return components.get_sensors()

def start_session():
    global context
    context = Context()
    context.thread = threading.Thread(target=heartbeat)
    context.thread  = True
    context.thread.start()

def stop_session():
    global context
    if context is not None:
        context.running = False
        context.thread.join()
        print("headbeat stopped")
    


def heartbeat():
    while context.running:
        time.sleep(0.5)
    
