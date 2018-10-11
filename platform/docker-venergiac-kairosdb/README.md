venergiac/kairosdb
=============================

Dockerfile to run KairosDB on Cassandra. Configuration is done through environment variables.


Based on Mesosphere

The following environment variables can be set
```
    $CASS_HOSTS           [kairosdb.datastore.cassandra.host_list] (default: localhost:9160)
                          Cassandra seed nodes (host:port,host:port)

    $REPFACTOR            [kairosdb.datastore.cassandra.replication_factor] (default: 1)
                          Desired replication factor in Cassandra

    $PORT_TELNET          [kairosdb.telnetserver.port] (default: 4242)
                          Port to bind for telnet server

    $PORT_HTTP            [kairosdb.jetty.port] (default: 8080)
                          Port to bind for http server
```
#Sample Usage:
```
docker create network kairos-net
docker run --network=kairos-net -p 9042:9042 -p 9160:9160 --name cassandra0 cassandra
docker run --network=kairos-net -P -p 8080:8080 -e "CASS_HOSTS=cassandra0:9160" -e "REPFACTOR=1" iiot-book/kairosdb
```
