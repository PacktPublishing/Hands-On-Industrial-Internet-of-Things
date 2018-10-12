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