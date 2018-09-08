var awsIot = require('aws-iot-device-sdk');

//
// Replace the values of '<YourUniqueClientIdentifier>' and '<YourCustomEndpoint>'
// with a unique client identifier and custom host endpoint provided in AWS IoT.
// NOTE: client identifiers must be unique within your AWS account; if a client attempts 
// to connect with a client identifier which is already in use, the existing 
// connection will be terminated.
//
const clientId = 'my-iiot-book-device';
var certPath='fc958ed3d2-';
var device = awsIot.device({
   keyPath: certPath + 'private.pem.key',
  certPath: certPath + 'certificate.pem.crt',
    caPath: 'root-CA.pem',
  clientId: clientId,
      host: 'a13ie6kt9d3nmr.iot.eu-west-1.amazonaws.com'
});

//
// Device is an instance returned by mqtt.Client(), see mqtt.js for full
// documentation.
//
console.log(device);
device
  .on('connect', function() {
    console.log('connect');
    console.log('publishing');
    for (var i=0; i<10; i++) {
      console.log("sent " + i);
      device.publish('signals/'+clientId, JSON.stringify({ 'temperature': i}));
    }
  });

device
  .on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });

  device
  .on('error', function(topic, payload) {
    console.log('error', topic, payload);
  });




