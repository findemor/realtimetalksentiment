var query = require('./bigquery.js');

function getHistory({ since = null, limit = 100, callback }) {
  query.queryHistory({ since: since, limit: limit, callback: function(err, data) {
    
    function compare(a,b) {
      if (a.ts < b.ts)
        return -1;
      if (a.ts > b.ts)
        return 1;
      return 0;
    }
    
    var ordered = data.sort(compare);

    return callback(err, ordered);
  }});
}

function getMaxWhen({ data }) {
  return Math.max.apply(Math, data.map(function(o){return o.ts;}));
}

module.exports = {
  getHistory: getHistory,
  getMaxWhen: getMaxWhen
}