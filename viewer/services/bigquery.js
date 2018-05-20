// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
const config = require('../config.json');

// Your Google Cloud Platform project ID
const projectId = config.projectId;

// Creates a client
const bigquery = new BigQuery({
  projectId: projectId,
});


function queryData(callback) {

    const sql = "SELECT 'when',faces, topic, joy, anger, sorrow, surprise FROM `" + projectId + ".realtimesentiment.samples` LIMIT 1000";

    const options = {
        query: sql,
        timeoutMs: 10000,
        useLegacySql: false
    }
    
    bigquery
        .query(options)
        .then(results => {
          console.log(JSON.stringify(results));
          callback(null, results);
        })
        .catch(err => {
          console.error('ERROR:', err);
          callback(err);
        });
      // [END bigquery_simple_app_query]
    
}

module.exports = queryData;

