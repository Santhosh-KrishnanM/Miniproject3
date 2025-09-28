const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  phone:    { type: String, required: true },
  //address:  { type: String, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('Admin', adminSchema);