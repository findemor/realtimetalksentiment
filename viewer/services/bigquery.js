// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
const config = require('../config.json');

const timeoutMs = 10000;

// Your Google Cloud Platform project ID
const projectId = config.projectId;

// Creates a client
const bigquery = new BigQuery({
  projectId: projectId,
});


function queryHistory ({ since = null, limit = 100, callback }) {

    const sql = "SELECT ts, faces, topic, joy, anger, sorrow, surprise, file FROM `" + projectId + ".realtimesentiment.samples` "
    + (since != null ? " WHERE ts > " + since : "") 
    + " ORDER BY ts desc"
    + " LIMIT " + limit;

    const options = {
        query: sql,
        timeoutMs: timeoutMs,
        useLegacySql: false
    }
    
    bigquery
        .query(options)
        .then(results => {
          console.log(JSON.stringify(results));

          let res = results[0];
          if (res == null && res.length < 1)
            res = null;

          callback(null, res);
        })
        .catch(err => {
          console.error('ERROR:', err);
          callback(err);
        });
      // [END bigquery_simple_app_query]
    
}

module.exports = {
  queryHistory: queryHistory
};

