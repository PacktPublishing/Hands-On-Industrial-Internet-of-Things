from statsmodels.tsa.arima_model import ARIMA
import matplotlib.pyplot as plt
import pandas as pd

# read the dataset
df = pd.read_csv('./data/data_refinery.csv')
print(df.head)

#splitting data-set between train and test
y=df['crude_flow'].values

n=len(y)
s = int(len(y) * 0.7)
train, test = y[0:s+1], y[s:n]

# Evaluating ARIMA
order=order=(3,1,2)
model = ARIMA(train, order)
model_fit = model.fit(disp=0)

# Forecasting
prediction=model_fit.forecast(steps=n-s)[0]

# Visualization
plt.plot(train,'y', label='train')
plt.plot(range(s,n),test,'k', label='test')
plt.plot(range(s,n),prediction,'k--', label='predicted')
plt.legend()
plt.show()