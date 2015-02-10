//this file holds the game itself
console.log("info: game core started");
//load game object classes
var gal = require('./core_objects/galaxy.js');
var solarSystem = require('./core_objects/solarSystem.js');
var player = require('./core_objects/player.js');
var ships = require('./collision_objects/ships.js');

module.exports = function(sio) {

  //temporary player array
  var players = [];
  //test galaxy
  var galaxy = new gal.galaxy();
  galaxy.systems[0] = new solarSystem.system('Alpha')
  galaxy.systems[0].collisionObj[galaxy.systems[0].collisionObj.length] = new ships.testShip(200, 200, 'admin');
  
  //sets game state and sends it to client
  function sendUpdate() {
    var gameState = galaxy; //gameState
    sio.emit('gameState', gameState);
  }
  
  //main loop
  function main() {
    setInterval(function() {
      for (var s=0; s<galaxy.systems.length; s++) {//set update for all objects from each layer
          for (var i=0; i<galaxy.systems[s].collisionObj.length; i++) {
            galaxy.systems[s].collisionObj[i].update(); 
          }
      }
      sendUpdate();
    }, 10);
  }
  
  //CLIENT-SERVER LISTENER SOCKET
  sio.on('connection', function(socket) {//REPLACE rm WITH FULL GAME STATE LATER
    //initial log-in request & responce
    sio.emit('login request');
    socket.on('login responce', function(nm) {
      console.log(nm+' joined the game!');
      players.push(nm);
      this.name = nm;
      
      //give player ship if he/she dousn't already own one
      galaxy.systems[0].collisionObj[galaxy.systems[0].collisionObj.length] = new ships.testShip(200, 200, this.name);
    });

    //player controls
    //will move ship if logged in as owner
    socket.on('w', function() {
      for (var s=0; s<galaxy.systems.length; s++) {//set update for all objects from each layer
        for (var i=0; i<galaxy.systems[s].collisionObj.length; i++) {
          if (galaxy.systems[s].collisionObj[i].owner === this.name) {
            galaxy.systems[s].collisionObj[i].move('forward');
          }
        }
      }
    });
    socket.on('a', function() {
      for (var s=0; s<galaxy.systems.length; s++) {//set update for all objects from each layer
        for (var i=0; i<galaxy.systems[s].collisionObj.length; i++) {
          if (galaxy.systems[s].collisionObj[i].owner === this.name) {
            galaxy.systems[s].collisionObj[i].turn('left');
          }
        }
      }
    });
    socket.on('s', function() {
      for (var s=0; s<galaxy.systems.length; s++) {//set update for all objects from each layer
        for (var i=0; i<galaxy.systems[s].collisionObj.length; i++) {
          if (galaxy.systems[s].collisionObj[i].owner === this.name) {
            galaxy.systems[s].collisionObj[i].move('back');
          }
        }
      }
    });
    socket.on('d', function() {
      for (var s=0; s<galaxy.systems.length; s++) {//set update for all objects from each layer
        for (var i=0; i<galaxy.systems[s].collisionObj.length; i++) {
          if (galaxy.systems[s].collisionObj[i].owner === this.name) {
            galaxy.systems[s].collisionObj[i].turn('right');
          }
        }
      }
    });
  });
  
  //start main loop
  main();
}