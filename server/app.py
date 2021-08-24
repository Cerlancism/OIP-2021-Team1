
import time
import threading

import components

from context import Context
from configuration import Configuration

print("Python Server")

from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__, static_url_path="", static_folder="../ui/build/")
CORS(app)

context: Context = None

@app.route("/start")
def start_process():
    print("Starting process", request.query_string)

    config = Configuration()
    config.fan = request.args.get("fan", default=0, type=int) # in seconds, 0 is auto
    config.uv = request.args.get("uv", default=300, type=int)  # in seconds
    config.concurrent = request.args.get("concurrent") is not None
    config.ignore_door = request.args.get("ignore_door") is not None

    start_session()

    return config.__dict__


@app.route("/stop")
def stop_process():
    print("Stopping process", request.query_string)
    stop_session()
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
    if context is not None:
        return context.sensors
    return components.get_sensors()

def start_session():
    global context
    if context is not None:
        print("ERROR", "Session already started")
        return


    components.set_motor(True)
    components.set_fan(True)
    components.set_uv(True)

    context = Context()
    context.thread = threading.Thread(target=heartbeat)
    context.thread.daemon = True
    context.thread.start()
    print("heartbeat started")

def stop_session():
    global context

    components.set_motor(False)
    components.set_fan(False)
    components.set_uv(False)

    if context is not None:
        context.running = False
        context.thread.join()
        context = None
        print("heartbeat stopped")
    


def heartbeat():
    while context.running:
        time.sleep(0.5)
        context.sensors = components.get_sensors()
        print("sensors", context.sensors)
    
