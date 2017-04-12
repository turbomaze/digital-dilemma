var DigitalDilemma = (function() {
  // CONFIG
  var TOGGLE_DELAY = 500; // on tap
  var RANDOM_COLORER_TIMER = false; // the interval timer
  var INTERVAL_DELAY = 100; // changing the grid colors
  var GRAY_MAG = 4; // gray magnitude to vary
  var MESSAGES = {
    'beginning': 'Click start to start the game.',
    'started': 'Select a secret path in the grid.',
    'digital-waiting': 'Waiting for other player to finish...',
    'playing': 'Negotiate, swap, and play!',
  };

  // STATE VARIABLES
  var game;
  var grid = [];

  function initDigitalDilemma() {
    // socket stuff
    socket.on('toggle-1', function() {
      console.log('swag');
      toggleCell('#cell-5');
    });
    socket.on('toggle-2', function() {
      toggleCell('#cell-10');
    });

    socket.on('game-started', function() {
      // sync the client's game with the server's game
      game.isStarted = true;

      // stop changing the color
      clearInterval(RANDOM_COLORER_TIMER);

      // change the client's instructions
      $('#instructions').text(MESSAGES['started']);
    });

    $.get(
      '/api/game', {}
    ).done(function(res) {
      if (res.success) {
        game = res.game;

        // initialize the grid
        for (var j = 0; j < game.dimensions.height; j++) {
          for (var i = 0; i < game.dimensions.width; i++) {
            // the state component of the grid
            var cellId = j * game.dimensions.width + i;
            grid.push({
              id: cellId,
              letter: String.fromCharCode(
                'A'.charCodeAt(0) + cellId
              )
            });
          }
        }

        // initialize the instructions
        initializeInstructions();

        // load the grid in the html
        populateGrid('grid', grid);

        // initialize grid colors
        if (!game.isStarted) {
          RANDOM_COLORER_TIMER = setInterval(
            randomlyColorGray,
            INTERVAL_DELAY
          );
        } else {
          randomlyColorGray();
        }
      } else {
        alert(JSON.stringify(res.error));
      }
    });

    // event listeners
    $('#secret-reset').click(function() {
      $.get(
        '/api/game/reset', {}
      ).done(function(res) {
        if (res.success) {
          window.location = '/';
        } else {
          alert('Unable to reset.');
        }
      });
    });

    $('#start-button').click(function() {
      $.get(
        '/api/game/start', {}
      ).done(function(res) {
        if (res.success) {
          // game is started!
        } else {
          alert('Unable to start. Maybe the game is ongoing!');
        }
      });
    });
  }

  function initializeInstructions() {
    if (!game.isStarted) {
      $('#instructions').text(MESSAGES['beginning']);
    } else {
      if (game.digitalIsSet) {
        if (game.physicalIsSet) {
          $('#instructions').text(MESSAGES['playing']);
        } else {
          $('#instructions').text(
            MESSAGES['digital-waiting']
          );
        }
      } else {
        $('#instructions').text(MESSAGES['started']);
      }
    }
  }

  // the UI component of the grid
  function populateGrid(containerId, gridToLoad) {
    for (var i = 0; i < gridToLoad.length; i++) {
      var div = document.createElement('div');
      div.id = 'cell-' + gridToLoad[i].id;
      div.className = 'cell';
      div.innerHTML = gridToLoad[i].letter;
      document.getElementById(containerId).appendChild(div);
    }
  }

  function randomlyColorGray() {
    var count = game.dimensions.width * game.dimensions.height;
    for (var i = 0; i < count; i++) {
      var id = '#cell-' + i;
      var g = Math.floor(100 + 50 * Math.random());
      var oldGray = extractColor($(id).css('background-color'));
      if (oldGray != -1 && oldGray < 150 && oldGray > 100) {
        g = Math.floor(oldGray + (
          -GRAY_MAG + 2 * GRAY_MAG * Math.random())
        );
        g = Math.max(100, Math.min(150, g));
      }
      $(id).css('background-color', getColor(g, g, g));
    }
  }

  function toggleCell(id) {
    var oldColor = $(id).css('background-color');
    $(id).css('background-color', 'rgba(200, 50, 50, 255)');
    setTimeout((function(colorToRestore) {
      return function() {
        $(id).css('background-color', colorToRestore);
      };
    })(oldColor), TOGGLE_DELAY);
  }

  // HELPERS
  function extractColor(colorString) {
    if (colorString.indexOf('(') == -1) {
      return -1;
    } else {
      var firstParen = colorString.indexOf('(');
      var firstComma = colorString.indexOf(',');
      var firstChannel = parseInt(
        colorString.substring(firstParen + 1, firstComma)
      );
      return firstChannel;
    }
  }

  function getColor(r, g, b) {
    return 'rgba(' + r + ',' + g + ',' + b + ', 255)';
  }

  return {
    init: initDigitalDilemma
  };
})();

window.addEventListener('load', DigitalDilemma.init);
