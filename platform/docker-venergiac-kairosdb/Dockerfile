# Dockerfile to run KairosDB on Cassandra. Configuration is done through environment variables.
#
# Based on Mesosphere
#
# The following environment variables can be set
#
#     $CASS_HOSTS           [kairosdb.datastore.cassandra.host_list] (default: localhost:9042)
#                           Cassandra seed nodes (host:port,host:port)
#
#     $REPFACTOR            [kairosdb.datastore.cassandra.replication_factor] (default: 1)
#                           Desired replication factor in Cassandra
#
#     $PORT_TELNET          [kairosdb.telnetserver.port] (default: 4242)
#                           Port to bind for telnet server
#
#     $PORT_HTTP            [kairosdb.jetty.port] (default: 8080)
#                           Port to bind for http server

#
# Sample Usage:
#                  docker run -P -e "CASS_HOSTS=192.168.1.63:9042" -e "REPFACTOR=1" enachb/archlinux-kairosdb


FROM openjdk:8u171-jdk
MAINTAINER giacomoveneri giacomo.veneri@gmail.com

EXPOSE 8080
EXPOSE 4242
EXPOSE 2003
EXPOSE 2004

# Install envsubsts
RUN \
  apt-get update \
  && apt-get -y install gettext-base \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Install KAIROSDB
RUN  cd /opt; \
  curl -L https://github.com/kairosdb/kairosdb/releases/download/v1.2.1/kairosdb-1.2.1-1.tar.gz | \
  tar zxfp - 

ADD kairosdb.properties /tmp/kairosdb.properties
ADD runKairos.sh /usr/bin/runKairos.sh

# Run kairosdb in foreground on boot
ENTRYPOINT [ "/usr/bin/runKairos.sh" ]
