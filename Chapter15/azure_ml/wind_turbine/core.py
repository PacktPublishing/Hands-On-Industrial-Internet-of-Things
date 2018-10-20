import json
import numpy as np
import os
import pickle


from azureml.core.model import Model


def wind_turbine_model(x):

    # cut-in pseed vs cut-out speed
    if x<4.5 or x>21.5:
        return 0.0

    # standard operability
    return 376.936 - 195.8161*x + 33.75734*x**2 - 2.212492*x**3 + 0.06309095*x**4 - 0.0006533647*x**5

def init():
    global model
    # not model for wind turbine
    model = wind_turbine_model

def run(raw_data):
    data = np.array(json.loads(raw_data)['data'])
    # make evaluation
    y = model(data)
    return json.dumps(y)
