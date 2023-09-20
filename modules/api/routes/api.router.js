const express = require("express");
let isAuthenticated = require("../../../lib/auth").isAuthenticated;
const disconnect = require("../../../lib/auth").disconnect;
const passport = require("passport");
const User = require("../../../models/user");
const Players_GameController = require('("../../../controller/Players_GameController');
const gameController = new Players_GameController();

module.exports = function(io) {
  const router = express.Router();

  

  



  //console.log(io)
  // io.io event handling
  io.on('launch', (io) => {
    gameController.init();
    });

  io.on('newBet', (newBet) => {

    io.on('objection', () => {
      objection();
    });

    if(gameController.VerifyBet(newBet)){
      gameController.bet(newBet[0], newBet[1]);
    }else{
      io.emit('BetInvalid');
    }
    
    if(gameController.beginManche){
      gameController.playerList.forEach(player => {
        io.emit( player.name , { dices: player.dices });
      });
      io.emit('totalDices' , { totalDices: allDices.length });
      gameController.beginManche = flase;
    }
    
    io.emit('playersList' , { playersList: getPlayerListWithoutDicesValue() });
    io.emit('currentBet' , { currentBet: getCurrentBet() });
    io.emit('currentManche' , { currentManche: currentManche });
    io.emit('currentRound' , { currentRound: currentRound });
    io.emit('currentPlayerName' , { currentPlayerName: playerList[currentPlayer].name });
  });



  /* GET game page. */
  router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.send("ok");
    } else {
        res.redirect("/login");
    }
  });

  return router;
};