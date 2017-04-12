var DigitalDilemma = (function() {
  // CONFIG
  var WIDTH = 4;
  var HEIGHT = 4;
  var TOGGLE_DELAY = 500;
  var RANDOM_COLORER = false;
  var INTERVAL_DELAY = 100;
  var GRAY_MAG = 4;

  // STATE VARIABLES
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

    // initialize the grid
    for (var i = 0; i < WIDTH; i++) {
      for (var j = 0; j < HEIGHT; j++) {
        // the state component of the grid
        var cellId = j * WIDTH + i;
        grid.push({
          id: cellId
        });
      }
    }

    // load the grid in the html
    populateGrid('grid', grid);

    // initialize grid colors
    RANDOM_COLORER = setInterval(
      randomlyColorGray,
      INTERVAL_DELAY
    );

    // event listeners
  }

  // the UI component of the grid
  function populateGrid(containerId, gridToLoad) {
    for (var i = 0; i < gridToLoad.length; i++) {
      var div = document.createElement('div');
      div.id = 'cell-' + gridToLoad[i].id;
      div.className = 'cell';
      div.innerHTML = '&nbsp;';
      document.getElementById(containerId).appendChild(div);
    }
  }

  function randomlyColorGray() {
    for (var i = 0; i < WIDTH * HEIGHT; i++) {
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
