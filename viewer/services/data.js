var query = require('./bigquery-fake.js');

function getHistory({ since = null, limit = 100, callback }) {
  query.queryHistory({ since: since, limit: limit, callback: callback});
}

function getMaxWhen({ data }) {
  return Math.max.apply(Math, data.map(function(o){return o.when;}));
}

module.exports = {
  getHistory: getHistory,
  getMaxWhen: getMaxWhen
}