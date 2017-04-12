var express = require('express');
var router = express.Router();
var Game = require('../models/Game');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(io) {
  // HELPERS
  function pyRange(n) {
    var ret = [];
    for (var i = 0; i < n; i++) {
      ret.push(i);
    }
    return ret;
  }

  function resetMainGame(success, failure) {
    // defaults
    var defaultWidth = 4;
    var defaultHeight = 4;
    var defaultLives = 3;
    var defaultTime = 60;

    Game.update({
      tag: process.env.PRIMARY_GAME_TAG
    }, {
      $set: {
        isStarted: false,
        isPaused: false,
        isFinished: false,
        physicalIsSet: false,
        digitalIsSet: false,
        isPaused: false,
        tag: process.env.PRIMARY_GAME_TAG,
        'dimensions.width': defaultWidth,
        'dimensions.height': defaultHeight,
        digitalGrid: pyRange(defaultWidth * defaultHeight),
        physicalGrid: [],
        path: [],
        guessedPath: [],
        digitalLives: defaultLives,
        physicalLives: defaultLives,
        digitalTime: defaultTime,
        physicalTime: defaultTime 
      }
    }, {upsert: true}, function(err, data) {
      if (err) {
        return failure(err, data);
      }

      success(err, data);
    });
  }

  // NORMAL API ENDPOINTS
  router.get('/toggle/1', function(req, res) {
    io.sockets.emit('toggle-1');
    res.json({success: true});
  });

  router.get('/toggle/2', function(req, res) {
    io.sockets.emit('toggle-2');
    res.json({success: true});
  });

  // get all the public data for a game
  router.get('/game', function(req, res) {
    Game.findOne({
      tag: process.env.PRIMARY_GAME_TAG
    }, function(err, game) {
      if (err || !game) {
        console.log(err);
        return res.json({success: false, error: err});
      }

      // return the rest to the client
      res.json({
        success: true,
        game: {
          isStarted: game.isStarted,
          isPaused: game.isPaused,
          isFinished: game.isFinished,
          physicalIsSet: game.physicalIsSet,
          digitalIsSet: game.digitalIsSet,
          isPaused: game.isPaused,
          tag: game.tag,
          dimensions: {
            width: game.dimensions.width,
            height: game.dimensions.height,
          },
          digitalGrid: game.digitalGrid,
          path: game.path,
          digitalLives: game.digitalLives,
          physicalLives: game.physicalLives,
          digitalTime: game.digitalTime,
          physicalTime: game.physicalTime
        }
      });
    });
  });

  router.get('/game/reset', function(req, res) {
    resetMainGame((function(myReq, myRes) {
      return function(err, data) {
        return myRes.json({success: true});
      };
    })(req, res), (function(myReq, myRes) {
      return function(err, data) {
        console.log(err);
        return myRes.json({success: false, error: err});
      };
    })(req, res));
  });

  router.get('/game/start', function(req, res) {
    Game.findOne({
      tag: process.env.PRIMARY_GAME_TAG
    }, function(err, game) {
      if (err || !game) {
        console.log(err);
        return res.json({success: false, error: err});
      }

      if (!game.isStarted) {
        game.isStarted = true;
        game.save(function(err) {
          if (err) {
            console.log(err);
            return res.json({success: false, error: err});
          }

          // notify everyone the game has started
          io.sockets.emit('game-started');

          res.json({success: true});
        });
      } else {
        res.json({success: false, message: 'redundant'});
      }
    });
  });

  router.post('/game/digital/reset', function(req, res) {
    /*
    if digitalIsSet
      do nothing
    else
      clear all the digital path stuff
    */
    res.json({success: false, message: 'not impl'});
  });

  router.post('/game/digital/set/done', function(req, res) {
    /*
    if !isStarted || digitalIsSet || path.length == 0
      do nothing
    else
      digitalIsSet = true
      check for all-are-set condition
    */
    res.json({success: false, message: 'not impl'});
  });

  router.post('/game/digital/set/:id', function(req, res) {
    /*
    if !isStarted || digitalIsSet
      do nothing
    else
      set the next part of this path; must be unique
    */
    res.json({success: false, message: 'not impl'});
  });

  router.get('/game/physical/reset', function(req, res) {
    /*
    if !isStarted || physicalIsSet
      do nothing
    else
      reset the correct grid state for physical
    */
    res.json({success: false, message: 'not impl'});
  });

  router.get('/game/physical/set/:id', function(req, res) {
    /*
    if !isStarted || physicalIsSet
      do nothing
    else
      set the next subsequent component of the correct grid
    */
    res.json({success: false, message: 'not impl'});
  });

  return router;
};
