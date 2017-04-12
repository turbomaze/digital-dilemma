var mongoose = require('mongoose');

var requiredBoolean = {type: Boolean, required: true};
var requiredInt = {type: Number, required: true};
var GameSchema = new mongoose.Schema({
  isStarted: requiredBoolean,
  isPaused: requiredBoolean,
  isFinished: requiredBoolean,
  physicalIsSet: requiredBoolean,
  digitalIsSet: requiredBoolean,
  isPaused: requiredBoolean,
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
  digitalGrid: [Number],
  physicalGrid: [Number],
  path: [Number],
  guessedPath: [Number],
  digitalLives: requiredInt,
  physicalLives: requiredInt,
  digitalTime: requiredInt,
  physicalTime: requiredInt
}, {
  timestamps: true  
});

module.exports = mongoose.model(
  'Game',
  GameSchema
);
