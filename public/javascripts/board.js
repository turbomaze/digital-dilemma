var DigitalDilemmaBoard = (function() {
  // CONFIG
  var WIDTH = 2;
  var HEIGHT = 2;
  var COLOR_ONE = 'red';
  var COLOR_TWO = 'blue';

  // STATE VARIABLES
  var game;
  var grid = [];

  function initDigitalDilemmaBoard() {
    // init html grid
    for (var j = 0; j < HEIGHT; j++) {
      for (var i = 0; i < WIDTH; i++) {
        // the state component of the grid
        var cellId = j * WIDTH + i;
        grid.push({id: cellId});
      }
    }

    // load the grid in the html
    populateGrid('guess-grid', 'guess-cell-', grid);

    // get the first batch of data for the page
    $.get(
      '/game'
    ).done(function(data) {
      if (data.success === true) {
        game = data.game;

        updateTime();
        updateGrid();
        updateLives();
      } else {
        alert(JSON.stringify(res.error));
      }
    });

    // socket stuff
    socket.on('game-started', function() {
      console.log('game started');
    });
    socket.on('timer', function(data) {
      if (PLAYER === data.player) {
        var player = PLAYER === 1 ? game.player1 : game.player2;
        player.time = data.time;
        updateTime();
      }
    });
    socket.on('guessed-correctly', function(data) {
      if (PLAYER === data.player) {
        var player = PLAYER === 1 ? game.player1 : game.player2;
        player.guess = data.guess;
        updateGrid();
      }
    });
    socket.on('lost-life', function(data) {
      if (PLAYER === data.player) {
        var player = PLAYER === 1 ? game.player1 : game.player2;
        player.lives = data.lives;
        updateLives();
      }
    });
    socket.on('game-over', function(data) {
      if (PLAYER === data.winner) {
        alert('Congrats! You won!');
      } else {
        alert('Aww, you lost the game.');
      }
    });
    socket.on('game-reset', function() {
      window.location.reload(true);
    });
  }

  function updateTime() {
    var player = PLAYER === 1 ? game.player1 : game.player2;
    var time = player.time;
    var minutes = Math.floor(time/60) + '';
    while (minutes.length < 2) { minutes = '0' + minutes; }
    var seconds = (time % 60) + '';
    while (seconds.length < 2) { seconds = '0' + seconds; }
    document.getElementById('minutes').innerHTML = minutes;
    document.getElementById('seconds').innerHTML = seconds;
  }

  function updateGrid() {
    var player = PLAYER === 1 ? game.player1 : game.player2;
    player.guess.map(function(value, index) {
      if (value === 1) {
        colorCell('guess-cell-' + index, COLOR_ONE);
      } else if (value === 2) {
        colorCell('guess-cell-' + index, COLOR_TWO);
      }
    });
  }

  function updateLives() {
    var player = PLAYER === 1 ? game.player1 : game.player2;
    for (var i = 2; i >= 0; i--) {
      if (i >= player.lives) {
        var id = 'heart-' + i;
        document.getElementById(id).className = 'broken heart fa fa-heart';
      }
    }
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

  function colorCell(id, color) {
    document.getElementById(id).style.background = color;
  }

  return {
    init: initDigitalDilemmaBoard
  };
})();

window.addEventListener('load', DigitalDilemmaBoard.init);
