# kafka-mqtt-connector

Docker instance with mqtt connector.
Usage:

```
docker run -p 9092:9092 -p 2181:2181 -e MQTT_URI=tcp://$EXTERNAL_IP:1883 -e KAFKA_ADVERTISED_HOST_NAME=$EXTERNAL_IP venergiac/kafka-mqtt:latest
```


# interactive


```
docker run -it -p 9092:9092 -p 2181:2181  -e MQTT_URI=tcp://192.168.0.1:1883 venergiac/kafka-mqtt /bin/bash
```

# test

ON local pc for test

```
$KAFKA_HOME/bin/kafka-console-producer.sh --broker-list localhost:9092 --topic mqtt
```

```
$KAFKA_HOME/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic mqtt --from-beginning
```