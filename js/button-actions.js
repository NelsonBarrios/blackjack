// This file contains key interactions that will occur after the player has clicked a button

var startGame = function() {
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

	cardImage.hide(); // Hide it at first to allow for the transition to occur
	// This is the first card in the deck, so want to cancel out the previous offset/stacking and have it go to the initial normal spot
	cardImage.appendTo($(playerSplitGameBoard)).offset({left: 60}).css("margin-right", "auto").show();

	currentChipBalance -= currentWager; 
	currentWager = currentWager * 2;
	updateVisibleChipBalances();

	// Then, deal 1 new card for each newly split deck
	currentTurn = "jugador";
	dealCard(playerHand, playerGameBoard);
	currentTurn = "jugadorDividido";
	dealCard(playerSplitHand, playerSplitGameBoard);

	// Make split button no longer clickable as in this game you can only split once
	disableButton(splitButton);

	// Shrink the inactive deck to both signal what deck they are playing and to make room on the board
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
		currentChipBalance -= currentWager; //subtracts the same value again from current balance
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
		var myAudio = document.getElementById("play");
		myAudio.paused ? myAudio.play() : myAudio.pause();
		startGame();	
	}
}

function resetGame() {
	currentWager = 0;
	currentChipBalance = 500;
	updateVisibleChipBalances();
	location.reload();
}