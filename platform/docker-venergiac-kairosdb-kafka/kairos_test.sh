#!/bin/bash

curl -X POST -d @kairos_write.txt http://10.1.2.3:8080/api/v1/datapoints --header "Content-Type:application/json"
curl -X POST -d @kairos_query.txt http://10.1.2.3:8080/api/v1/datapoints/query --header "Content-Type:application/json"
