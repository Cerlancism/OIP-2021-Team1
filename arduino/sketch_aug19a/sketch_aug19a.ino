// Including the Arduino Stepper Library
#include <Stepper.h>
#include "DHT.h"
#include "SharpIR.h"

#define IR_sensor 0 // Infrared Proximity Sensor
#define fan 50 // 5V fan
#define DHTPIN 8 // Temp & Humidity sensor
#define UV 52 // UV Lamp

#define DHTTYPE DHT11

SharpIR sensor { SharpIR::GP2YOA21YK0F, A0};

DHT dht(DHTPIN, DHTTYPE);

int SPIN_ON = 0;

// Number of steps per internal motor revolution 
const float STEPS_PER_REV = 32; 
 
//  Amount of Gear Reduction
const float GEAR_RED = 64;
 
// Number of steps per geared output rotation
const float STEPS_PER_OUT_REV = STEPS_PER_REV * GEAR_RED;
 
// Define Variables
 
// Number of Steps Required
int StepsRequired;
 
// Create Instance of Stepper Class
// Specify Pins used for motor coils
// The pins used are 9,10,11,12 
// Connected to ULN2003 Motor Driver In1, In2, In3, In4 
// Pins entered in sequence 1-3-2-4 for proper step sequencing
 
Stepper steppermotor(STEPS_PER_REV, 4, 6, 5, 7);
void setup() {
  // put your setup code here, to run once:
  pinMode(IR_sensor, INPUT);
  pinMode(fan, OUTPUT);
  pinMode(UV, OUTPUT);
  dht.begin();
  Serial.begin(9600);
}

void loop() {
  /*
  delay(2000);
  digitalWrite(fan, HIGH);
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();
  // Read temperature as Fahrenheit (isFahrenheit = true)
  float f = dht.readTemperature(true);

  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t) || isnan(f)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  Serial.print(F(" Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.print(F("C \n"));

  baserotate();
  */
  // Incoming message from Serial Comms
  if(Serial.available() > 0) 
  {
    String msg = Serial.readStringUntil('\n');
    if(msg == "Spin")
    {
      SPIN_ON = 1;
    }
    if(msg == "No Spin")
    {
      SPIN_ON = 0;
    }
    if(msg == "Fan")
    {
      digitalWrite(fan, HIGH);
    }
    if(msg == "No Fan")
    {
      digitalWrite(fan, LOW);
    }
    if(msg == "UV")
    {
      digitalWrite(UV, HIGH);
    }
    if(msg == "No UV")
    {
      digitalWrite(UV, LOW);
    }
    if(msg == "Data")
    {
      float h = dht.readHumidity();
      // Read temperature as Celsius (the default)
      float t = dht.readTemperature();
      int p = sensor.getDistance();
      if (isnan(h) || isnan(t) || isnan(p)) 
      {
        Serial.print(0); 
        Serial.print(",");
        Serial.print(0);
        Serial.print(",");
        Serial.println(0);
      }
      else
      {  
        Serial.print((int)(h * 100)); 
        Serial.print(",");
        Serial.print((int)(t * 100));
        Serial.print(",");
        Serial.print(p);
        Serial.println(t);
      }
    }
  }

  if(SPIN_ON == 1)
  {
    baserotate();
  }
}

void baserotate(){
  // Rotate CW 1/2 turn slowly
  StepsRequired  =  STEPS_PER_OUT_REV / 4; 
  steppermotor.setSpeed(1000);   
  steppermotor.step(StepsRequired);
}