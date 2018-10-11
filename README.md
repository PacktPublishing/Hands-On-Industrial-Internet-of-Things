# Hands-On Industrial Internet of Things, Antonio Capasso & Giacomo Veneri, Packt, 2018
This repository provide the code of the book

**Hands-On Industrial Internet of Things, Antonio Capasso & Giacomo Veneri, Packt, 2018**


* platform (**ch8**) : custom iiot platform
* predix (**ch9**) : custom code for Predix Platform
* cloud : code for 
  * AWS (**ch10**) 
  * GCP (**ch11**) 
  * Azure (**ch12**)
* analytics (**ch13**) : code and data for diagnostic analytics and predictive
* digital-twin (**ch14**) : code and data for digital twin


# Prerequisites

* Git - https://git-scm.com/downloads
* Python 3.7 - https://www.python.org/downloads/
* Anaconda 5.2 - https://www.anaconda.com/download/
* Docker Community Edition - https://store.docker.com
* JDK 1.8 - http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
* Git - https://git-scm.com/downloads
* NodeJS 8+ - https://nodejs.org




# Platform


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

# Predix Custom code for APP code fo src

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

# Cloud

Devices for Azure, AWS and GCP.


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

# Analytics

* anomaly detection analytics of airplane
* predictive analytics with ARIMA of a refinery

# Digital twin

* RUL prediction with deep-learning
* Model of a wind turbine

# Analytics Excercise
TBD

