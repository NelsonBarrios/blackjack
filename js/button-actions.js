// Este archivo contiene interacciones clave que ocurrirán después de que el jugador haya hecho clic en un botón.

var startGame = function() {
	var myAudio = document.getElementById("play");
	myAudio.paused ? myAudio.play() : myAudio.pause();
	getCards();
	if (currentWager === 0) {
		Materialize.toast("Debes seleccionar una apuesta para jugar", 1000);
	} else if (currentChipBalance < 10) {
		Materialize.toast("¡Te quedaste sin fichas! Reinicia el juego para continuar" , 2000);
	} else if (currentChipBalance < currentWager) {
		Materialize.toast("Saldo de fichas insuficiente, seleccione una apuesta menor" , 1500);
	} else {
		currentChipBalance -= currentWager;
		updateVisibleChipBalances();
		$("#welcome").hide();
		$("#game-over").hide();
		$(".brand-logo").text("blackjack"); 
		$("#game-board").show("fade", 1000);
		cardsInDeck = cards;
		cardsInDeck.sort(function() {return 0.5 - Math.random()});
		for (let i = 0; i <= 1; i++) {
			setTimeout(function(){
				currentTurn = "jugador";
				dealCard(playerHand, playerGameBoard);
				currentTurn = "crupier";
				dealCard(dealerHand, dealerGameBoard);
			}, i*1500);
		}
		setTimeout(function(){
			currentTurn = "jugador";
			if (playerHand.length === 2 && playerHand[0].name === playerHand[1].name) {
				enableButton(splitButton, split);
			}
		}, 2500);
			
	}
}

var hit = function() {
	if (currentTurn === "jugador") {
		playerStatus = "pedir";
		dealCard(playerHand, playerGameBoard);
	} else if (currentTurn === "jugadorDividido") {
		playerSplitStatus = "pedir";
		dealCard(playerSplitHand, playerSplitGameBoard);
	}
}

var stand = function() {
	if (currentTurn === "jugador") {
		changeHand(playerStatus);
	} else if (currentTurn === "jugadorDividido") {
		changeHand(playerSplitStatus);
	}
}

var split = function() {
	splitGame = true; 
	playerHandTotal = playerHandTotal - playerHand[1].value;
	playerSplitHandTotal = playerHand[1].value;
	updateVisibleHandTotals();
	$(".split-hand-total").removeClass("inactive").show(); 
	$(playerSplitGameBoard).removeClass("inactive").show();	
	var splitCard = playerHand.pop();
	playerSplitHand.push(splitCard);
	var cardImage = $("#player-card-1").attr("id", "playerSplit-card-0");

	cardImage.hide(); // Ocultarlo al principio para permitir que ocurra la transición
	// Esta es la primera carta en la baraja, así que desea cancelar el desplazamiento / apilamiento anterior y hacer que vaya al lugar normal inicial.
	cardImage.appendTo($(playerSplitGameBoard)).offset({left: 60}).css("margin-right", "auto").show();

	currentChipBalance -= currentWager; 
	currentWager = currentWager * 2;
	updateVisibleChipBalances();

	// Luego, reparte 1 carta nueva por cada mazo recién dividido.
	currentTurn = "jugador";
	dealCard(playerHand, playerGameBoard);
	currentTurn = "jugadorDividido";
	dealCard(playerSplitHand, playerSplitGameBoard);

	// Hacer que el botón de división ya no se pueda hacer clic, ya que en este juego solo puedes dividir una vez
	disableButton(splitButton);

	// Reducir el mazo inactivo tanto para indicar qué mazo están jugando como para hacer espacio en el tablero
	setTimeout(function(){
		scaleDownDeck(playerSplitGameBoard, playerSplitHandTotalDisplay);
		currentTurn = "jugador"; 
	}, 1000);

}

function doubleDown() {
	if (currentChipBalance - currentWager <= 0) {
		Materialize.toast("Balance de fichas insuficiente" , 1000);
	}
	else {
		currentChipBalance -= currentWager; // resta el mismo valor nuevamente del saldo actual
		currentWager = currentWager * 2;
		updateVisibleChipBalances();
		disableButton(doubleDownButton);
	}
}

function newGame() {
	getCards();
	cardsInDeck = cards;
	gameWinner = "none";
	dealerHand = [];
	dealerHandTotal = 0;
	dealerStatus = "start";
	playerHand = [];
	playerHandTotal = 0;
	playerStatus = "start";  
	playerHasAce = false;  
	splitGame = false; 
	isGameOver = false;
	playerSplitHand = [];
	playerSplitHandTotal = 0;
	playerSplitStatus = "start";

	if (currentWager === 0) { 
		Materialize.toast("Debes seleccionar una apuesta para jugar", 1000);
	} else {	
		$(playerSplitGameBoard).hide();
		$(".split-hand-total").hide();
		enableButton(standButton, stand);
		enableButton(hitButton, hit);
		enableButton(doubleDownButton, doubleDown);
		dealerGameBoard.empty();
		playerGameBoard.empty();
		playerSplitGameBoard.empty();
		updateVisibleHandTotals();
		startGame();	
	}
}

function resetGame() {
	currentWager = 0;
	currentChipBalance = 500;
	updateVisibleChipBalances();
	location.reload();
}