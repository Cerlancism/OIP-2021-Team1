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
    print("Setting motor", state)
    return

def set_fan(state=None):
    if state is None:
        return
    print("Setting fan", state)
    dryer.actuate(state, "Fan")
    return

def set_uv(state=None):
    if state is None:
        return
    print("Setting uv", state)
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
        print("Driver not present")
        return last_sensors

    try:
        values = dryer.getSensors()
    except:
        return last_sensors

    if values is None:
        print("No sensor values")
        return last_sensors
    last_sensors = values
    return last_sensors
