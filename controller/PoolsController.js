const GameController = require('("../../../controller/IA_GameController');

class PoolsController {

    constructor() {
        this.PoolList = new Map();

    }

    init() {
        
    }

    addPool(poolAdress) {
        const newGame = new GameController();
        this.PoolList.set(poolAdress, newGame);
    }

    addPlayer(playerName, mail, socket, poolAdress){
        let gameController = this.PoolList[poolAdress];
        let alreadyLogged = false;
        gameController.playerList.forEach(player => {
            if(player.mail === mail){
            alreadyLogged = true;
            player.socket = socket;
            }
        });
        if(!alreadyLogged){
            gameController.addPlayer(playerName, mail, socket);
        }
    }

    getServerList(){
        let servers = new Map();
        this.PoolList.forEach((server, key) => {
            let serverinfo = {
                nbPlayers: server.playerList.length,
                gameInProgress: server.gameInProgress
            }
            servers.set(key, serverinfo);
        });
        return servers;
    }
    
    defaultAction(controller){
        let data = controller.dataCurrentPlayer;
        PerudoAI.decideAction(controller, data.CurrentBet, data.YourDices, data.TotaDices, data.IsSpecialManche);
    }

    

}

const PerudoAI = (() => {

    function estimateProbability(totalDice, myDice, diceValue) {
        // Ceci est une approximation simplifiée pour estimer la probabilité.
        const myCount = myDice.filter(d => d === diceValue).length;
        const otherDice = totalDice - myDice.length;
        const expectedCount = otherDice / 6;  // Supposition : chaque face du dé a une chance égale d'apparaître.
    
        return Math.ceil(myCount + expectedCount);
    }
    
    function decideAction(previousBet, myDice, totalDice, isSpecialManche) {
        let [prevCount, prevValue] = previousBet;
        let newBet = null;
    
        let probabilities = [];
        for (let value = 1; value <= 6; value++) {
            probabilities[value] = estimateProbability(totalDice, myDice, value);
        }
        
        console.log(probabilities);
        let NoneContest;
        if (!isSpecialManche) {
            console.log("Ajout bonus ");
            let pacoProbability = probabilities[1];
            NoneContest = pacoProbability + probabilities[prevValue] > prevCount;
        }else{
            NoneContest = probabilities[prevValue] > prevCount;
        }

        if (NoneContest) {
            if (prevValue === 1) {
                // Essayer de surenchérir sur les pacos
                if(probabilities[1]> prevCount && probabilities[1]> 1) {
                    newBet = [probabilities[1] , 1];
                }else{ // Si impossible de surenchérir sur pacos, essayer de quitter les pacos
                    for (let value = 6; value >= 2; value--) {
                        if (probabilities[value] >= prevCount * 2 + 1) {
                            newBet = [probabilities[value], value];
                            break;
                        }
                    }
                }
    
            } else {
                console.log("Essayez d'augmenter la valeur tout en maintenant ou en augmentant le nombre de dés ");
                
                for (let value = 6; value >= prevValue; value--) {
                    if (probabilities[value] >= prevCount && probabilities[value]> 1) {
                        newBet = [probabilities[value], value];
                        break;
                    }
                }
                if(newBet != null){
                    if(newBet[0] === prevCount && newBet[1] === prevValue){
                        newBet = null;
                    }
                }

                if (!isSpecialManche && newBet != null) {
                    console.log("Ajout bonus ");
                    let pacoProbability = probabilities[1];
                    newBet[0] <= pacoProbability + probabilities[newBet[1]];
                }

               
                if (newBet === null) { // Si nous ne pouvons toujours pas parier plus, essayons de passer aux pacos
                    if (probabilities[1] >= Math.ceil(prevCount / 2) && probabilities[1] > 1) {
                        newBet = [probabilities[1], 1];
                    }
                }
            }
        }
    
        if (newBet != null) {
            controller.bet(newBet[0], newBet[1]);
        } else {
            controller.objection();
        }
    }
    

    return {
        estimateProbability: estimateProbability,
        decideAction: decideAction
    };
})();





module.exports = PoolsController;
