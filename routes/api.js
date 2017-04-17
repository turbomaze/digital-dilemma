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
    var defaultWidth = 2;
    var defaultHeight = 2;
    var defaultLives = 3;
    var defaultTime = 60;

    // make a list of zeroes
    var zeroes = [];
    for (var i = 0; i < defaultWidth * defaultHeight; i++) {
      zeroes.push(0);
    }

    Game.update({
      tag: process.env.PRIMARY_GAME_TAG
    }, {
      $set: {
        tag: process.env.PRIMARY_GAME_TAG,
        'dimensions.width': defaultWidth,
        'dimensions.height': defaultHeight,
        isStarted: false,
        isPaused: false,
        isFinished: false,
        turn: true,
        'player1.isSet': false,
        'player1.grid': zeroes.slice(0),
        'player1.guess': zeroes.slice(0),
        'player1.guessPosition': -1,
        'player1.isSafe': false,
        'player1.lives': defaultLives,
        'player1.time': defaultTime,

        'player2.isSet': false,
        'player2.grid': zeroes.slice(0),
        'player2.guess': zeroes.slice(0),
        'player2.guessPosition': -1,
        'player2.isSafe': false,
        'player2.lives': defaultLives,
        'player2.time': defaultTime
      }
    }, {upsert: true}, function(err, data) {
      if (err) {
        return failure(err, data);
      }

      success(err, data);
    });
  }

  // NORMAL API ENDPOINTS

  router.get('/reset', function(req, res) {
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

  router.get('/start', function(req, res) {
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

  router.post('/grid/:id/reset', function(req, res) {
    var id = parseInt(req.params.id);
    Game.findOne({
      tag: process.env.PRIMARY_GAME_TAG
    }, function(err, game) {
      if (err || !game) {
        console.log(err);
        return res.json({success: false, error: err});
      }

      var player = id === 1 ? game.player1 : game.player2;
      if (
        game.isStarted && !player.isSet &&
        !game.isPaused
      ) {
        for (var i = 0; i < player.grid.length; i++) {
          game.path[i] = 0;
        }
        game.save(function(err) {
          if (err) {
            console.log(err);
            return res.json({success: false, error: err});
          }

          res.json({success: true});
        });
      } else {
        return res.json({
          success: false,
          error: 'cannot reset player\'s grid right now'
        });
      }
    });
  });

  router.post('/grid/:id/set/:color', function(req, res) {
    var id = parseInt(req.params.id);
    var color = parseInt(req.params.color);
    Game.findOne({
      tag: process.env.PRIMARY_GAME_TAG
    }, function(err, game) {
      if (err || !game) {
        console.log(err);
        return res.json({success: false, error: err});
      }

      var player = id === 1 ? game.player1 : game.player2;
      if (
        game.isStarted && !player.isSet &&
        !game.isPaused
      ) {
        var allAreReplaced = true;
        for (var i = 0; i < player.grid.length; i++) {
          if (player.grid[i] === 0) {
            player.grid[i] = color;
            if (i !== player.grid.length - 1) {
              allAreReplaced = false;
            }
            break;
          }
        }

        if (!replacedAColor) {
          player.isSet = true;
        }

        game.save(function(err) {
          if (err) {
            console.log(err);
            return res.json({success: false, error: err});
          }

          res.json({success: true});
        });
      } else {
        return res.json({
          success: false,
          error: 'cannot set player\'s grid right now'
        });
      }
    });
  });

  router.post('/grid/:id/position/:pos', function(req, res) {
    var id = parseInt(req.params.id);
    var pos = parseInt(req.params.pos);
    Game.findOne({
      tag: process.env.PRIMARY_GAME_TAG
    }, function(err, game) {
      if (err || !game) {
        console.log(err);
        return res.json({success: false, error: err});
      }

      var player = id === 1 ? game.player1 : game.player2;
      if (
        game.isStarted && !game.isPaused &&
        game.player1.isSet && game.player2.isSet
      ) {
        player.guessPosition = pos;
        game.save(function(err) {
          if (err) {
            console.log(err);
            return res.json({success: false, error: err});
          }

          res.json({success: true});
        });
      } else {
        return res.json({
          success: false,
          error: 'cannot set player\'s grid right now'
        });
      }
    });
  });

  router.post('/grid/:id/guess/:color', function(req, res) {
    var id = parseInt(req.params.id);
    var color = parseInt(req.params.color);
    Game.findOne({
      tag: process.env.PRIMARY_GAME_TAG
    }, function(err, game) {
      if (err || !game) {
        console.log(err);
        return res.json({success: false, error: err});
      }

      var player = id === 1 ? game.player1 : game.player2;
      var other = id === 1 ? game.player2 : game.player1;
      if (
        game.isStarted && !game.isPaused &&
        game.player1.isSet && game.player2.isSet
      ) {
        // get the right answer
        var rightAnswer = other.grid[player.guessPosition];
        // compare to their guess
        var guessedRight = rightAnswer == color;
        var newGuess = player.guess[player.guessPosition] === 0;
        if (guessedRight && newGuess) {
          player.isSafe = true;
        } else if (!guessedRight) {
          player.lives = player.lives - 1;
        }

        game.save(function(err) {
          if (err) {
            console.log(err);
            return res.json({success: false, error: err});
          }

          res.json({success: true});
        });
      } else {
        return res.json({
          success: false,
          error: 'cannot set player\'s grid right now'
        });
      }
    });
  });

  return router;
};
