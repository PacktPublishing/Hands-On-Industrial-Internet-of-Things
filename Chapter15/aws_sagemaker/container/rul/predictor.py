# This is the file that implements a flask server to do inferences. It's the file that you will modify to
# implement the scoring for your own algorithm.

from __future__ import print_function

import os
import json
try:
    from StringIO import StringIO
except ImportError:
    from io import StringIO
import sys
import signal
import traceback

import flask

import pandas as pd
import numpy as np
import tensorflow as tf
from keras.models import load_model

prefix = '/opt/ml/'
model_path = os.path.join(prefix, 'model')

#fit the model
import math
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error

# data columns
columns = ['unitid', 'time', 'set_1','set_2','set_3']
columns.extend(['sensor_' + str(i) for i in range(1,22)])

# prepare model
columns_feature=['sensor_4','sensor_7']

# RUL estimation functions
def prepare_dataset(dataframe, columns=columns_feature):
    dataframe = dataframe[columns]
    dataset = dataframe.values
    dataset = dataset.astype('float32')

    # normalize the dataset
    scaler = MinMaxScaler(feature_range=(0, 1))
    dataset = scaler.fit_transform(dataset)
    return dataset

# A singleton for holding the model. This simply loads the model and holds it.
# It has a predict function that does a prediction based on the model and the input data.

class ScoringService(object):
    model = None                # Where we keep the model when it's loaded
    graph = None

    @classmethod
    def get_model(cls):
        """Get the model object for this instance, loading it if it's not already loaded."""
        if cls.model == None:
            
            inp = os.path.join(model_path, 'rul-model.h5')
            print('Loading model %s ...' % inp)
            cls.model = load_model(inp)
            print('model loaded')
            cls.graph = tf.get_default_graph()
            print(cls.model.summary())
        return cls.model

    @classmethod
    def predict(cls, input):
        """For the input, do the predictions and return them.

        Args:
            input (a pandas dataframe): The data on which to do the predictions. There will be
                one prediction per row in the dataframe"""

        lm = cls.get_model()
        input = prepare_dataset(input)
        with cls.graph.as_default():
            return lm.predict(input)

# The flask app for serving predictions
app = flask.Flask(__name__)

@app.route('/ping', methods=['GET'])
def ping():
    """Determine if the container is working and healthy. In this sample container, we declare
    it healthy if we can load the model successfully."""
    health = ScoringService.get_model() is not None  # You can insert a health check here

    status = 200 if health else 404
    return flask.Response(response='\n', status=status, mimetype='application/json')

@app.route('/invocations', methods=['POST'])
def transformation():
    """Do an inference on a single batch of data. In this sample server, we take data as CSV, convert
    it to a pandas data frame for internal use and then convert the predictions back to CSV (which really
    just means one prediction per line, since there's a single column.
    """
    data = None

    # Convert from CSV to pandas
    if flask.request.content_type == 'text/csv':
        data = flask.request.data.decode('utf-8')
        s = StringIO(data)
        data = pd.read_csv(s, header=None,names=columns)
    else:
        return flask.Response(response='This predictor only supports CSV data', status=415, mimetype='text/plain')

    print('Invoked with {} records'.format(data.shape[0]))

    # Do the prediction
    testPredict = ScoringService.predict(data)
    print(testPredict)

    #hardcoded
    n=192
    testPredict = np.multiply(testPredict,n)
    print("RUL of Engine %s : predicted:%s expected:%s"%(1, testPredict[-1], 112))

    # Convert from numpy back to CSV
    out = StringIO()
    pd.DataFrame({'results':testPredict[-1]}).to_csv(out, header=False, index=False)
    result = out.getvalue()

    return flask.Response(response=result, status=200, mimetype='text/csv')
