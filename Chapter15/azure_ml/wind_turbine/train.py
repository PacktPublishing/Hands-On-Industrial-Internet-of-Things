import argparse
import os
import numpy as np

from sklearn.linear_model import LogisticRegression
from sklearn.externals import joblib

from azureml.core import Run
import random

def wind_turbine_model(x):

    # cut-in pseed vs cut-out speed
    if x<4.5 or x>21.5:
        return 0.0

    # standard operability
    return 376.936 - 195.8161*x + 33.75734*x**2 - 2.212492*x**3 + 0.06309095*x**4 - 0.0006533647*x**5


# get hold of the current run
run = Run.get_context()

# let user feed in 2 parameters, the location of the data files (from datastore), and the regularization rate of the logistic regression model
parser = argparse.ArgumentParser()
parser.add_argument('--data-folder', type=str, dest='data_folder', help='data folder mounting point')
parser.add_argument('--regularization', type=float, dest='reg', default=0.01, help='regularization rate')
args = parser.parse_args()

data_folder = os.path.join(args.data_folder, 'mnist')
print('Data folder:', data_folder)


X_train=[]
y_train=[]


X_train.extend( [[x ,wind_turbine_model(x)] for x in range(0,30)] )
y_train.extend( [1 for x in range(0,30)] )


for x in range(15,30):
    X_train.extend([[x, 50 + x*random.random()]])
    y_train.extend([0])

logreg = LogisticRegression(C=1.0/args.reg, random_state=0, solver='lbfgs', multi_class='multinomial')
logreg.fit(X_train, y_train)

test=logreg.predict([[16,wind_turbine_model(16)],[1,wind_turbine_model(1)],[25,wind_turbine_model(25)],[25,50],[18,250]])


import numpy as np
# calculate accuracy on the prediction
acc = np.average(test == [1,1,1,0,1])
print('Accuracy is', acc)

run.log('regularization rate', np.float(args.reg))
run.log('accuracy', np.float(acc))

os.makedirs('outputs', exist_ok=True)
# note file saved in the outputs folder is automatically uploaded into experiment record
joblib.dump(value=logreg, filename='outputs/sklearn_windturbine_model.pkl')