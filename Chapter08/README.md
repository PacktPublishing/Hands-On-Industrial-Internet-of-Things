# Hands-On Industrial Internet of Things, Antonio Capasso & Giacomo Veneri, Packt, 2018

# Chapter 08

How to build a custom I-IoT solution with

* Docker
* KairosDB
* Airflow
* Kafka
* Cassandra
* Mosquitto


## Run mosquito
```
docker run -it -p 1883:1883 -p 9001:9001 -v mosquitto.conf:/mosquitto/config/mosquitto.conf eclipse-mosquitto

docker run -it -p 1883:1883 -p 9001:9001  eclipse-mosquitto
```

## MQTT Calls
```
mqtt-cli localhost topic/device0 "device0.my.measure.temperature,27,GOOD"
```

## KairosDB  configuration - <KAFKA_HOME>/conf/kairosdb.properties

```
#kairosdb.service.datastore=org.kairosdb.datastore.h2.H2Module
kairosdb.datastore.concurrentQueryThreads=5
kairosdb.service.datastore=org.kairosdb.datastore.cassandra.CassandraModule
```


## Run kairosdb on cassandra
```
docker network create iiot-net
docker run --network=iiot-net -it -p 1883:1883 -p 9001:9001  --name mqtt0 eclipse-mosquitto
docker run --network=iiot-net -p 9092:9092 -p 2181:2181 -e MQTT_URI=tcp://mqtt0:1883 -e KAFKA_ADVERTISED_HOST_NAME=192.168.0.102 venergiac/kafka-mqtt:latest

docker run --network=iiot-net -p 9042:9042 -p 9160:9160 --name cassandra0 cassandra
docker run --network=iiot-net -P -p 8080:8080 -e "CASS_HOSTS=cassandra0:9042" -e "REPFACTOR=1" iiot-book/kairosdb

docker run --network=iiot-net -P -p 8080:8080 -e "CASS_HOSTS=XXXX:9042" -e "REPFACTOR=1" iiot-book/kairosdb
```

## Call to ingest data

```
curl -d '[ {
         "name": "device0.my.measure.temperature",
         "datapoints": [[1529596511000, 11], [1529596525000, 13.2],
   [1529596539000, 23.1]],
         "tags": {
             "host": "localhost",
             "data_center": "DC1",
             "quality" : "GOOD"
},
         "ttl": 300
     }]' -H "Content-Type: application/json" -X POST
   http://localhost:8080/api/v1/datapoints

```




