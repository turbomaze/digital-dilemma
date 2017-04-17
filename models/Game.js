var mongoose = require('mongoose');

var requiredBoolean = {type: Boolean, required: true};
var requiredInt = {type: Number, required: true};
var GameSchema = new mongoose.Schema({
  tag: {
    required: true,
    type: String
  },
  dimensions: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  isStarted: requiredBoolean,
  isPaused: requiredBoolean,
  isFinished: requiredBoolean,
  player1: {
    isSet: requiredBoolean,
    grid: [Number], // [0|1|2, ... 4 total, 0|1|2]
    guess: [Number], // [0|1|2, ... 4 total, 0|1|2]
    lives: requiredInt,
    time: requiredInt
  },
  player2: {
    isSet: requiredBoolean,
    grid: [Number], // [0|1|2, ... 4 total, 0|1|2]
    guess: [Number], // [0|1|2, ... 4 total, 0|1|2]
    lives: requiredInt,
    time: requiredInt
  }
}, {
  timestamps: true  
});

module.exports = mongoose.model(
  'Game',
  GameSchema
);
