FROM openjdk:8u171-jdk
MAINTAINER giacomoveneri giacomo.veneri@gmail.com

# Install KAIROSDB
RUN cd /opt; \
  curl -L https://github.com/kairosdb/kairosdb/releases/download/v1.2.1/kairosdb-1.2.1-1.tar.gz | \
  tar zxfp -

ADD kairosdb.properties /opt/kairosdb/conf/kairosdb.properties
ADD kafka-mqtt-plugin/kairos-kafka.properties /opt/kairosdb/conf/kairos-kafka.properties


ADD kafka-mqtt-plugin/gson-2.2.4.jar /opt/kairosdb/lib
ADD kafka-mqtt-plugin/jackson-jaxrs-json-provider-2.2.3.jar /opt/kairosdb/lib
ADD kafka-mqtt-plugin/kafka-streams-1.1.0.jar /opt/kairosdb/lib
ADD kafka-mqtt-plugin/jackson-core-2.2.3.jar /opt/kairosdb/lib	
ADD kafka-mqtt-plugin/jackson-module-jaxb-annotations-2.2.3.jar /opt/kairosdb/lib
ADD kafka-mqtt-plugin/kairos-kafka-1.0-SNAPSHOT.jar /opt/kairosdb/lib
ADD kafka-mqtt-plugin/jackson-jaxrs-base-2.2.3.jar /opt/kairosdb/lib	
ADD kafka-mqtt-plugin/kafka-clients-1.1.0.jar /opt/kairosdb/lib	


# Kairos API telnet and jetty ports
EXPOSE 4242 8083



# Copy scripts into container to set kairos config params
ADD config-kairos.sh /usr/bin/config-kairos.sh

# Run kairosdb in foreground on boot
CMD ["/usr/bin/config-kairos.sh"]
