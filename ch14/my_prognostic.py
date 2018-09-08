import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# step 1: read the dataset
columns = ['unitid', 'time', 'set_1','set_2','set_3']
columns.extend(['sensor_' + str(i) for i in range(1,22)])
df = pd.read_csv('./data/train_FD001.txt', delim_whitespace=True,names=columns)


print(df.head())

#step 2: EDA
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)
df_std = df.groupby('unitid').std()
print(df_std==0)

# removing unusefull data
df=df.drop(['set_3', 'sensor_1', 'sensor_5', 'sensor_10', 'sensor_16', 'sensor_18', 'sensor_19'], axis=1)

# correlation
from scipy.stats import pearsonr
def calculate_pvalues(df):
    df = df.dropna()._get_numeric_data()
    dfcols = pd.DataFrame(columns=df.columns)
    pvalues = dfcols.transpose().join(dfcols, how='outer')
    for r in df.columns:
        for c in df.columns:
            pvalues[r][c] = round(pearsonr(df[r], df[c])[1], 4)
    return pvalues

print('correlation engine 1')
print(calculate_pvalues(df[(df.unitid ==1)]))

print('correlation engine 3')
print(calculate_pvalues(df[(df.unitid ==5)]))

print('correlation engine 10')
print(calculate_pvalues(df[(df.unitid ==10)]))

# showing correlation
import matplotlib.pyplot as plt
import seaborn as sns

def show_feature(df):
    # showing the first 5 engines and the first five variables
    sns.pairplot(df[(df.unitid <=5) ],  hue="unitid",  vars=["set_1", "set_2",'sensor_2','sensor_3','sensor_4'])
    plt.show()

    #timeseries
    df1=df[(df.unitid <5) ]
    i=0
    for column in df1:
        if ('sensor' in column):
            i=i+1
            ax= plt.subplot(4,4,i)
            ax = sns.tsplot(time="time", value=column, condition='unitid',
                        unit='unitid',legend=False,
                        data=df1, ax=ax)    

    plt.show()


#show_feature(df)

#Selecte fetures
from sklearn.feature_selection import RFE
from sklearn.ensemble import RandomForestRegressor


def select_feature(df):
    print("extract var")
    # separate into input and output variables
    array = df.values
    X = array[:,0:-1]
    y = array[:,-1]
    # perform feature selection
    rfe = RFE(RandomForestRegressor(n_estimators=50, random_state=1), 4)
    fit = rfe.fit(X, y)
    # report selected features
    print('Selected Features:')
    names = df.columns.values[0:-1]
    for i in range(len(fit.support_)):
        if fit.support_[i]:
            print(names[i])


#select_feature(df)


# fit the model
import math
from keras.models import Sequential
from keras.layers import Dense
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error


def prepare_dataset(dataframe, columns):
    dataframe = dataframe[columns]
    dataset = dataframe.values
    dataset = dataset.astype('float32')

    # normalize the dataset
    scaler = MinMaxScaler(feature_range=(0, 1))
    dataset = scaler.fit_transform(dataset)
    return dataset

def build_model(input_dim):
    # create model
    model = Sequential()
    model.add(Dense(16, input_dim=input_dim, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))

    # Compile model
    model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
    return model

def create_train_dataset(dataset):
      dataX, dataY = [], []
      start=len(dataset)
      for i in range(len(dataset)):
            a=dataset[i]
            b=(start-i) / start
            dataX.append(a)
            dataY.append(b)
            
      return np.array(dataX), np.array(dataY)

def train_model(model, dataset):

    # create the dataset
    trainX, trainY = create_train_dataset(dataset)

    # Fit the model
    model.fit(trainX, trainY, epochs=150, batch_size=10, verbose=0)
    
    # make predictions
    trainPredict = model.predict(trainX)

        # calculate root mean squared error
    trainScore = math.sqrt(mean_squared_error(trainY, trainPredict[:,0]))
    print('Train Score: %.2f RMSE' % (trainScore))


# prepare model
#columns_feature=['set_1','set_2','sensor_4','sensor_7','sensor_11','sensor_12']
columns_feature=['sensor_4','sensor_7']


# fix random seed for reproducibility
np.random.seed(7)

i=1

# build the model
model=build_model(len(columns_feature))

# train the model
dataset= prepare_dataset(df[(df.unitid ==i)],columns_feature)
train_model(model, dataset)

# test
df_test = pd.read_csv('./data/test_FD001.txt', delim_whitespace=True,names=columns)
expected = pd.read_csv('./data/RUL_FD001.txt', delim_whitespace=True,names=['RUL'])

n=len(dataset)
dataset_test = prepare_dataset(df_test[(df_test.unitid ==i)],columns_feature)
testPredict = model.predict(dataset_test)
testPredict = np.multiply(testPredict,n)
print("RUL of Engine %s : predicted:%s expected:%s"%(1, testPredict[-1], expected['RUL'][i-1]))



