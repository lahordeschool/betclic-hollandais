var socket;
let editor;

window.addEventListener("load", async ()=> {
    //updateFunction();
    socket = await io.connect();

    socket.on('connect', () => {
        console.log('Connected to the server from client');
        
        if(localStorage.getItem('UserFirstName') == null){
            $.get("/api/getUserInfos", function(data) {
                localStorage.setItem('UserFirstName', data.firstname);
                localStorage.setItem('UserMail', data.id);
            }).fail(function() {
                console.error("Erreur lors de la récupération des informations de l'utilisateur.");
            });
        }

        console.log(socket);
        socket.emit('connected');
    
        socket.emit('connectPlayer', {name: localStorage.getItem('UserFirstName'), mail: localStorage.getItem('UserMail')});

        socket.on("messageTestReceived", (message) => {
            console.log(message);
        });
        
        socket.on("PlayerTurn", (gameInfo) => {
            yourTurn(gameInfo);
        });

        socket.on("finish", (playerName) => {
            alert('Gagnant :'+ playerName);
        });

        function yourTurn(data){
            console.log(data);
            PerudoAI.makeDecision(data.CurrentBet, data.YourDices, data.TotaDices);
        }

    });

});

function VerifyBet(currentBet, newBet){
    //check is a new bet
    if(JSON.stringify(currentBet) == JSON.stringify(newBet)) {
        return false;
    } else {
        return true;
    }

    //check is outbid


    //if not outbid check is an paco switch
}

function VerifyObjection(bet){
    //check is a new bet
    if(JSON.stringify(bet) == JSON.stringify([0,1]) || JSON.stringify(bet) == JSON.stringify([0,2])) {
        return false;
    } else {
        return true;
    }

    //check is outbid


    //if not outbid check is an paco switch
}

function objection(){
    alert('Objection');
    socket.emit('objection');
}

function bet(bet){
    alert('bet :'+ bet);
    socket.emit('bet', bet);
}


function updateFunction(){
    const code = localStorage.getItem("My_AI");
    try {
        const newFunction = new Function('data', code);
        window.yourTurn = newFunction;
        alert('Function updated successfully!');
        yourTurn();
    } catch (error) {
        console.log(error.message);
        alert('Error in your code: ' + error.message);
    }
}


const PerudoAI = (() => {

    function analyzeSituation(dices, value, totalDiceCount){
        const matchingDice = dices.filter(die => die === value).length;
        const estimatedTotalDice =  Math.ceil(matchingDice + (totalDiceCount - dices.length) * (1 / 6));
        return estimatedTotalDice;
    }

    function makeDecision(currentBet, dices, totalDiceCount) {

        const estimations = [];
        
        // Estimer le count pour chaque valeur possible
        for (let value = 1; value <= 6; value++) {
            estimations[value] = this.analyzeSituation(dices, value, totalDiceCount);
        }

        if (currentBet[1] === 1) { // Si nous sommes déjà sur Paco
            const nextCount = currentBet[0] * 2 + 1;

            // Trouver la meilleure value pour surenchérir
            let bestValue = 2;
            for (let value = 3; value <= 6; value++) {
                if (estimations[value] > estimations[bestValue]) {
                    bestValue = value;
                }
            }

            if (estimations[bestValue] >= nextCount && estimations[bestValue] > estimations[1]) {
                bet([nextCount, bestValue]);
            }
            else if(estimations[1] > currentBet[0]){
                bet([estimations[1], 1]);
            }
            else {
                objection();
            }
            return;

        } else { // Si nous ne sommes pas sur Paco
            let bestValue = currentBet[1];
            for (let value = currentBet[1] + 1; value <= 6; value++) {
                if (estimations[value] > estimations[bestValue]) {
                    bestValue = value;
                }
            }
            if (estimations[bestValue] > currentBet[0]) {
                bet([estimations[bestValue], bestValue]);
            } else if (estimations[1] >= Math.ceil(currentBet[0] / 2)) {
                bet([estimations[1], 1]);
            } else {
                objection();
            }
            return;
        }
    }

    return {
        analyzeSituation: analyzeSituation,
        makeDecision: makeDecision
    };
})();