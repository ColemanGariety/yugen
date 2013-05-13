var mongoose = require('mongoose'),
  File = mongoose.model('File'),
  crypto = require('crypto');

exports.index = function(req, res) {
  var foundUniqueKey = false,
    key,
    keygen = function() {
      key = crypto.randomBytes(4).toString('hex')
      File.findById(key, function(err, file){
        if (!file) {
          foundUniqueKey = true;
        }
      });
    }

  // Start keygen process
  while (foundUniqueKey == false) {
    keygen();
  }

  res.redirect(key)
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
        title: err || file.content == undefined ? "Yugen ⋅ A text editing experience to share." : file.content.split('<br>')[0].replace(/<[^>]*>/g, ''),
        empty: err |file.content == "" || file.content == "<br>" || file.content == undefined
    });
  });
};