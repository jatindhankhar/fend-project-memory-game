/*
 * Create a list that holds all of your cards
 */

// Necessary global variables
const open_cards = [];
// Optimize by using a single variable instead of open variables
let open_card;
const matched_cards = [];
const card_grid = document.getElementById("card-grid")
const moves_counter = document.getElementById("move-counter");
let moves = 0;
const restart_button = document.getElementById("restart-button")


// Event Listeners - All listeners in one place

card_grid.addEventListener("click", handleCardClick);
restart_button.addEventListener("click", restartGame);

// Start game 
function startGame(resetGrid = false) {
  // TODO - Flip all cards down
  // Clear array
  open_cards.length = 0;
  open_card = undefined;
  matched_cards.length = 0;
  updateMoveCounter(reset = true);
  randomizeGrid(card_grid, flipDown = resetGrid);

}

function flipCardsDown(card_grid) {
  for (card of card_grid.children)
    card.classList.remove("show", "open", "match");
}
// Restart game with confirmation
function restartGame(evt, statement = "Do you want to restart the game?") {
  let res = confirm(statement.toString());
  if (res)
    startGame(resetGrid = true);
}
/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */
function randomizeGrid(card_grid, flipDown = false) {
  let clone_grid = card_grid.cloneNode(false);
  // Convert HTMLCollection to array
  let cells = [...card_grid.children];
  cells = shuffle(cells);
  // Create fragment for better FPS
  let fragment = document.createDocumentFragment();
  for (cell of cells) {
    if (flipDown)
      cell.classList.remove("show", "open", "match");
    fragment.appendChild(cell);
  }
  // Add items to empty clone
  clone_grid.appendChild(fragment);
  // Re-attach eventListener
  clone_grid.addEventListener("click", handleCardClick);
  // Replace grid
  card_grid.replaceWith(clone_grid);


}
// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */

function updateMoveCounter(reset = false) {
  if (reset) {
    moves = 0;
    moves_counter.innerText = moves;
  } else {
    moves++;
    moves_counter.innerText = moves;
  }
}

function checkGameEnding() {
  if (matched_cards.length == card_grid.children.length) {
    restartGame(statement = "You have won the game !\n. Reset for next match ?");

  }
}

function lockCards(openCard, newCard) {
  matched_cards.push(openCard, newCard);
  // Add match classes
  openCard.classList.add("match", "animated", "bounce");
  newCard.classList.add("match", "animated", "bounce");
  // Reset open card
  open_card = undefined;
  updateMoveCounter();
  checkGameEnding();
}

function hideCards(openCard, newCard) {
  newCard.classList.add("animated", "shake");
  openCard.classList.add("animated", "shake");
  setTimeout(function () {
    newCard.classList.remove("show", "open", "animated", "shake");
    openCard.classList.remove("show", "open", "animated", "shake");
    // Reset open card
    open_card = undefined;
  }, 500);
}

function addCard(card) {
  if (open_card == undefined) {
    open_card = card;
  } else {
    // Try matching card
    // Match if same card is not clicked twice or they have same class
    if (!(card === open_card) && card.children[0].className == open_card.children[0].className) {
      lockCards(open_card, card);
    } else
      hideCards(open_card, card);
  }
}

function showCard(card) {
  card.classList.add("show", "open");
  addCard(card);
}

function handleCardClick(evt) {

  let click_target = evt.target;
  if (click_target.classList.contains("match") || (click_target == this)) {
    // Don't process if already matched or if grid itself is clicked
  } else {
    showCard(click_target);
  }

}

// Start game
startGame(resetGrid = true);