var DigitalDilemma = (function() {
  function initDigitalDilemma() {
    // socket stuff
    socket.on('foo', function() {
      console.log('bar');
    });
  }

  return {
    init: initDigitalDilemma
  };
})();

window.addEventListener('load', DigitalDilemma.init);
