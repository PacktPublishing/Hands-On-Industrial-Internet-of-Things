docker-kairosdb
=======

## Requirements

Dockerized cassandra

    docker pull poklet/cassandra
    docker pull poklet/opscenter

## Install

    docker build -t kairosdb .

## Run

    docker run -d -p 8080:8080 -p 4242:4242 --name kairos kairosdb
