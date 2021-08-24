from SyringeDryer import SyringeDryer

dryer = None

try:
    dryer = SyringeDryer()
except Exception as e:
    print("\033[91m" + "USB failed to establish", e, "\033[0m")

def set_motor(state=None):
    if state is None:
        return
    dryer.actuate(state, "Motor")
    return

def set_fan(state=None):
    if state is None:
        return
    dryer.actuate(state, "Fan")
    return

def set_uv(state=None):
    if state is None:
        return
    dryer.actuate(state, "UV")
    return

last_sensors = {
    "humidity" : 0.0,
    "temperature" : 0.0,
    "proximity" : 0.0
}

def get_sensors():
    global last_sensors
    global dryer
    if dryer is None:
        return last_sensors

    values = dryer.getSensors()

    if values is None:
        return last_sensors
    last_sensors = values
    return last_sensors
