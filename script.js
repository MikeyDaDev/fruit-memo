 // Symbols for cards - 12 total
const allSymbols = ['🍎', '🍌', '🍇', '🍉', '🍒', '🥝', '🍍', '🍓', '🍑', '🥥', '🍋', '🍐'];

const gameBoard = document.getElementById('game-board');
const message = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');
const difficultySelect = document.getElementById('difficulty');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');

const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');

// Sound effects
const flipSound = new Audio('sounds/flip.wav');
const matchSound = new Audio('sounds/match.wav');
const winSound = new Audio('sounds/win.wav');

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let matches = 0;
let score = 0;
let timer;
let timeLeft = 60; // seconds

let gameStarted = false;  // NEW: flag to block clicks during preview/start

// Initialize game
function initGame() {
  matches = 0;
  score = 0;
  timeLeft = 60;
  updateScore();
  updateTimer();
  message.textContent = '';
  clearInterval(timer);

  gameBoard.innerHTML = '';

  // Disable controls during preview
  restartBtn.disabled = true;
  difficultySelect.disabled = true;
  gameStarted = false;

  const difficulty = difficultySelect.value;
  let numPairs = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 12;

  const symbols = allSymbols.slice(0, numPairs);
  const cardsArray = shuffleArray([...symbols, ...symbols]);

  cardsArray.forEach(symbol => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;
    card.classList.add('flipped'); // Start flipped face-up during preview
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-back">?</div>
        <div class="card-front">${symbol}</div>
      </div>
    `;
    card.addEventListener('click', flipCard);
    gameBoard.appendChild(card);
  });

  // Preview cards face-up for 3 seconds, then flip down and start game
  setTimeout(() => {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.remove('flipped')); // Flip cards face-down


    // Enable controls and start game
    restartBtn.disabled = false;
    difficultySelect.disabled = false;
    gameStarted = true;

    startTimer(); // countdown timer to view cards
  }, 7000);
}

function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;

  while(currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function flipCard() {
  if (!gameStarted) return;       // Block clicks during preview
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flipped');

  // Play flip sound
  flipSound.currentTime = 0;
  flipSound.play();

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

  if (isMatch) {
    disableCards();
    matches++;
    score += 10;
    updateScore();

    matchSound.currentTime = 0;
    matchSound.play();

    if (matches === gameBoard.children.length / 2) {
      clearInterval(timer);
      message.textContent = 'Lucky you! You found all pairs!';
      winSound.currentTime = 0;
      winSound.play();
      gameStarted = false;
    }
  } else {
    unflipCards();
  }
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  resetBoard();
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetBoard();
  }, 1000);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

function updateTimer() {
  timerDisplay.textContent = `Time Left: ${timeLeft}s`;
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      clearInterval(timer);
      message.textContent = 'Time’s up! Game over.';
      disableAllCards();
      gameStarted = false;
    }
  }, 1000);
}

function disableAllCards() {
  const allCards = document.querySelectorAll('.card');
  allCards.forEach(card => card.removeEventListener('click', flipCard));
}

// Event listeners
restartBtn.addEventListener('click', initGame);
difficultySelect.addEventListener('change', initGame);

// Start game only when user clicks restart (or after difficulty change)

// Start button on start screen
startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';  // Hide overlay
    initGame();                          // Start game
  });
  
  // Initially, game does NOT start until Start button clicked
  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
  