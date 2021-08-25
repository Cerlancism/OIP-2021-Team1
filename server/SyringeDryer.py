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
                self.actuate(on = True, part = "Fan")
                time.sleep(5)
                self.sendSpin(on = False, part = "Fan")
                self.old_epoch = time.time()

    def actuate(self, on, part):
        if(part == "Fan"):
            if(on == True):
                self.ser.write(b"Fan\n")
            else:
                self.ser.write(b"No Fan\n")
        if(part == "Motor"):
            if(on == True):
                self.ser.write(b"Spin\n")
            else:
                self.ser.write(b"No Spin\n")
        if(part == "UV"):
            if(on == True):
                self.ser.write(b"UV\n")
            else:
                self.ser.write(b"No UV\n")
        self.ser.flush()

    def getSensors(self):
        # Ensures message sent from buffer to 
        self.ser.write(b"Data\n")
        self.ser.flush()
        recv =  self.ser.readline().decode('utf-8')
        print(recv)
        recv.split(',')
        result = {
            "humidity" : 0.0,
            "temperature" : 0.0,
            "proximity" : 0.0
        }
        parsed = [x.rstip() for x in recv]
        print(parsed)

        if(len(parsed) > 2):
            result["humidity"] = int(parsed[0]+'0')/1000
            result["temperature"] = int(parsed[1]+'0')/1000
            result["proximity"] = int(parsed[2]+'0')/10
            return result
        else:
            return None




# s = SyringeDryer()



        
        

