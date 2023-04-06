const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// set up exercise schema
const exerciseSchema = new Schema({
    description: String,
    duration: Number,
    date: Date,
  });

const Exercise = mongoose.model('Exercise', exerciseSchema);
module.exports = Exercise;