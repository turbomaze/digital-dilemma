var express = require('express');
var router = express.Router();
var Game = require('../models/Game');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(io) {
  return router;
};
