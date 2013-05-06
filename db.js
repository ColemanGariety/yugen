var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var File = new Schema({
    token      : String,
    content    : String,
/*     updated_at : Date */
});

mongoose.model( 'File', File );

mongoose.connect( 'mongodb://localhost/yugen' );