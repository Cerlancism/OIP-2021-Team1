doorStatus = False

# Sets if door sensors detects open or closed door
def set_door(status):
    global doorStatus
    doorStatus = status
