const express = require("express");
let isAuthenticated = require("../../../lib/auth").isAuthenticated;
const disconnect = require("../../../lib/auth").disconnect;
const passport = require("passport");
const User = require("../../../models/user");
const Players_GameController = require('("../../../controller/Players_GameController');
const gameController = new Players_GameController();

gameController.address = "1111";

module.exports = function(io) {
  const router = express.Router();

  io.on('connection', (socket) => {
    console.log(`A client connected with ID: ${socket.id}`);
    socket.on('connected', () => {
      console.log('Client connected and sent a "connected" message');
      // Handle the event here
    });

    socket.on('connectPlayer', (user) => {
      let alreadyLogged = false;
      gameController.playerList.forEach(player => {
        if(player.mail === user.mail){
          alreadyLogged = true;
        }
      });
      if(!alreadyLogged){
        gameController.addPlayer(user.name, user.mail);
      }
    });

    socket.on('launch', (io) => {
      gameController.init();
    });
  
    socket.on('newBet', (newBet) => {
      console.log("newBet = ", newBet);
      if(gameController.VerifyBet(newBet)){
        gameController.bet(newBet[0], newBet[1]);
      }else{
        socket.emit(gameController.playerList[gameController.currentPlayer].name+'BetInvalid');
      }
    });

    socket.on('objection', () => {
      objection();
    });

    socket.on('MajRequest', () => {
      console.log('********************  Maj request call ***********************');
      gameController.playerList.forEach(player => {

        console.log('********************  Player '+player.name+'  ***********************');

        if(gameController.beginManche){

          socket.emit('totalDices' , gameController.allDices.length);

          console.log('envoie a ', `${player.name}`);
          console.log('dés = ', player.dices);
          socket.emit( player.name , player.dices);
          
          
        }
        
        socket.emit(player.name+'playersList' ,  gameController.getPlayerListWithoutDicesValue() );
        socket.emit(player.name+'currentBet' , gameController.currentBet);
        socket.emit(player.name+'currentManche' , gameController.currentManche);
        socket.emit(player.name+'currentRound' , gameController.currentRound);
        socket.emit(player.name+'currentPlayer' , gameController.currentPlayer);

      });
      gameController.beginManche = false;
    });
  });

  /* GET user info */
  router.get("/getUserInfos", (req, res) => {
    if (req.isAuthenticated()) {
        res.send(req.user);

    } else {
        res.redirect("/login");
    }
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