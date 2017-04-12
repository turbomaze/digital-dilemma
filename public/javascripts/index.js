var DigitalDilemma = (function() {
  function initDigitalDilemma() {
    var DELAY = 500;

    // socket stuff
    function toggleCell(id) {
      var oldColor = $(id).css('background-color');
      $(id).css('background-color', 'rgb(200, 50, 50)');
      setTimeout((function(colorToRestore) {
        return function() {
          $(id).css('background-color', colorToRestore);
        };
      })(oldColor), DELAY);
    }
    socket.on('toggle-1', function() {
      console.log('swag');
      toggleCell('#cell-5');
    });
    socket.on('toggle-2', function() {
      toggleCell('#cell-10');
    });

    // initialize grid colors
    for (var i = 0; i < 16; i++) {
      var id = '#cell-' + i;
      var g = Math.floor(100 + 50 * Math.random());
      var color = getColor(g, g, g);
      $(id).css('background-color', color);
    }
  }

  function getColor(r, g, b) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  return {
    init: initDigitalDilemma
  };
})();

window.addEventListener('load', DigitalDilemma.init);
