import threading
import serial_coms

print("Python Server")
serial_coms.run()

from flask import Flask

app = Flask(__name__, static_url_path='', static_folder='../ui/build/')


def run():
    pass


loop = threading.Thread(target=run)
loop.start()