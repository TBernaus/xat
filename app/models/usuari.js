var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {type: String, required: true},
    pass: {type: String, required: true},
    rol: {type: String, required: false, default: "user"},
});

module.exports = mongoose.model('User', userSchema);
