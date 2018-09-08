
import pandas as pd
import numpy as np

# step 1: read the dataset
df = pd.read_csv('./data/data_airplane.csv')
print(df.head)




import matplotlib.pyplot as plt
import seaborn as sns

from sklearn import svm

# showing 
#df.plot(x='Time', kind='line', subplots=True)
#plt.show()

# drop data during landing
df = df.drop(df[df['Flaps']>0].index)
df = df.drop(df[df['Landing_Gear']>0].index)

# showing 
#df.plot(x='Time', kind='line', subplots=True)
#plt.show()

# analysis of variance
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)
df_std = df.std()
print(df_std)

#removing un-usefully vars
df=df.drop(['Landing_Gear', 'Thrust_Rev' ,'Flaps'], axis=1)

# correlation
from scipy.stats import pearsonr
def calculate_pvalues(df):
    corr ={}
    for r in df.columns:
        for c in df.columns:
            if not(corr.get(r + ' - ' + c )):
                p = pearsonr(df[r], df[c])
                corr[c + ' - ' + r ] = p
    return corr

print('correlation')
d = calculate_pvalues(df).items()
for k,v in d:
    print('%s :\t v: %s \t p: %s' % (k,v[0],v[1]))


from sklearn.feature_selection import RFE
from sklearn.ensemble import RandomForestRegressor
from matplotlib import pyplot

# separate into input and output variables
array = df.values
X = array[:,0:-1]
y = array[:,-1]
# perform feature selection
rfe = RFE(RandomForestRegressor(n_estimators=500, random_state=1), 4)
fit = rfe.fit(X, y)
# report selected features
print('Selected Features:')
names = df.columns.values[0:-1]
for i in range(len(fit.support_)):
	if fit.support_[i]:
		print(names[i])

def moving_average(data, window_size):

    window = np.ones(int(window_size))/float(window_size)
    return np.convolve(data, window, 'same')


def search_anomalies(y, window_size, sigma=1.0):

    avg = moving_average(y, window_size).tolist()
    residual = y - avg
    # Calculate the variation in the distribution of the residual
    std = np.std(residual)

    anomalies=[]
    i=0
    for y_i, avg_i in zip(y, avg):
        if (y_i > avg_i + (sigma*std)) | (y_i < avg_i - (sigma*std)):
            anomalies.append([i, y_i])
        i=i+1


    return {'std': round(std, 3),
            'anomalies': anomalies}

from statsmodels.tsa.arima_model import ARIMA
from matplotlib import pyplot
def ARIMA_residuals(series):
    print(series)
    # fit model
    model = ARIMA(series, order=(5,1,3))
    model_fit = model.fit(disp=0)
    print(model_fit.summary())
    # plot residual errors
    residuals = pd.DataFrame(model_fit.resid)
    return residuals.T

def search_anomalies_OCSVM(y):
    print(len(y))
    pyplot.scatter([yy[0] for yy in y] ,[yy[1] for yy in y], s=1)
    X_train=y
    clf = svm.OneClassSVM(nu=0.005, kernel="rbf", gamma=0.01)
    clf.fit(X_train)
    anomalies=[]
    X_test=y
    y_pred_test = clf.predict(X_test)
    for i in range(0,len(y)):
        if(y_pred_test[i]<0):
            anomalies.append([[i, X_test[i][0]],[i, X_test[i][1]]])
            plt.plot(X_test[i][0], X_test[i][1], '*r')
    plt.show()
    return {
            'anomalies': anomalies}


# 4. Lets play with the functions
x = df['Time'].values
Y_Param3_1 = df['Param3_1'].values
Y_Param1_4= df['Param1_4'].values


## Moving average
events_Param3_1 = search_anomalies(Y_Param3_1, window_size=50, sigma=2)
events_Param1_4 = search_anomalies(Y_Param1_4, window_size=50, sigma=2)
A_Param3_1 = events_Param3_1['anomalies']
A_Param1_4 = events_Param1_4['anomalies']

plt.plot(x,Y_Param3_1, 'k')
plt.plot(x,Y_Param1_4, 'k')

plt.plot([x[row[0]] for row in A_Param3_1], [Y_Param3_1[row[0]] for row in A_Param3_1], 'or') 
plt.plot([x[row[0]] for row in A_Param1_4], [Y_Param1_4[row[0]] for row in A_Param1_4], 'or') 
plt.show()

## OCSVM
Y=np.vstack(( ARIMA_residuals(Y_Param3_1), ARIMA_residuals(Y_Param1_4)) ).T
events_Param=search_anomalies_OCSVM(Y)

A_Param3_1 =  [x[0] for x in events_Param['anomalies']]
A_Param1_4 = [x[1] for x in events_Param['anomalies']]

plt.plot(x,Y_Param3_1, 'k')
plt.plot(x,Y_Param1_4, 'k')

plt.plot([x[row[0]] for row in A_Param3_1], [Y_Param3_1[row[0]] for row in A_Param3_1], 'or') 
plt.plot([x[row[0]] for row in A_Param1_4], [Y_Param1_4[row[0]] for row in A_Param1_4], 'or') 
plt.show()