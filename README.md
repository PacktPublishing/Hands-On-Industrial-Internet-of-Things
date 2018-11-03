# Hands-On Industrial Internet of Things by Giacomo Veneri & Antonio Capasso, Packt, 2018
This repository provide the code of the book

**Hands-On Industrial Internet of Things by Giacomo Veneri & Antonio Capasso, Packt, 2018**

![alt text](https://dz13w8afd47il.cloudfront.net/sites/default/files/imagecache/ppv4_main_book_cover/B11397_MockupCover.png)

* [Chapter06](https://github.com/PacktPublishing/Hands-On-Industrial-Internet-of-Things/tree/master/Chapter06) : edge nodejs code
* [Chapter08](https://github.com/PacktPublishing/Hands-On-Industrial-Internet-of-Things/tree/master/Chapter08) : custom iiot platform
* [Chapter09](https://github.com/PacktPublishing/Hands-On-Industrial-Internet-of-Things/tree/master/Chapter09) : custom code for Predix Platform
* [Chapter10](https://github.com/PacktPublishing/Hands-On-Industrial-Internet-of-Things/tree/master/Chapter10) : code for  aws & aws-greengrass
* [Chapter11](https://github.com/PacktPublishing/Hands-On-Industrial-Internet-of-Things/tree/master/Chapter11) : code for  gcp
* [Chapter12](https://github.com/PacktPublishing/Hands-On-Industrial-Internet-of-Things/tree/master/Chapter12) : code for  azure & azure-edge
* [Chapter13](https://github.com/PacktPublishing/Hands-On-Industrial-Internet-of-Things/tree/master/Chapter13) : code and data for diagnostic analytics and predictive
* [Chapter14](https://github.com/PacktPublishing/Hands-On-Industrial-Internet-of-Things/tree/master/Chapter14) : code and data for adavanced analytics
* [Chapter15](https://github.com/PacktPublishing/Hands-On-Industrial-Internet-of-Things/tree/master/Chapter15) : jupyter notebooks for sagemaker and azure ml


# Prerequisites

* Git - https://git-scm.com/downloads
* Python 3.7 - https://www.python.org/downloads/
* Anaconda 5.3 - https://www.anaconda.com/download/
* Docker Community Edition - https://store.docker.com
* JDK 1.8 - http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
* Git - https://git-scm.com/downloads
* NodeJS 8+ - https://nodejs.org

***

# Chapter 06

Edge NodeJS

## Credits

* Docker Edge - https://www.docker.com/solutions/docker-edge
* Python OPC-UA - https://python-opcua.readthedocs.io/en/latest/
* OPC Foundation - https://opcfoundation.org/﻿

## Code based on
* NodeJS OPC-UA - https://github.com/node-opcua/node-opcua

***

# Chapter 08

It contains code for a custom I-IOT platform based on Kafka, Cassandra, KairosDB and Docker. Further snippet of code:

## Credits

* Apache Kafka 1.0 Cookbook - Raúl Estrada - December 2017 – Packt
* Learning Apache Cassandra - Second Edition - Sandeep Yarabarla - April 2017 – Packt
* Learning Neo4j 3.x - Second Edition - Jérôme Baton, Rik Van Bruggen - October 2017 - Packt

## Code Based on
* https://github.com/wurstmeister/kafka-docker
* https://github.com/wangdrew/docker-kairosdb
* https://github.com/kairosdb/kairosdb
* https://hub.docker.com/r/venergiac/kafka-mqtt-connector/
* https://hub.docker.com/r/venergiac/kairosdb/


***

# Chapter 09

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

***

# Chapter 10

AWS

## Credits

* Learning AWS IoT by Agus Kurniawan - Packt - 2018

## Code Based on
* AWS Samples https://github.com/aws-samples/aws-greengrass-samples


***

# Chapter 11

GCP

## Credits

* Google Cloud Platform Cookbook - Legorie Rajan PS - April 2018 - Packt - https://www.packtpub.com/virtualization-and-cloud/google-cloud-platform-cookbook

***

# Chapter 12

Azure and Azure IoT Edge

## Credits
* Azure Predictive Maintenence https://docs.microsoft.com/en-us/azure/machine-learning/team-data-science-process/cortana-analytics-playbook-predictive-maintenance

***

# Chapter 13

* anomaly detection analytics of airplane
* predictive analytics with ARIMA of an industry

## Credits
* https://www.datascience.com/blog/python-anomaly-detection
* https://en.wikipedia.org/wiki/Exploratory_data_analysis

***

# Chapter 14

* RUL prediction with deep-learning
* Model of a wind turbine

## Credits
* https://aws.amazon.com/blogs/big-data/power-from-wind-open-data-on-aws/
* Digital Twins - https://medium.com/@iskerrett/the-reality-of-digital-twins-for-iot-a89f7a51c6fc
* GCP Digital Twins - https://cloud.google.com/blog/products/ai-machine-learning/pre-processing-tensorflow-pipelines-tftransform-google-cloud
* Predix Digital Twins - https://www.ge.com/digital/applications/digital-twin
* Microsoft Digital Twins - https://enterprise.microsoft.com/en-us/trends/microsoft-is-redefining-digital-twins-in-discrete-manufacturing/

## Code based on
* https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/#turbofan
* https://github.com/umbertogriffo/Predictive-Maintenance-using-LSTM

***

# Chapter 15

* Deploying a wind turbine model algorithm on Azure ML
* Deploying a data driven wind turbine model algorithm on Azure ML
* Deploying a RUL estimation algorithm on AWS Sagemaker

## Code based on
Chapter 13 and Chapter 14.