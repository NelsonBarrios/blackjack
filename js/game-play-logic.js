// This file contains the main logic utilized during active gameplay, before the game is declared over

function dealCard(hand, location) {
	var cardDrawn = cardsInDeck.pop();
	hand.push(cardDrawn);
	var index = hand.length - 1;

	// Create card image for card, hide initially so it doesn't impact transition
	var cardImage = $("<img>").attr("class", "card").attr("src", "img/" + hand[index].src).hide();
	cardImage.attr("id", currentTurn + "-card-" + index);

	// To create stacked card effect
	if (index === 0) {
		cardImage.appendTo($(location)).show();
	} else if (index > 0) {
		cardImage.appendTo($(location)).offset({left: -60}).css("margin-right", -60).show();	
	} 
	if (hand[index].name === "as" && currentTurn != "crupier") {
		playerHasAce = true;
	}
	// Note: tried to dry this out by putting totals as a param but couldn't get it working yet
	if (currentTurn === "jugador") {
		playerHandTotal += hand[index].value;
	} else if (currentTurn === "jugadorDividido") {
		playerSplitHandTotal += hand[index].value;
	} else if (currentTurn === "crupier") {
		dealerHandTotal += hand[index].value;
	}	
	// Second card only for dealer should show face down
	if (dealerHand.length === 2 && currentTurn === "crupier") {
		cardImage.attr("src", "img/card_back.png");
	}
	updateVisibleHandTotals();
	evaluateGameStatus();
}

function evaluateGameStatus() {
	// Player can only split or double down after first 2 cards drawn
	if (playerHand.length === 3 || dealerStatus === "pedir") {
		disableButton(doubleDownButton);
		disableButton(splitButton);
	}
	if (currentTurn != "crupier") {
		if (playerHasAce === true) {
			if (currentTurn === "jugador") {  // Dry out by having params in here
				reviewAcesValue(playerHand, playerHandTotal);
			} else if (currentTurn === "jugadorDividido") {
				reviewAcesValue(playerSplitHand, playerSplitHandTotal);
			}	
		} else {
			isPlayerDone();
		}
	}		
	if (currentTurn === "crupier" && dealerStatus === "pedir") {
		dealerPlay();
	}
}


// El propósito de esta función es detectar cuándo se debe cambiar un turno sin el jugador
// necesita hacer clic en "pararse". Este también es un paso importante para determinar cuál es el próximo paso.
// es si hay un mazo dividido.
function isPlayerDone() {
	if (splitGame === false && playerHandTotal >= 21) {
		gameOver();
	} else if (splitGame === true) {
		if (currentTurn === "jugador") {
			if (playerHandTotal === 21) {
				gameOver();
			// If it's a split game, we can't just game over on the first hand if the player goes over
			} else if (playerHandTotal > 21)
				changeHand(playerStatus); 
		} else if (currentTurn === "jugadorDividido") {
			if (playerSplitHandTotal === 21) {
				gameOver();
			} else if (playerSplitHandTotal > 21) {
				// If the player was under 21 in their first game, the dealer should play before gameover
				if (playerHandTotal < 21) { 
					changeHand(playerSplitStatus);
				} else {
					gameOver();
				}
			}
		}
	}
}

function changeHand(currentDeckStatus) {
	currentDeckStatus = "pararse";
	if (currentTurn === "jugador") {		
		if (splitGame === true) {
			currentTurn = "jugadorDividido";
			// Escala el mazo del jugador a medida que cambiamos de turno, pero solo en la mano dividida
			scaleDownDeck(playerGameBoard, playerHandTotalDisplay);
			enlargeDeck(playerSplitGameBoard, playerSplitHandTotalDisplay);
		} else if (splitGame === false) {
			currentTurn = "crupier";
			dealerStatus = "pedir";
		}
	} else if (currentTurn === "jugadorDividido") {
		currentTurn = "crupier";
		dealerStatus = "pedir";
	}
	evaluateGameStatus(); 
}

function reviewAcesValue(hand, total) {	
	if (total > 21) {
		// Si tienen exactamente 2 ases en el primer sorteo, pídales que elijan dividir o no
		if (hand.length === 2) {  
			enableButton(splitButton, split);
			$("#two-aces-prompt").modal("open");
		// De lo contrario, solo reduce el valor de los ases para que ya no tengan más de 21
		} else if (hand.length > 2) {
			reduceAcesValue(hand);
			isPlayerDone();
		}
	} else {
		isPlayerDone();
	}
}

function reduceAcesValue(deck) {
	for (var i = 0; i < deck.length; i++) {  
		if (deck[i].name === "as" && deck[i].value === 11) { // Solo enfocándonos en los ases que aún no han sido cambiados de 11 a 1
			deck[i].value = 1;
			if (currentTurn === "jugador") {
				playerHandTotal -= 10;
			} else if (currentTurn === "jugadorDividido") {
				playerSplitHandTotal -= 10;
			}
			updateVisibleHandTotals();
			Materialize.toast("Tu valor de as cambió de 11 a 1", 1500);
		}	
	}
}

function dealerPlay() {
	flipHiddenCard();
	disableButton(standButton);
	disableButton(hitButton);
	disableButton(splitButton);
	// La siguiente lógica se basa en las reglas estándar del blackjack
	if (dealerHandTotal < 17) {
		setTimeout(function(){
			dealCard(dealerHand, dealerGameBoard);
		}, 1000);
	} else if (dealerHandTotal >= 21) {
		setTimeout(function(){
			gameOver();
		}, 1100);
	} else if (dealerHandTotal >= 17) {
		setTimeout(function(){
			dealerStatus = "pararse";
			gameOver();
		}, 1100);
	}
}