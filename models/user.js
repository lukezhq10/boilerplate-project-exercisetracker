const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// exerciseSchema referenced by userSchema
const exerciseSchema = new Schema({
  description: String,
  duration: Number,
  date: Date,
});

// set up user schema
const userSchema = new Schema({
    username: String,
    count: Number,
    log: [exerciseSchema]
  });

const User = mongoose.model('User', userSchema);
module.exports = User;