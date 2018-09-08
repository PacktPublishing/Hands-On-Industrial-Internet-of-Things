
import matplotlib.pyplot as plt
import numpy as np


def wind_turbine_model(x):
    if (x<=4.5):
        return 0
    if (x>=21.5):
        return 262
    return 376.936 - 195.8161*x + 33.75734*x**2 - 2.212492*x**3 + 0.06309095*x**4 - 0.0006533647*x**5



x = np.arange(0.0, 50.0, 0.1)
plt.plot(x, [wind_turbine_model(t) for t in x])
plt.show()