# Hands-On Industrial Internet of Things, Antonio Capasso & Giacomo Veneri, Packt, 2018

# Chapter 08

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