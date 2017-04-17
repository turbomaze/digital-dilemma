var express = require('express');
var router = express.Router();
var Game = require('../models/Game');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(io) {
  // HELPERS
  var defaultWidth = 2;
  var defaultHeight = 2;

  function pyRange(n) {
    var ret = [];
    for (var i = 0; i < n; i++) {
      ret.push(i);
    }
    return ret;
  }

  function resetMainGame(success, failure) {
    // make a list of zeroes
    var zeroes = [];
    for (var i = 0; i < defaultWidth * defaultHeight; i++) {
      zeroes.push(0);
    }

    Game.remove({
      tag: process.env.PRIMARY_GAME_TAG
    }, function(err) {
      if (err) {
        return failure(err);
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
          'player1.lives': parseInt(process.env.DEFAULT_LIVES),
          'player1.time': parseInt(process.env.DEFAULT_TIME),
  
          'player2.isSet': false,
          'player2.grid': zeroes.slice(0),
          'player2.guess': zeroes.slice(0),
          'player2.guessPosition': -1,
          'player2.isSafe': false,
          'player2.lives': parseInt(process.env.DEFAULT_LIVES),
          'player2.time': parseInt(process.env.DEFAULT_TIME)
        }
      }, {upsert: true}, function(err, data) {
        if (err) {
          return failure(err, data);
        }

        io.sockets.emit('game-reset');
  
        success(err, data);
      });
    });
  }

  function decreaseTimer() {
    var start = +new Date();
    Game.findOne({
      tag: process.env.PRIMARY_GAME_TAG
    }, function(err, game) {
      if (err || !game) {
        console.log(err);
        return res.json({success: false, error: err});
      }

      if (
        game.isStarted && !game.isPaused && !game.isFinished &&
        game.player1.isSet && game.player2.isSet
      ) {
        var gameOver = false;
        var lostLife = false;
        var player = game.turn ? game.player1 : game.player2;
        var originalTurn = game.turn;
        player.time -= 1;
        if (player.time === 0) {
          player.time = parseInt(process.env.DEFAULT_TIME);
          game.turn = !game.turn;
          if (!player.isSafe) {
            player.lives -= 1;
            lostLife = true;
            if (player.lives === 0) {
              gameOver = true;
              game.isFinished = true;
            }
          } else {
            player.isSafe = false;
          }
        }

        game.save(function(err) {
          if (err) {
            console.log(err);
            return res.json({success: false, error: err});
          }

          io.sockets.emit('timer', {
            player: originalTurn ? 1 : 2,
            time: player.time
          });

          if (lostLife) {
            io.sockets.emit('lost-life', {
              player: originalTurn ? 1 : 2,
              lives: player.lives
            });
          }

          if (gameOver) {
            // guaranteed that game.turn = !originalTurn
            io.sockets.emit('game-over', {
              winner: game.turn ? 1 : 2
            });
          } else {
            var end = +new Date();
            var duration = end - start;

            // call the timer again if it should be continued
            setTimeout(decreaseTimer, 1000 - duration);
          }
        });
      } else {
        // oops
        return false;
      }
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

  router.get('/restart', function(req, res) {
    resetMainGame((function(myReq, myRes) {
      return function(err, data) {
        // success
        Game.findOne({
          tag: process.env.PRIMARY_GAME_TAG
        }, function(err, game) {
          if (err || !game) {
            console.log(err);
            return myRes.json({success: false, error: err});
          }

          if (!game.isStarted) {
            game.isStarted = true;
            game.save(function(err) {
              if (err) {
                console.log(err);
                return myRes.json({success: false, error: err});
              }

              // notify everyone the game has started
              io.sockets.emit('game-started');

              return myRes.json({success: true});
            });
          } else {
            return myRes.json({success: false, message: 'redundant'});
          }
        });
      };
    })(req, res), (function(myReq, myRes) {
      return function(err, data) {
        console.log(err);
        return myRes.json({success: false, error: err});
      };
    })(req, res));
  });

  router.get('/grid/:id/reset', function(req, res) {
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
        !game.isPaused && !game.isFinished
      ) {
        for (var i = 0; i < player.grid.length; i++) {
          player.grid.set(i, 0);
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

  router.get('/grid/:id/position/:pos', function(req, res) {
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
        game.isStarted && !game.isPaused && !game.isFinished &&
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

  router.get('/grid/:id/tap/:color', function(req, res) {
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
        game.isStarted && !game.isPaused && !game.isFinished
      ) {
        // everyone is set; this is a guess
        if (game.player1.isSet && game.player2.isSet) {
          // get the right answer
          var rightAnswer = other.grid[player.guessPosition];
          // compare to their guess
          var wonGame = false;
          var otherWonGame = false;
          var guessedRight = rightAnswer == color;
          var newGuess = player.guess[player.guessPosition] === 0;
          if (guessedRight && newGuess) {
            if (id === (game.turn ? 1 : 2)) {
              player.isSafe = true;
            }
            player.guess.set(player.guessPosition, color);
            var p = player.guess.reduce(function(a, b) {
              return a * b;
            }, 1);
            if (p !== 0) {
              // because they guessed everything correctly
              wonGame = true; 
              game.isFinished = true;
            }
          } else if (!guessedRight) {
            player.lives = player.lives - 1;
            if (player.lives === 0) {
              otherWonGame = true;
              game.isFinished = true;
            }
          }

          game.save(function(err) {
            if (err) {
              console.log(err);
              return res.json({success: false, error: err});
            }

            if (guessedRight && newGuess) {
              io.sockets.emit('guessed-correctly', {
                player: id,
                guess: player.guess
              });
            }

            if (!guessedRight) {
              io.sockets.emit('lost-life', {
                player: id,
                lives: player.lives
              });
            }

            if (wonGame) {
              io.sockets.emit('game-over', {
                winner: id
              });
            } else if (otherWonGame) {
              io.sockets.emit('game-over', {
                winner: 3 - id
              });
            }

            return res.json({success: true});
          });
        } else if (!player.isSet) { // they're not set; it's a set
          var allAreReplaced = true;
          for (var i = 0; i < player.grid.length; i++) {
            if (player.grid[i] === 0) {
              player.grid.set(i, color);
              if (i !== player.grid.length - 1) {
                allAreReplaced = false;
              }
              break;
            }
          }

          if (allAreReplaced) {
            player.isSet = true;
          }

          game.save(function(err) {
            if (err) {
              console.log(err);
              return res.json({success: false, error: err});
            }

            if (game.player1.isSet && game.player2.isSet) {
              // start the timer
              decreaseTimer();
            }

            return res.json({success: true});
          });
        } else {
          return res.json({
            success: false,
            error: 'cannot tap player\'s grid right now'
          });
        }
      } else {
        return res.json({
          success: false,
          error: 'cannot tap player\'s grid right now'
        });
      }
    });
  });

  return router;
};
