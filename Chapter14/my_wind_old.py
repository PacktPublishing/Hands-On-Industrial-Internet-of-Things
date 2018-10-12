
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


def wind_turbine_model(x):

    # cut-in pseed vs cut-out speed
    if x<4.5 or x>21.5:
        return 0

    # standard operability
    return 376.936 - 195.8161*x + 33.75734*x**2 - 2.212492*x**3 + 0.06309095*x**4 - 0.0006533647*x**5



x = np.arange(0.0, 30.0, 0.1)
fig, ax = plt.subplots()
ax.plot(x, [wind_turbine_model(t) for t in x])
ax.set_xlabel('wind speed (m/s)')
ax.set_ylabel('power (kW)')

df = pd.read_csv('./data/windspeed.csv', names=['windspeed'])

ts=[]
xs=[]
ys=[]
ye=[]
de=[]
i=0

n=len(df.index)
N=365*24*6
print(n)
for idx, row in df.iterrows():
    i = i+1
    if (i>N):
        break
    ts.append(i)
    err=np.random.weibull(1)*5-5
    #print(err)
    xx=row.windspeed
    xs.append(xx)
    yy=wind_turbine_model(xx)
    ye.append(yy)
    if i%100==0:
       yy=min(yy,0)
    if i%110==0:
       yy=min(yy-np.random.weibull(8)*5,np.random.weibull(3)*2+25)
    
    dde=-yy*0.016*(i/N) + err
    if (yy+dde>yy+3):
        dde=-yy*0.016*(i/N)
    
    if (yy+dde<0):
        dde=0

    if yy<0:
        yy=0
        dde=0
    
    if yy>0 : 
        de.append(dde/yy)
    else:
        de.append(0)

    ys.append(yy+dde)

ax.plot(xs, ys,'.')
plt.show()

fig, ax = plt.subplots()
#ax.plot(ts, xs)
ax.plot(ts, de)


yys=np.array(ys)
tts=np.array(ts)
dde=np.array(de)
z = np.polyfit(tts[yys!=0], dde[yys!=0], 1)
print(z)

print( (z[0]*(N*9) + z[1]) )

ax.plot(ts, [z[0]*i + z[1] for i in ts])

plt.show()

df = pd.DataFrame(data={'cycle_10_mins': ts, 'wind_speed_ms': xs, 'power_generated_kw':ys})
df.to_csv(path_or_buf='./data/wind_turbine.csv')