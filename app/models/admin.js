var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var AdminSchema = new Schema({
  name: String,
  username: { type: String, required: true, index: { unique: true} },
  password: { type: String, required: true, select: false }
});

AdminSchema.methods.comparePassword = function(password) {
  var admin = this;

  return bcrypt.compareSync(password, admin.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
