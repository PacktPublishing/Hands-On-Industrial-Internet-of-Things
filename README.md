# Hands-On Industrial Internet of Things, Antonio Capasso & Giacomo Veneri, Packt, 2018
This repository provide the code of the book

**Hands-On Industrial Internet of Things, Antonio Capasso & Giacomo Veneri, Packt, 2018**

https://dz13w8afd47il.cloudfront.net/sites/default/files/imagecache/ppv4_main_book_cover/B11397_MockupCover.png

* Chapter06 : edge nodejs code
* Chapter08 : custom iiot platform
* Chapter09 : custom code for Predix Platform
* Chapter10 : code for  aws & aws-greengrass
* Chapter11 : code for  gcp
* Chapter12 : code for  azure & azure-edge
* Chapter13 : code and data for diagnostic analytics and predictive
* Chapter14 : code and data for digital twin


# Prerequisites

* Git - https://git-scm.com/downloads
* Python 3.7 - https://www.python.org/downloads/
* Anaconda 5.2 - https://www.anaconda.com/download/
* Docker Community Edition - https://store.docker.com
* JDK 1.8 - http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
* Git - https://git-scm.com/downloads
* NodeJS 8+ - https://nodejs.org


# Chapter06

Edge NodeJS

## Credits

* Docker Edge - https://www.docker.com/solutions/docker-edge
* Python OPC-UA - https://python-opcua.readthedocs.io/en/latest/
* OPC Foundation - https://opcfoundation.org/﻿

## Code based on
* NodeJS OPC-UA - https://github.com/node-opcua/node-opcua


# Chapter08


It contains code for a custom IIOT platform based on Kafka, Cassandra, KairosDB and Docker. Further snippet of code:

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

## Credits

* Apache Kafka 1.0 Cookbook - Raúl Estrada - December 2017 – Packt
* Learning Apache Cassandra - Second Edition - Sandeep Yarabarla - April 2017 – Packt
* Learning Neo4j 3.x - Second Edition - Jérôme Baton, Rik Van Bruggen - October 2017 - Packt

## Code Based on
* https://github.com/wurstmeister/kafka-docker
* https://github.com/wangdrew/docker-kairosdb
* https://github.com/kairosdb/kairosdb


# Chapter09

## Predix Custom code for APP code fo src

ON dashboard.html

```
<link rel="import" href="./my-ts-chart-js.html" />
<my-timeseries-chart tags="[[tags]]" selected-tag="[[tags[0]]]"></my-timeseries-chart>
```

ON dashboard.es6.js

```
....
      ,
      tags: {
        type: Array,
        value: function() {
          return [{val: "Light", key: "WR-IDP-F0F1:light", unit: "Lumen"},
          {val: "Temperature", key: "WR-IDP-F0F1:temperature", unit: "Celsius"},
          {val: "Sound", key: "WR-IDP-F0F1:sound", unit: "dB"}, 
          {val: "Angle", key: "WR-IDP-F0F1:rotaryangle",unit: "Degree"}];
        }
      },

      ...
```

then copy the file my-ts-chart-js.html on src

## Credits
* Predix Meridium Asset model - https://www.meridium.com/secure/documentation/Help/Unified_V1020/Default/Subsystems/PredixAPM_Assets/Content/am_apm_ingest_assets3/c_apm_asset_about_asset_model.htm

## Code Based on
* https://github.com/predixdesignsystem/px-sample-app
* https://www.predix-ui.com/px-sample-app/

# Chapter10

AWS

## Credits

## Code Based on
* AWS Samples https://github.com/aws-samples/aws-greengrass-samples

## GreenGrass

```

mkdir aws-greengrass
cd aws-greengrass
tar -zxvf *-setup.tar.gz
cd /greengrass/certs/
sudo wget -O root.ca.pem http://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem
cp root.ca.pem certs/
```

### Vagrant
run on Ubuntu with Vagrant

```
tar -zxvf greengrass-linux-x86-*.tar.gz 
cp certs/* greengrass/certs/
cp config/* greengrass/config/


vagrant init ubuntu/xenial64
vagrant up
vagrant ssh
sudo adduser --system ggc_user
sudo addgroup --system ggc_group



sudo cp -R /vagrant/greengrass /
cd /greengrass/ggc/core
sudo ./greengrassd start
```

### NodeJS
```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo ln -s /usr/bin/node /usr/bin/nodejs6.10
```
### OPC UA GG Client


```
git clone https://github.com/aws-samples/aws-greengrass-samples.git
cd aws-greengrass-samples/greengrass-opcua-adapter-nodejs
npm install 
```

Change the file at node_modules/node-opcua/lib/misc/factories.js: line 109 to this:

var generated_source_is_outdated = (!generated_source_exists); 


### OPC UA Sample server
```
git clone https://github.com/aws-samples/aws-greengrass-samples.git
cd aws-greengrass-samples/greengrass-opcua-adapter-nodejs
npm install

# Download the nodejs greengrass sdk from 
#   https://console.aws.amazon.com/iotv2/home?region=us-east-1#/software/greengrass/sdk.

#  Install Greengrass SDK in the node_modules directory
tar -zxvf aws-greengrass-core-sdk-js-*.tar.gz -C /tmp/
unzip /tmp/aws_greengrass_core_sdk_js/sdk/aws-greengrass-core-sdk-js.zip -d node_modules
mv node_modules/aws-greengrass-core-sdk-js/aws-greengrass-core-sdk node_modules

# Archive the whole directory as a zip file
zip -r opcuaLambda.zip * -x \*.git\*

# Create an AWS Lambda with the created zip
aws lambda create-function --function-name <Function_Name> --runtime 'nodejs6.10' --role <Your_Role> --handler 'index.handler' --zip-file opcuaLambda.zip
```

```
cd ~/Documents/workspace-iiot/opcua/node-opcua-sampleserver/
npm start
```

# Chapter11

GCP

## Credits

# Chapter12

Azure and Azure IoT Edge

## Credits
* Azure Predictive Maintenence https://docs.microsoft.com/en-us/azure/machine-learning/team-data-science-process/cortana-analytics-playbook-predictive-maintenance

# Chapter13

* anomaly detection analytics of airplane
* predictive analytics with ARIMA of an industry

## Credits
* https://www.datascience.com/blog/python-anomaly-detection
* https://en.wikipedia.org/wiki/Exploratory_data_analysis

# Chapter14

* RUL prediction with deep-learning
* Model of a wind turbine

## Credits
* https://aws.amazon.com/blogs/big-data/power-from-wind-open-data-on-aws/
* Digital Twins - https://medium.com/@iskerrett/the-reality-of-digital-twins-for-iot-a89f7a51c6fc
* GCP Digital Twins - https://cloud.google.com/blog/products/ai-machine-learning/pre-processing-tensorflow-pipelines-tftransform-google-cloud
* Predix Digital Twins - https://www.ge.com/digital/applications/digital-twin

# Analytics Excercise
TBD

