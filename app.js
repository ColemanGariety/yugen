var express = require('express'),
  app = express(),
  io = require('socket.io').listen(8080),
  db = require( './db' ),
  mongoose = require('mongoose'),
  File = mongoose.model('File');

// Setup templating
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.set('views', __dirname);
app.use(express.bodyParser());

// Initiate sockets on port 8080
io.sockets.on('connection', function (socket) {
  socket.on('join', function(data) {
    socket.join(data)
    socket.token = data
  })

  socket.on('msg', function(data) {
    socket.broadcast.in(socket.token).emit('msg', data)

    if (data == "" || data == "<br>" || data == undefined) {
      File.findOne({token: socket.token }, function(err, file) {
        if (file != null) {
          file.remove(function(err) {
            if (!err) {
              console.log("Destroyed " + socket.token)
            }
          });
        }
      })
    } else {
      File.update({ token: socket.token }, { content: data }, { upsert: true }, function (err, numberAffected, raw) {
        if (!err) {
          console.log("Saved " + socket.token)
        }
      });
    }
  })

  socket.on('disconnect', function(data) {
    socket.leave(socket.token)
  })
})

// Routes
var routes = require( './routes.js' );

app.get( '/', routes.index );
app.get( '/:token', routes.read );
app.use('/assets', express.static(__dirname + "/assets"));

// Redirect app

var redirect = express();

redirect.all('*', function(req, res){
  res.redirect('http://yugentext.com:8081/' + req.subdomains[0]);
});

// Main app

app.use(express.vhost('*.yugentext.com', redirect))
app.use(express.vhost('yugentext.com', app));

// Start app on port 8081
app.listen(8081);
console.log('Listening on port 8081');
