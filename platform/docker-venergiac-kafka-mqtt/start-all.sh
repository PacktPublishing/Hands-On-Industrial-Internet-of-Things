#!/bin/bash

export KAFKA_HOME=${KAFKA_HOME}
export MQTT_URI=${MQTT_URI:-tcp://localhost:1883}
export MQTT_TOPIC=${MQTT_TOPIC:-topic/#}
export KAFKA_TOPIC=${KAFKA_TOPIC:-mqtt}
export KAFKA_ZOOKEEPER_CONNECT=${KAFKA_ZOOKEEPER_CONNECT:-localhost:2181}


function main {
  echo "- env ------------------------------------------------------------------"
  env | sort
  echo "------------------------------------------------------------------------"
  echo "----------------- mqtt.properties -"
  envsubst < /tmp/mqtt.properties > $KAFKA_HOME/config/mqtt.properties
  cat $KAFKA_HOME/config/mqtt.properties
  echo "------- STARTING ZOOKEPER ---------"
  $KAFKA_HOME/bin/zookeeper-server-start.sh $KAFKA_HOME/config/zookeeper.properties &
  sleep 5
  echo " ------ STARTING KAFKA -------"
  start-kafka.sh &
  #$KAFKA_HOME/bin/kafka-server-start.sh $KAFKA_HOME/config/server.properties &
  sleep 5
  echo " ------ create topic -------"
  $KAFKA_HOME/bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic $KAFKA_TOPIC
  sleep 5
  echo " ------ STARTING MQTT CONNECTOR -------"

  $KAFKA_HOME/bin/connect-standalone.sh $KAFKA_HOME/config/connect-standalone.properties $KAFKA_HOME/config/mqtt.properties
}

main "$@"