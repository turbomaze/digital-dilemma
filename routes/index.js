var express = require('express');
var router = express.Router();
var Game = require('../models/Game');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(io) {
  router.get('/', function(req, res, next) {
    res.render('index', {
      rootUrl: process.env.ROOT_URL,
      socketPort: process.env.SOCKET_PORT
    });
  });

  router.get('/admin', function(req, res, next) {
    Game.findOne({tag: 'main'}, function(err, game) {
      if (err || !game) {
        res.json({
          success: false,
          message: 'can\'t find the game'
        });
      } else {
        res.json({success: true, game: game});
      }
    });
  });

  return router;
};
