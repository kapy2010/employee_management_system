var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseTypes = require("mongoose-types");
var bcrypt = require('bcrypt-nodejs');

// load mongoose email type
mongooseTypes.loadTypes(mongoose, "email");
var Email = mongoose.SchemaTypes.Email;

var UserSchema = new Schema({
  email: { type: Email, required: true, index: { unique: true } },
  password: { type: String, required: true, select: false },
  firstname: String,
  lastname: String,
  phone: String,
  admin: { type: Boolean, default: false},
  active: { type: Boolean, default: false }
});

UserSchema.pre('save', function(next) {
  var user = this;

  if (user.admin) {
    user.active = true;
  }

  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, null, null, function(err, hash) {
		if (err) return next(err);
    user.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function(password) {
  var user = this;

  return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);
