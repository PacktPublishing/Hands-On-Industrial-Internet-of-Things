
const neo4j = require('neo4j-driver/lib/index.js').v1;
const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "admin"));
const session = driver.session();

const resultPromise = session.run(
  "MATCH (:Section)<-[:BELONGING_OF]-(EQ)<-[:MEASURE_OF]-(M) WHERE M.type='TEMPERATURE' RETURN EQ.name, M.name, M.uom")
  .then(result => {
     session.close();

     const singleRecord = result.records[0];
     const measure = singleRecord.get(0);

    console.log(singleRecord);

  // on application exit:
  driver.close();
});