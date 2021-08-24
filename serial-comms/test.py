import serial
import time
import keyboard


class SyringeDryer:
    def __init__(self):
        # for windows
        self.ser = serial.Serial(port='COM4', baudrate=9600, timeout=.1)
        # for linux
        # self.ser = serial.Serial('/dev/ttyACM0', 9600, timeout=1) 
        self.ser.flush()
        self.run()

    def run(self):
        while True:
            if keyboard.is_pressed("a"):
                self.sendSpin()

    def sendSpin(self):
        self.ser.write(b"Spin\n")
        self.ser.flush


s = SyringeDryer()



        
        

