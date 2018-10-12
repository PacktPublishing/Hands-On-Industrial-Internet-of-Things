

const digitalTwin = {};

digitalTwin['signal1'] = {upperLimit: 40, lowerLimit: 10};

exports.helloPubSub = (event, callback) => {
  const pubsubMessage = event.data;

  const str = Buffer.from(pubsubMessage.data, 'base64').toString();
  console.log(str);

  const data= str.split(',');
  console.log({
  		'device': data[0],
  		'tag': data[1],
  		'value': data[2],
  		'ts': data[3], 
  		'quality': data[4]

  	});

  const deviceId=data[0];
  const tag=data[1];
  const value=data[2];
  const timestamp = data[3];
  const quality = data[4];

  var dt = digitalTwin[tag];
  if ((value > dt.upperLimit || value <dt.lowerLimit) && (quality=='GOOD')) {
    console.log(`excursion on ${tag} : ${value}`); //REPLACE THIS LINE TO STORE ON BIGTABLE

  }

  callback();
};