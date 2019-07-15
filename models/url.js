var mongoose = require('mongoose');

var urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

exports.UrlModel = mongoose.model('Url', urlSchema);