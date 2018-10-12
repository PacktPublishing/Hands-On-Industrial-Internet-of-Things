# Dockerfile to run Kafka + MQTT (kafka-connect-mqtt).
#
# Based on confluentinc/cp-kafka-connect
#
# The following environment variables can be set
#
#     $KAFKA_TOPIC          topic
#                           
#
#     $MQTT_URI            uri
#                           
#
#     $MQTT_TOPIC          mqtt


#
# Sample Usage:
#                  docker run -P -e "MQTT_URI=tcp://192.168.0.1:1883" venergiac/kafka-mqtt-connect

FROM wurstmeister/kafka
MAINTAINER giacomoveneri giacomo.veneri@gmail.com

EXPOSE 9092
EXPOSE 2881

# INSTALL GETTEXT
RUN apk update \
    && apk add gettext

# Install Connector
ADD kafka-connect-mqtt-1.1-SNAPSHOT.jar  $KAFKA_HOME/libs/
ADD org.eclipse.paho.client.mqttv3-1.0.2.jar $KAFKA_HOME/libs/

#  MQTT
ADD mqtt.properties /tmp/mqtt.properties
ADD start-all.sh start-all.sh

VOLUME ["/kafka"]

# Run kairosdb in foreground on boot
CMD ["/start-all.sh"]
