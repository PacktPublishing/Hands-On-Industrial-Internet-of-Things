# iiot-book
Code for iiot-book


# Predix Custome code for APP code fo src

ON dashboard.html

```
<link rel="import" href="./my-ts-chart-js.html" />
<my-timeseries-chart tags="[[tags]]" selected-tag="[[tags[0]]]"></my-timeseries-chart>
```

ON dashboard.es6.js

```
....
      ,
      tags: {
        type: Array,
        value: function() {
          return [{val: "Light", key: "WR-IDP-F0F1:light", unit: "Lumen"},
          {val: "Temperature", key: "WR-IDP-F0F1:temperature", unit: "Celsius"},
          {val: "Sound", key: "WR-IDP-F0F1:sound", unit: "dB"}, 
          {val: "Angle", key: "WR-IDP-F0F1:rotaryangle",unit: "Degree"}];
        }
      },

      ...
```

then copy the file my-ts-chart-js.html on src