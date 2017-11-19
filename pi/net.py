from __future__ import print_function
import numpy as np
import math as mat
import RPi.GPIO as GPIO                    #Import GPIO library
import time                                #Import time library
import socket

GPIO.setmode(GPIO.BCM)                     #Set GPIO pin numbering 

TRIG = 23                                  #Associate pin 23 to TRIG
ECHO = 24                                  #Associate pin 24 to ECHO

print ("Distance measurement in progress")

GPIO.setup(TRIG,GPIO.OUT)                  #Set pin as GPIO out
GPIO.setup(ECHO,GPIO.IN)                   #Set pin as GPIO in

'''
        Read Gyro and Accelerometer by Interfacing Raspberry Pi with MPU6050 using Python
	http://www.electronicwings.com
'''
import smbus			#import SMBus module of I2C
from time import sleep          #import

#some MPU6050 Registers and their Address
PWR_MGMT_1   = 0x6B
SMPLRT_DIV   = 0x19
CONFIG       = 0x1A
GYRO_CONFIG  = 0x1B
INT_ENABLE   = 0x38
ACCEL_XOUT_H = 0x3B
ACCEL_YOUT_H = 0x3D
ACCEL_ZOUT_H = 0x3F
GYRO_XOUT_H  = 0x43
GYRO_YOUT_H  = 0x45
GYRO_ZOUT_H  = 0x47


def MPU_Init():
	#write to sample rate register
	bus.write_byte_data(Device_Address, SMPLRT_DIV, 7)
	
	#Write to power management register
	bus.write_byte_data(Device_Address, PWR_MGMT_1, 1)
	
	#Write to Configuration register
	bus.write_byte_data(Device_Address, CONFIG, 0)
	
	#Write to Gyro configuration register
	bus.write_byte_data(Device_Address, GYRO_CONFIG, 24)
	
	#Write to interrupt enable register
	bus.write_byte_data(Device_Address, INT_ENABLE, 1)

def read_raw_data(addr):
	#Accelero and Gyro value are 16-bit
        high = bus.read_byte_data(Device_Address, addr)
        low = bus.read_byte_data(Device_Address, addr+1)
    
        #concatenate higher and lower value
        value = ((high << 8) | low)
        
        #to get signed value from mpu6050
        if(value > 32768):
                value = value - 65536
        return value


bus = smbus.SMBus(1) 	# or bus = smbus.SMBus(0) for older version boards
Device_Address = 0x68   # MPU6050 device address

MPU_Init()
n = time.time()
print (" Reading Data of Gyroscope and Accelerometer")


sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.bind(('', 4051))
sock.listen(1)

print("Wait for connection")
con, cAdress = sock.accept()
print("Connected")


uAz = vAz = 0
driving_score = 100
index = 0

while True:
    
    uAz = vAz
    
    #Read Accelerometer raw value
    acc_z = read_raw_data(ACCEL_ZOUT_H)
    
    vAz = acc_z/16384.0
    vAz = (vAz*25)+(50-43)
    

    #Read Gyroscope raw value
    gyro_x = read_raw_data(GYRO_XOUT_H)
    
    Gx = gyro_x/131.0

    GPIO.output(TRIG, False)                 #Set TRIG as LOW

    GPIO.output(TRIG, True)                  #Set TRIG as HIGH
    time.sleep(0.00001)                      #Delay of 0.00001 seconds
    GPIO.output(TRIG, False)                 #Set TRIG as LOW

    while GPIO.input(ECHO)==0:               #Check whether the ECHO is LOW
        pulse_start = time.time()              #Saves the last known time of LOW pulse

    while GPIO.input(ECHO)==1:               #Check whether the ECHO is HIGH
        pulse_end = time.time()                #Saves the last known time of HIGH pulse 

    pulse_duration = pulse_end - pulse_start #Get pulse duration to a variable

    distance = pulse_duration * 17150        #Multiply pulse duration by 17150 to get distance
    distance = round(distance, 2) - 7            #Round to two decimal points
           
    if distance > 1 and distance < 1000:      #Check whether the distance is within range
        print ("Distance:",distance - 0.5,"cm")  #Print distance with 0.5 cm calibration
    else:
        print ("Distance is out of Range.")                   #display out of range
    sleep(1)

    # Penalties
    
    dist_penalty = 0
    if distance <= 20:
        dist_penalty = 2*distance
    
    ang_acc_penalty = 0
    if (vAz*Gx) > 90:
        ang_acc_penalty = (vAz*Gx)/2
        
    acc_penalty = 0
    if abs(vAz-uAz) > 20:
        acc_penalty = (abs(vAz-uAz))/2
        
    driving_score = driving_score - (mat.sqrt((dist_penalty*dist_penalty) + (ang_acc_penalty*ang_acc_penalty) + (acc_penalty*acc_penalty)))
    
    if (distance > 20) and (ang_acc_penalty < 90) and (acc_penalty < 20):
        driving_score = driving_score + 1
        
    if driving_score <= 10:
        driving_score = 10
        
    if driving_score >= 100:
        driving_score = 100
        
    print ("\nGx=%.2f" %Gx, u'\u00b0'+ "/s", "\tAz=%.2f g" %vAz)
    print("\nDriving Score = %f" %driving_score)

    data = str(time.time()-n) + ", "+str(vAz)+(", ")+str(Gx)+", "+str(distance)+", "+str(driving_score)+"\n"

    con.send(data.encode())
