import re
import math
import datetime
import sys
import time
from matplotlib import pyplot as plt
import numpy as np
import socket
import time, random
import math
from collections import deque

so = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
so.connect(('131.159.223.167', 4051))

#plt.ion() 
#fig=plt.figure()
#plt.axis([-2,-2,-2,-2])
#plt.show()


xa = list()
ya = list()

start = time.time()

class RealtimePlot:
    def __init__(self, axes, max_entries = 100, color="r", xmin=False, xmax=False, ymin=False, ymax=False):
        self.axis_x = deque(maxlen=max_entries)
        self.axis_y = deque(maxlen=max_entries)
        self.axes = axes
        self.max_entries = max_entries
        
        self.lineplot, = axes.plot([], [], color + "o-")
        self.axes.set_autoscaley_on(True)
        self.xmin = xmin
        self.xmax = xmax
        self.ymin = ymin
        self.ymax = ymax 

    def add(self, x, y):
        self.axis_x.append(x)
        self.axis_y.append(y)
        self.lineplot.set_data(self.axis_x, self.axis_y)
        if(xmin and xmax):
        	self.axes.set_xlim(self.axis_x[0], self.axis_x[-1] + 1e-15)
        else:
        	self.axes.set_xlim(self.xmin, self.xmax)
        	self.axes.relim(); self.axes.autoscale_view() # rescale the y-axis

    def animate(self, figure, callback, interval = 50):
        import matplotlib.animation as animation
        def wrapper(frame_index):
            self.add(*callback(frame_index))
            self.axes.relim(); self.axes.autoscale_view() # rescale the y-axis
            return self.lineplot
        animation.FuncAnimation(figure, wrapper, interval=interval)

#fig, axes = plt.subplots()
#display = RealtimePlot(axes)
#display.animate(fig, lambda frame_index: (time.time() - start, random.random() * 100))
#plt.show()

fig, axes = plt.subplots(2,2)

display = RealtimePlot(axes[0,0], color="r", max_entries=10, xmin=-10, xmax=10)
axes[0,0].set_title('Acceleration')
display2 = RealtimePlot(axes[0,1], color="b", max_entries=10, xmin=-10, xmax=10)
axes[0,1].set_title('Gyroskop')
display3 = RealtimePlot(axes[1,0], color="g", max_entries=10, xmin=-3, xmax=40)
axes[1,0].set_title('Distance')
display4 = RealtimePlot(axes[1,1], color="m", max_entries=10, xmin=0, xmax=100)
axes[1,1].set_title('Driving Score')

while True:
	lds = so.recv(1024).decode()
	if not lds: break
	print(lds)
	try:
		lds = lds.replace("b' ","").replace("\\r\\n'"," ")

		ar = lds.split(',')

		tx = float(ar[0].strip())
		ty = float(ar[1].strip())
		tz = float(ar[2].strip())
		ta = float(ar[3].strip())/100
		tb = float(ar[4].strip())

		print(tx)
		print(ty)

		display.add(tx, ty)
		display2.add(tx, tz)
		display3.add(tx, ta)
		display4.add(tx, tb)

		plt.pause(0.001)

		xa.append(int(tx))
		ya.append(int(ty))
		# ta.append(gesamt)
		#plt.scatter(tx,ty)
		#plt.scatter(tx,ty, '-')
		#plt.show()
		#plt.pause(0.001) #Note this correction
	except :
		pass

