//var BigQuery = require('@google-cloud/bigquery');
//var bq = new BigQuery({ projectId : 'iiot-book'});

// needs npm install --save @google-cloud/bigtable
// Imports the Google Cloud client library
const Bigtable = require('@google-cloud/bigtable');

// The name of the Cloud Bigtable instance
const INSTANCE_NAME = 'iiot-book-data';
const PROJECT_NAME = 'iiot-book-local'; //replace with iiot-book
// The name of the Cloud Bigtable table
const TABLE_NAME = 'iiot-book-signals';
const COLUMN_FAMILY_ID='signal1';
const COLUMN_QUALIFIER='value';

var bigtableOptions = {
  projectId: PROJECT_NAME,
};

// Creates a Bigtable client
const bigtable = new Bigtable(bigtableOptions);

// Connect to an existing instance:my-bigtable-instance
const instance = bigtable.instance(INSTANCE_NAME);

// Connect to an existing table:my-table
const table = instance.table(TABLE_NAME);

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

  try {

    const tsarray = [deviceId +"#"+ timestamp];
    const rowsToInsert = tsarray.map((ts, index) => ({
      key: `${ts}`,
      data: {
        [tag]: {
          [COLUMN_QUALIFIER]: {
            value: value
          },
        },
      },
    }));
    await table.insert(rowsToInsert);
} catch (err) {
    console.error(`Error inserting data:`, err);
    callback(); //DONE WITH ERROR
  }
  
/*
  bq.dataset('my-device-ds')
  	.table('iiot-book-table')
  	.insert({
  		'device': data[0],
  		'tag': data[1],
  		'value': data[2],
  		'ts': data[3], 
  		'quality': data[4]

  	})
  	.then(callback())
  	.catch(function(err) {
  		console.error("ERROR:", err);
  		callback(); //DONE WITH ERROR

  	});
  	

  	callback();*/
};


