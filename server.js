'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
var dns = require('dns');

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/api/is-mongoose-ok', function(req, res) {
  if (mongoose) {
    res.json({isMongooseOk: !!mongoose.connection.readyState})
  } else {
    res.json({isMongooseOk: false})
  }
});

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

var url = require('./models/url.js').UrlModel;

app.post("/api/shorturl/new", function(req, res, next) {         
  const hostName = req.body.url.replace('http://','').replace('https://','');

  dns.lookup(hostName, function(err, addresses, family) {
    if (addresses) {
      url.find({original_url: req.body.url}, function(err, docs) {
        if (docs.length > 0) {
          res.json(docs[0]);
          return next();
        }

        url.findOne().sort({short_url: 'desc'}).exec()
            .then(function(url) {
              return url.short_url + 1;
            })
            .then(function(nextShortUrl) {
              var newShortUrl = new url({original_url: req.body.url, short_url: nextShortUrl});

              newShortUrl.save(function (err, data) {
                if(err) { return next(err) }
                res.json(data);
            });
          })
      });
    } else {
      return res.json({error:"invalid URL"});
    }
  });

});

app.get("/api/shorturl/:url", function(req, res, next) {
  url.findOne({short_url: req.params.url}, function (err, data) {
    res.redirect(data.original_url);
    next();
  })
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});