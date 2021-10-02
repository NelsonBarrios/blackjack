// Este archivo contiene la lógica de lo que sucede después de que se determina que la ronda ha terminado.

function gameOver() {
	isGameOver = true;
	setTimeout(function(){
		flipHiddenCard();
	}, 750);
	disableButton(standButton);
	disableButton(hitButton);
	disableButton(splitButton);
	disableButton(doubleDownButton);
	if (dealerHandTotal === 21) {
		if (playerHandTotal === 21 || playerSplitHandTotal === 21) {
			gameWinner = "empatar";
		} else {
			gameWinner = "crupier";
		}
	} else if (dealerHandTotal > 21) {
		if (playerHandTotal <= 21) {
			gameWinner = "jugador";
		} else if (splitGame === true && playerSplitHandTotal <= 21) {
			gameWinner = "jugador";
		} else {
			gameWinner = "empatar";
		}
	} else if (dealerHandTotal < 21) {
		if (playerHandTotal === 21  || playerSplitHandTotal === 21) {
			gameWinner = "jugador";
		} else if (playerHandTotal < 21 && playerHandTotal > dealerHandTotal) {
			gameWinner = "jugador";
		} else if (playerSplitHandTotal < 21 && playerSplitHandTotal > dealerHandTotal) {
			gameWinner = "jugador";
		} else if (playerSplitHandTotal < 21 && playerSplitHandTotal === dealerHandTotal ||
			playerHandTotal < 21 && playerHandTotal === dealerHandTotal) {
			gameWinner = "empatar";
		} else {
			gameWinner = "crupier";
		}
	}
	updateChipBalance();
	setTimeout(announceWinner, 2500); // Ligero retraso para dar tiempo a ver cómo se juegan las cartas finales.
} 

function updateChipBalance() {
	if (gameWinner === "jugador") {
		// El blackjack tiene un pago de 3:2 (y no puede ocurrir en un mazo dividido):
		if (splitGame === false && playerHasAce === true && playerHandTotal === 21 && playerHand.length === 2) {
			currentChipBalance += currentWager*(3/2) + currentWager;
		// De lo contrario, es un pago 1: 1:
		} else {
			currentChipBalance += currentWager*2;
		}
	// Si empatas, recupera solo la apuesta original (sin ganar ni perder)
	} else if (gameWinner === "empatar") {
		currentChipBalance += currentWager;		
	}
	// Nota: si el crupier gana, no pasa nada con el saldo de fichas del jugador, ya que su apuesta ya fue eliminada.
	updateVisibleChipBalances();
}

function announceWinner() {
	updateVisibleHandTotals();
	currentWager = 0;
	updateVisibleChipBalances();
	$("#game-board").hide();
	enlargeDeck(playerSplitGameBoard, playerSplitHandTotalDisplay);
	enlargeDeck(playerGameBoard, playerHandTotalDisplay);

	// Mueva las opciones de apuestas de la pantalla de bienvenida a la pantalla de finalización del juego para volver a jugar
	$("#wager-options").appendTo($("#game-over")); 
	$(playAgainButton).appendTo($("#wager-options")); // para mover al fondo del contenedor
	$(startButton).hide(); 
	$("#game-over").show("drop", 500);

	if (gameWinner === "jugador") {
		$("#game-outcome").text("Ganaste");
	} else if (gameWinner === "crupier") {
		$("#game-outcome").text("Gana Crupier");
	} else if (gameWinner === "empatar") {
		$("#game-outcome").text("Empataron");
	}
}