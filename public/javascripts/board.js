var DigitalDilemmaBoard = (function() {
  // CONFIG
  var WIDTH = 2;
  var HEIGHT = 2;

  // STATE VARIABLES
  var game;
  var grid = [];

  function initDigitalDilemmaBoard() {
    // init everything
    for (var j = 0; j < HEIGHT; j++) {
      for (var i = 0; i < WIDTH; i++) {
        // the state component of the grid
        var cellId = j * WIDTH + i;
        grid.push({id: cellId});
      }
    }

    // load the grid in the html
    populateGrid('guess-grid', 'guess-cell-', grid);

    // socket stuff
    socket.on('game-started', function() {
    });
  }

  // the UI component of the grid
  function populateGrid(containerId, cellName, gridToLoad) {
    var width = document.getElementById(containerId).offsetWidth;
    for (var i = 0; i < gridToLoad.length; i++) {
      var div = document.createElement('div');
      div.id = cellName + gridToLoad[i].id;
      div.className = 'cell';
      div.style.width = (width/WIDTH) + 'px';
      div.style.height = (width/HEIGHT) + 'px';
      document.getElementById(containerId).appendChild(div);
    }
    var br = document.createElement('br');
    br.style.clear = 'both';
    document.getElementById(containerId).appendChild(br);
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
  function getColor(r, g, b) {
    return 'rgba(' + r + ',' + g + ',' + b + ', 255)';
  }

  return {
    init: initDigitalDilemmaBoard
  };
})();

window.addEventListener('load', DigitalDilemmaBoard.init);
