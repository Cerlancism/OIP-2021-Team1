import serial
import time

if __name__ == '__main__':
    while True:
        ser = serial.Serial('/dev/ttyACM0', 9600, timeout=1)
        ser.write(1)
        ser.flush()
        # print("running")
        time.sleep(1)
        ser.close()

