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
    // init everything
    for (var j = 0; j < 4; j++) {
      for (var i = 0; i < 4; i++) {
        // the state component of the grid
        var cellId = j * 4 + i;
        grid.push({
          id: cellId,
          letter: getLetter(cellId)
        });
      }
    }

    // load the grid in the html
    populateGrid('grid-0', 'cell-0-', grid);
    populateGrid('grid-1', 'cell-1-', grid);

    // initialize grid colors
    if (!false) {
      RANDOM_COLORER_TIMER = setInterval(
        function() {
          randomlyColorGray('cell-0-');
          randomlyColorGray('cell-1-');
        },
        INTERVAL_DELAY
      );
    } else {
      randomlyColorGray('cell-0-');
      randomlyColorGray('cell-1-');
    }

    // socket stuff
    socket.on('game-started', function() {
      // sync the client's game with the server's game
      game.isStarted = true;

      // stop changing the color
      clearInterval(RANDOM_COLORER_TIMER);

      // change the client's instructions
      $('#instructions').text(MESSAGES['started']);
    });

    // event listeners
    $('#secret-reset').click(function() {
      $.get(
        '/api/reset', {}
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
        '/api/start', {}
      ).done(function(res) {
        if (res.success) {
          // game is started!
        } else {
          alert('Unable to start. Maybe the game is ongoing!');
        }
      });
    });
  }

  // the UI component of the grid
  function populateGrid(containerId, cellName, gridToLoad) {
    for (var i = 0; i < gridToLoad.length; i++) {
      var div = document.createElement('div');
      div.id = cellName + gridToLoad[i].id;
      div.className = 'cell';
      div.innerHTML = gridToLoad[i].letter;
      document.getElementById(containerId).appendChild(div);
    }
  }

  function randomlyColorGray(base) {
    var count = 4 * 4;
    for (var i = 0; i < count; i++) {
      var id = '#' + base + i;
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

  function getLetter(i) {
    return String.fromCharCode('A'.charCodeAt(0) + i);
  }

  function getColor(r, g, b) {
    return 'rgba(' + r + ',' + g + ',' + b + ', 255)';
  }

  return {
    init: initDigitalDilemma
  };
})();

window.addEventListener('load', DigitalDilemma.init);
