#!/bin/bash

if [[ -z "$CASSANDRA_HOST_LIST" ]]; then
    export CASSANDRA_HOST_LIST=10.1.2.3:9160
fi
if [[ -z "$KAFKA_BOOTSTRAP_LIST" ]]; then
    export KAFKA_BOOTSTRAP_LIST=10.1.2.3:9092
fi
#if [[ -z "$KAIROS_JETTY_PORT" ]]; then
#    export KAIROS_JETTY_PORT=8083
#fi

#sed -i "s/^kairosdb.jetty.port.*$/kairosdb.jetty.port=$KAIROS_JETTY_PORT/" /opt/kairosdb/conf/kairosdb.properties
sed -i "s/^kairosdb.datastore.cassandra.cql_host_list.*$/kairosdb.datastore.cassandra.cql_host_list=$CASSANDRA_HOST_LIST/" /opt/kairosdb/conf/kairosdb.properties
sed -i "s/^kairosdb.kafka.bootstrap.servers.*$/kairosdb.kafka.bootstrap.servers=$KAFKA_BOOTSTRAP_LIST/" /opt/kairosdb/conf/kairos-kafka.properties

echo "---------------------------------------"
cat /opt/kairosdb/conf/kairosdb.properties

echo "---------------------------------------"
cat /opt/kairosdb/conf/kairos-kafka.properties

echo "---------------------------------------"

sleep 30s
/opt/kairosdb/bin/kairosdb.sh run
