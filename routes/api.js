var express = require('express');
var router = express.Router();
var Game = require('../models/Game');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(io) {
  // NORMAL API ENDPOINTS
  router.get('/toggle/1', function(req, res, next) {
    io.sockets.emit('toggle-1');
    res.json({success: true});
  });

  router.get('/toggle/2', function(req, res, next) {
    io.sockets.emit('toggle-2');
    res.json({success: true});
  });

  return router;
};
