import serial
import time

class SyringeDryer:
    def __init__(self):
        # for windows
        # self.ser = serial.Serial(port='COM4', baudrate=9600, timeout=.1)
        # for linux
        self.ser = serial.Serial('/dev/ttyACM0', 9600, timeout=1) 
        self.ser.flush()
        self.old_epoch = time.time()
        self.run()


    def run(self):
        while True:
            if time.time() - self.old_epoch >= 5:
                self.sendSpin(on = True)
                time.sleep(5)
                self.sendSpin(on = False)
                self.old_epoch = time.time()

    def sendSpin(self, on):
        if(on == True):
            self.ser.write(b"Spin\n")
        else:
            self.ser.write(b"No Spin\n")
        self.ser.flush

    def sendFan(self, on):
        if(on == True):
            self.ser.write(b"Fan\n")
        else:
            self.ser.write(b"No Fan\n")
        self.ser.flush

s = SyringeDryer()



        
        

