# iiot-book
This repository provide the code of the book


* platform : custom iiot platform
* predix : custom code for Predix platfomr
* cloud : code for AWS, GCP and Azure
* analytics : code and data for diagnostic analytics and predictive
* digital-twin : code and data for digital twin

# Platform

It contains code for a custom IIOT platform based on Kafka, Cassandra, KairosDB and Docker. Further snippet of code:

## Timeseries curl

```
curl -d '{"metric": "sys.cpu", "timestamp": 1529176746, "value": 90, "tags": {"host": "localhost", "quality" : "GOOD"} }' \
  -H "Content-Type: application/json" \
  -X POST http://localhost:4242/api/put

curl -d '{"metric": "sys.cpu", "timestamp": 1529176756, "value": 100, "tags": {"host": "localhost", "quality" : "GOOD"} }' \
  -H "Content-Type: application/json" \
  -X POST http://localhost:4242/api/put

  curl -d '{"metric": "sys.cpu", "timestamp": 1529176766, "value": 110, "tags": {"host": "localhost", "quality" : "GOOD"} }' \
  -H "Content-Type: application/json" \
  -X POST http://localhost:4242/api/put


curl -d '{"metric": "sys.cpu", "timestamp": 1529176776, "value": 111, "tags": {"host": "localhost", "quality" : "GOOD"} }' \
  -H "Content-Type: application/json" \
  -X POST http://localhost:4242/api/put


curl -d '{"metric": "sys.cpu", "timestamp": 1529176876, "value": 211, "tags": {"host": "localhost", "quality" : "GOOD"} }' \
  -H "Content-Type: application/json" \
  -X POST http://localhost:4242/api/put
```

## Run mosquito
```
docker run -it -p 1883:1883 -p 9001:9001 -v mosquitto.conf:/mosquitto/config/mosquitto.conf eclipse-mosquitto

docker run -it -p 1883:1883 -p 9001:9001  eclipse-mosquitto
```

## Run cassandra
```
docker network create iiot-net
docker run --network=iiot-net -it -p 1883:1883 -p 9001:9001  --name mqtt0 eclipse-mosquitto
docker run --network=iiot-net -p 9092:9092 -p 2181:2181 -e MQTT_URI=tcp://mqtt0:1883 -e KAFKA_ADVERTISED_HOST_NAME=192.168.0.102 venergiac/kafka-mqtt:latest

docker run --network=iiot-net -p 9042:9042 -p 9160:9160 --name cassandra0 cassandra
docker run --network=iiot-net -P -p 8080:8080 -e "CASS_HOSTS=cassandra0:9042" -e "REPFACTOR=1" iiot-book/kairosdb

docker run --network=iiot-net -P -p 8080:8080 -e "CASS_HOSTS=XXXX:9042" -e "REPFACTOR=1" iiot-book/kairosdb
```

## Kafka
```
    if (value instanceof Double) {
      point = new DoubleDataPoint(ts,(Double)value);
    } else if (value instanceof Integer) {
      point = new DoubleDataPoint(ts,(Integer)value);
    } else if (value instanceof Long) {
      point = new DoubleDataPoint(ts,(Long)value);
    } else if (value instanceof String) {
      point = new StringDataPoint(ts,(String)value);
    }
```

# Predix Custom code for APP code fo src

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



