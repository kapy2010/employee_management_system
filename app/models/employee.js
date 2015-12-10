var mongoose = require('mongoose');
var mongooseTypes = require("mongoose-types");
var Schema = mongoose.Schema;

// load mongoose email type
mongooseTypes.loadTypes(mongoose, "email");
var Email = mongoose.SchemaTypes.Email;

var EmployeeSchema = new Schema({
  email: { type: Email, required: true, index: { unique: true } },
  password: { type: String, required: true, select: false },
  firstname: String,
  lastname: String,
  phone: String,
  status: { type: String, default: 'InActive' }
});

EmployeeSchema.methods.comparePassword = function(password) {
  var emp = this;

  return bcrypt.compareSync(password, emp.password);
};

module.exports = mongoose.model('Employee', EmployeeSchema);
