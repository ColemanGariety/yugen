var mongoose = require('mongoose'),
  File = mongoose.model('File'),
  crypto = require('crypto');

exports.index = function(req, res) {
  res.redirect(crypto.randomBytes(3).toString('hex'))
};

exports.read = function(req, res) {
  var token = req.param('token')
  File.find({ token: token }, function (err, file, count) {
    // Flatten array
    if (file[0]) {
      file = file[0]
    }

    res.render('index', {
        content: err || file.content == undefined ? "" : file.content,
        empty: err |file.content == "" || file.content == "<br>" || file.content == undefined
    });
  });
};