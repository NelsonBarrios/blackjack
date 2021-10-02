// Starting game board values
var cardsInDeck;

$( document ).ready(function() {
  getCards();
  cardsInDeck = cards;
  updateVisibleChipBalances();
});

var currentTurn = "jugador";
var currentWager = 0;
var currentChipBalance = localStorage.getItem('blackjackChips') || 500;
var gameWinner = "none"; // Para ser declarado al final del juego
var isGameOver = false;

// Mano del crupier y totales iniciales
var dealerHand = [];
var dealerHandTotal = 0;
var dealerGameBoard = $("#dealer");
var dealerStatus = "start"; // Los posibles estados son inicio (juego inicial), pararse, pedir

// Mano del jugador y totales iniciales
var playerHand = [];
var playerHandTotal = 0;
var playerGameBoard = $("#user-hand");
var playerHandTotalDisplay = $(".hand-total");
var playerStatus = "start";  // Los posibles estados son inicio (juego inicial), pararse, pedir

// Debido a que los ases pueden ser iguales a 1 u 11, necesitamos saber rápidamente si el jugador tiene ases para que podamos
// ajusta el valor de 11 a 1 si superan los 21 (el valor predeterminado es 11)
var playerHasAce = false;  

// Las variables del juego dividido por el jugador solo se usan si el jugador divide su mano
var splitGame = false; // el valor predeterminado es falso, debe convertirse en verdadero
var playerSplitHand = [];
var playerSplitHandTotal = 0;
var playerSplitGameBoard = $("#user-split-hand");
var playerSplitHandTotalDisplay = $(".split-hand-total");
var playerSplitStatus;

// Botones extraídos de DOM
var startButton = $("#start-game-button");
var doubleDownButton = $("#double-down-button");
var hitButton = $("#hit-button");
var standButton = $("#stand-button");
var splitButton = $(".split-button");
var playAgainButton = $(".new-game-button"); 

// Desactiva un botón (tanto el detector de eventos como la apariencia)
function disableButton(buttonName) {
	$(buttonName).off();
	$(buttonName).addClass("disabled-button");
}

// Activa un botón (tanto el detector de eventos como la apariencia)
function enableButton(buttonName, event) {
	$(buttonName).click(event);
	$(buttonName).removeClass("disabled-button");
}

// Actualiza los totales de fichas que se muestran al usuario a lo largo del juego
function updateVisibleChipBalances() {
	$(".current-wager").text(currentWager);
	$(".current-chip-balance").text(currentChipBalance);
	localStorage.setItem('blackjackChips', currentChipBalance);
}

// Actualiza los totales de las manos de las cartas que se muestran al usuario a lo largo del juego
function updateVisibleHandTotals() {
	$(playerHandTotalDisplay).text(playerHandTotal);
	$(playerSplitHandTotalDisplay).text(playerSplitHandTotal);

	// Si el crupier aún no ha jugado o el juego no ha terminado, solo muestre el valor de la primera carta
	// ya que el jugador todavía está haciendo sus movimientos iniciales
	if (dealerHand.length === 2 && isGameOver === false && dealerStatus === "start") {
		$(".dealer-hand-total").text(dealerHandTotal - dealerHand[1].value);
	} else {
		$(".dealer-hand-total").text(dealerHandTotal);
	}

}

// Llamado cuando el jugador hace clic en un chip
function selectWager(amount){
	currentWager = amount;
	updateVisibleChipBalances();
}

// 	ANIMACIONES/INTERACTIVIDAD:
function flipHiddenCard() {
	// Si es solo la ronda inicial, primero debemos dar la vuelta / revelar la carta del crupier oculta cuando se llame.
	if (dealerHand.length === 2) {
		$("#dealer-card-1").addClass("flipped");
		setTimeout(function(){
			$("#dealer-card-1").attr("src", "img/" + dealerHand[1].src);
			updateVisibleHandTotals();
		}, 250);	
	} 
}

// Utilizado en el modo de juego dividido, reduce el mazo inactivo y los totales
function scaleDownDeck(deck, totalDisplay) {
	$(totalDisplay).addClass("splithand-scaledown");
	$(deck).addClass("splithand-scaledown");
}

// Usado en el modo de juego dividido, agranda el mazo y los totales cuando se activa o cuando
// cúpula con jugabilidad
function enlargeDeck(deck, totalDisplay) {
	$(totalDisplay).removeClass("splithand-scaledown");
	$(deck).removeClass("splithand-scaledown");
}

// Alternar las reglas desde la navegación principal da un efecto de animación
$(".rules-nav").click(function(){
	$("#rules").toggle("blind", 500);
});

// Pero hacer clic en cerrar no proporciona un efecto de animación.
$("#rules-close").click(function(){
	$("#rules").hide();
});

// Materialize modal
$(".modal").modal({ 
      dismissible: false, 
      opacity: .40, 
      inDuration: 300, 
      outDuration: 200, 
	  startingTop: "10%", // Atributo de estilo superior inicial
	  endingTop: "10%", // Atributo de estilo superior final
    }
  );

// OYENTES DE EVENTOS:
$("#chip-10").click(function(){selectWager(10)});
$("#chip-25").click(function(){selectWager(25)});
$("#chip-50").click(function(){selectWager(50)});
$("#chip-100").click(function(){selectWager(100)});

// Activación de botón
$(startButton).click(startGame);
$(doubleDownButton).click(doubleDown); 
$(hitButton).click(hit);
$(standButton).click(stand);
$(playAgainButton).click(newGame);
$("#reset-game").click(resetGame);

$(".reduce-aces-button").click(   // Solo puedo ver esto si el jugador roba 2 ases, solo se reduciría en el 1er mazo
	function(){
		reduceAcesValue(playerHand);
		disableButton(splitButton, split);
}); 
