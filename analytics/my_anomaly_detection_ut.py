import unittest
from my_anomaly_detection import search_anomalies
import pandas as pd
import numpy as np


class MyTest(unittest.TestCase):
    def test(self):
        d=np.array([10, 10, 10, 10, 30, 20, 10, 10])
        a=search_anomalies(d,2)
        a=a['anomalies']
        print(a)
        self.assertListEqual(a[1], [4,30])

if __name__ == '__main__':
    unittest.main()