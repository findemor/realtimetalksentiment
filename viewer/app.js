var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , async = require('async')

var config = require('./config.json');
var data = require('./services/data.js');

var app = express()

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}

process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS || config.GOOGLE_APPLICATION_CREDENTIALS;
console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(stylus.middleware({ src: __dirname + '/public', compile: compile}))
app.use(express.static(__dirname + '/public'))

app.get('/', function (req, res) {

  const date = new Date();
  const dateSince = date.setMinutes(date.getMinutes() - 2);
  const since = Math.floor(dateSince / 1000);

  async.waterfall([
    function (callback) { data.getHistory({since: since, limit: 20, callback: callback }) },
    function (history, callback) { callback(null, history, data.getMaxWhen({ data: history })); },
  ], function (err, history, until) {
    if (err) console.log("ERROR: ", JSON.stringify(err));
    res.render('index',
    { title : 'Home',
      data: {
        history: history,
        until: data.getMaxWhen({ data: history })
      }
    })
  })
})

app.get('/api/history', function (req, res) {

  const since = req.query.since != null ? parseInt(req.query.since) : null;
  const limit = req.query.limit != null ? parseInt(req.query.limit) : null;

  data.getHistory({since: since, limit: limit || 10, callback: function(err, history) {

    const until = data.getMaxWhen({ data: history });

    res.json({
      history: history,
      until: until > 0 ? until : since
    });
  }});
})

app.listen(config.port)
