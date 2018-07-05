/*
 * Create a list that holds all of your cards
 */

// Necessary global variables
const open_cards = [];
// Optimize by using a single variable instead of open variables
let open_card;
const matched_cards = [];
let card_grid = document.getElementById("card-grid");
const totalCards = card_grid.children.length;
const moves_counter = document.getElementById("move-counter");
let moves = 0;
const restart_button = document.getElementById("restart-button");
const shuffle_button = document.getElementById("shuffle-button");
const pause_play_button = document.getElementById("pause-play-button");
const prompt_screen = document.getElementById("prompt-screen");
const timer_display = document.getElementById("timer-display");
let card_timer;

let time = {
  seconds: 0,
  minutes: 0,
  hours: 0
};
let timer;
let goldStarTimer;
let starsIntact = 3;
// Event Listeners - All listeners in one place

card_grid.addEventListener("click", handleCardClick);
restart_button.addEventListener("click", restartGame);
prompt_screen.addEventListener("click", promptHideLogic);
shuffle_button.addEventListener("click", shuffleGrid);
pause_play_button.addEventListener("click", toogleGameState);
// Start game
function startGame(resetGrid = false) {
  // TODO - Flip all cards down
  // Clear array
  open_cards.length = 0;
  open_card = undefined;
  matched_cards.length = 0;
  updateMoveCounter((reset = true));
  hideOverlay();
  enableGrid();
  randomizeGrid(card_grid, (flipDown = resetGrid));
  resetTimer();
  resetStars();
  startTimer();
  reduceStars();
}

function pauseGame() {
  stopTimers();
  disableGrid();
  pause_play_button.classList.remove("fa-pause");
  pause_play_button.classList.add("fa-play");
}

function resumeGame() {
  startTimers();
  enableGrid();
  pause_play_button.classList.remove("fa-play");
  pause_play_button.classList.add("fa-pause");
}

function isPaused() {
  return pause_play_button.classList.contains("fa-pause");
}

function toogleGameState(evt) {
  if (isPaused()) pauseGame();
  else resumeGame();
}

function flipCardsDown(card_grid) {
  for (card of card_grid.children)
    card.classList.remove("show", "open", "match");
}
// Restart game with confirmation
function restartGame(evt, statement = "Do you want to restart the game?") {
  let res = confirm(statement.toString());
  if (res) startGame((resetGrid = true));
}

function disableGrid() {
  card_grid = document.getElementById("card-grid");
  card_grid.classList.add("disabled");
}

function enableGrid() {
  card_grid = document.getElementById("card-grid");
  card_grid.classList.remove("disabled");
}
/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */
function randomizeGrid(card_grid, flipDown = false) {
  // Reassign to grid
  card_grid = document.getElementById("card-grid");
  let clone_grid = card_grid.cloneNode(false);
  // Convert HTMLCollection to array
  let cells = [...card_grid.children];
  cells = shuffle(cells);
  // Create fragment for better FPS
  let fragment = document.createDocumentFragment();
  for (cell of cells) {
    if (flipDown) cell.classList.remove("show", "open", "match", "animated");
    fragment.appendChild(cell);
  }
  // Add items to empty clone
  clone_grid.appendChild(fragment);
  // Re-attach eventListener
  clone_grid.addEventListener("click", handleCardClick);
  // Replace grid
  card_grid.replaceWith(clone_grid);
}

function shuffleGrid(evt) {
  randomizeGrid(card_grid, (flipDown = false));
}
// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/* Overlay functions */
function showOverlay() {
  prompt_screen.style.width = "100%";
}

function hideOverlay() {
  prompt_screen.style.width = "0%";
}

function updateOverlay() {
  let [star_res, move_res, time_res] = [
    ...prompt_screen.querySelectorAll(".overlay-content h3 i")
  ];
  star_res.textContent = `${starsIntact} stars`;
  move_res.textContent = `${moves} moves`;
  time_res.textContent = `${timer_display.textContent}`;
}

function toggleOverlay() {
  if (prompt_screen.style.width == "100%") hideOverlay();
  else showOverlay();
}

/* Timer related stuff */

function stopTimers() {
  stopStarTimer();
  stopTimer();
}

function startTimers() {
  startTimer();
  reduceStars();
}
// Reduce a star every after every 1 minutes or 60000 ms
function reduceStars() {
  //Reset timer before setting new one
  stopStarTimer();
  goldStarTimer = setTimeout(dimStar, 1000 * 60);
}

function dimStar(penaltyFor = "timer") {
  if (penaltyFor == "timer") {
    if (starsIntact >= 1) {
      stars.children[starsIntact].style.color = "slategrey";
      starsIntact--;
      // Reduce more stars
      reduceStars();
    }
  } else if (penaltyFor == "move") {
    if (moves / 26 <= 3)
      stars.children[4 - Math.trunc(moves / 26)].style.color = "slategrey";
  }
}

function stopStarTimer() {
  clearTimeout(goldStarTimer);
}

function resetStars() {
  starsIntact = 3;
  for (let i = 1; i <= 3; i++) stars.children[i].style.color = "gold";
}
// Although a funny name, tick Tock keeps the clock running
function tickTock() {
  time.seconds++;
  if (time.seconds >= 60) {
    time.seconds = 0;
    time.minutes++;
    if (time.minutes >= 60) {
      time.minutes = 0;
      time.hours++;
      // Reset on overflow
      if (time >= 24) resetTimer();
    }
  }
  // Pad with zeros;
  udpateTimerDisplay();
  // Start the timer again
  startTimer();
}

function udpateTimerDisplay() {
  timer_display.textContent = formatTime();
}

function formatTime() {
  if (time.hours > 0)
    return `${zeroPad(time.hours)}:${zeroPad(time.minutes)}:${zeroPad(
      time.seconds
    )}`;
  else return `${zeroPad(time.minutes)}:${zeroPad(time.seconds)}`;
}
// Add zero for single digit moments
function zeroPad(moment) {
  if (moment <= 9) return `0${moment}`;
  return moment;
}

function startTimer() {
  // Clear timers 
  stopTimer();
  // Timeout of 1000 ms or 1s;
  timer = setTimeout(tickTock, 1000);
}

function stopTimer() {
  clearTimeout(timer);
}

function resetTimer() {
  // Reset Time
  time.seconds = time.minutes = time.hours = 0;
  timer_display.textContent = "00:00";
}
/* Handle promptHideLogic
   Hide the prompt only when user clicks on the overlay and not the overlay content. 
   Another hide logic is handled independently by the close button
*/
function promptHideLogic(evt) {
  // If restart button is clicked then restart game
  if (evt.target.tagName == "BUTTON") restartGame();
  else if (evt.target.classList.contains("overlay")) toggleOverlay();
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
    moves_counter.textContent = moves;
  } else {
    moves++;
    moves_counter.textContent = moves;
    if (moves >= 26) dimStar((penaltyFor = "move"));
  }
}

function checkGameEnding() {
  if (matched_cards.length == totalCards) {
    // Stop Timers
    stopTimers();
    updateOverlay();
    toggleOverlay();
  }
}

function lockCards(openCard, newCard) {
  matched_cards.push(openCard, newCard);
  // Add match classes
  openCard.classList.add("match", "animated", "bounce");
  newCard.classList.add("match", "animated", "bounce");
  // Reset open card
  open_card = undefined;
  checkGameEnding();
}

function removeClasses(openCard,newCard)
{
  newCard.classList.remove("show", "open", "animated", "shake");
  openCard.classList.remove("show", "open", "animated", "shake");
}
function hideCards(openCard, newCard) {
  newCard.classList.add("animated", "shake");
  openCard.classList.add("animated", "shake");
  card_timer =  setTimeout(removeClasses, 500,openCard,newCard);
  // Reset open card
  open_card = undefined;
}

function addCard(card) {
  if (open_card === undefined) {
    open_card = card;
  } else {
    // Try matching card
    // Match if same card is not clicked twice or they have same class
    if (!(card === open_card) &&
      card.children[0].className == open_card.children[0].className
    ) {
      lockCards(open_card, card);
    } else hideCards(open_card, card);
  }
}

function showCard(card) {
  if(!(card === undefined)){
  card.classList.add("show", "open");
  updateMoveCounter();
  addCard(card);
  }
}

function handleCardClick(evt) {
  let click_target = evt.target;
  if (click_target.classList.contains("match") || click_target == this) {
    // Don't process if already matched or if grid itself is clicked
    return;
  }
  else if(open_card === evt.target)
    {
      // Dont' proces if same card is clicked again
      return;
    }
   else {
    showCard(click_target);
  }
}

// Start game
startGame((resetGrid = true));