
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

const DEVICE_ID='my-iiot-device';

var bigtableOptions = {
  projectId: PROJECT_NAME,
};

(async () => {
  try {
    // Creates a Bigtable client
    const bigtable = new Bigtable(bigtableOptions);

    // Connect to an existing instance:my-bigtable-instance
    const instance = bigtable.instance(INSTANCE_NAME);

    // Connect to an existing table:my-table
    const table = instance.table(TABLE_NAME);

    
    const tsarray = [DEVICE_ID +"#"+ new Date().getTime()];
    const rowsToInsert = tsarray.map((ts, index) => ({
      key: `${ts}`,
      data: {
        [COLUMN_FAMILY_ID]: {
          [COLUMN_QUALIFIER]: {
            value: '15.01'
          },
        },
      },
    }));
    await table.insert(rowsToInsert);
} catch (err) {
    console.error(`Error inserting data:`, err);
    return;
  }
})();