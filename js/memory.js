// Digimon Memory Match game.
// Flip cards and match all pairs to win.

// ===== Get elements =====
const movesCountElement = document.getElementById("moves-count");
const timeValue = document.getElementById("time");
const memoryLevelBadge = document.getElementById("memory-level-badge");
const startButton = document.getElementById("memory-start");
const stopButton = document.getElementById("memory-stop");
const gameContainer = document.getElementById("memory-grid");
const result = document.getElementById("memory-result");
const controls = document.getElementById("memory-controls");
const levelButtons = Array.from(document.querySelectorAll(".level-option"));

// ===== Card data =====
const memoryItems = [
  { name: "digimon-0", image: "digimon.png" },
  { name: "digimon-1", image: "digimon1.png" },
  { name: "digimon-2", image: "digimon2.png" },
  { name: "digimon-3", image: "digimon3.png" },
  { name: "digimon-4", image: "digimon4.png" },
  { name: "digimon-5", image: "digimon5.png" },
  { name: "digimon-6", image: "digimon6.png" },
  { name: "digimon-7", image: "digimon7.png" },
  { name: "digimon-8", image: "digimon8.png" },
  { name: "digimon-9", image: "digimon9.png" },
];

const memoryLevels = {
  easy: {
    label: "Easy",
    pairs: 5,
    columns: 5,
  },
  normal: {
    label: "Normal",
    pairs: 7,
    columns: 4,
  },
  hard: {
    label: "Hard",
    pairs: 10,
    columns: 5,
  },
};

// ===== Game state =====
let currentLevel = "easy";
let interval = 0;
let firstCard = false;
let secondCard = false;
let isBoardLocked = false;
let seconds = 0;
let minutes = 0;
let movesCount = 0;
let winCount = 0;
let bestSavedScore = 0;

// ===== UI and timer helpers =====
// Get settings for selected level.
function getLevelConfig() {
  return memoryLevels[currentLevel];
}

// Build image path for a card.
function getMemoryImagePath(fileName) {
  return new URL(`../assets/${fileName}`, window.location.href).href;
}

// Format timer as mm:ss.
function formatTime() {
  const secondsValue = seconds < 10 ? `0${seconds}` : String(seconds);
  const minutesValue = minutes < 10 ? `0${minutes}` : String(minutes);
  return `${minutesValue}:${secondsValue}`;
}

// Update moves text.
function setMovesText() {
  movesCountElement.innerHTML = `<span>Moves:</span>${movesCount}`;
}

// Update time text.
function setTimeText() {
  timeValue.innerHTML = `<span>Time:</span>${formatTime()}`;
}

// Highlight selected level and badge.
function updateLevelUI() {
  const levelConfig = getLevelConfig();
  memoryLevelBadge.innerHTML = `<span>Level:</span>${levelConfig.label}`;
  levelButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.level === currentLevel);
  });
}

// Add one second to timer.
function timeGenerator() {
  seconds += 1;

  if (seconds >= 60) {
    minutes += 1;
    seconds = 0;
  }

  setTimeText();
}

// Add one move after second flip.
function movesCounter() {
  movesCount += 1;
  setMovesText();
}

// Reset all game stats.
function resetStats() {
  seconds = 0;
  minutes = 0;
  movesCount = 0;
  winCount = 0;
  firstCard = false;
  secondCard = false;
  isBoardLocked = false;
  setMovesText();
  setTimeText();
  updateLevelUI();
}

// ===== Score and result =====
// Calculate score from level, moves, and time.
function calculateMemoryScore() {
  const elapsedSeconds = minutes * 60 + seconds;
  const baseScore = getLevelConfig().pairs * 150;
  return Math.max(100, baseScore - movesCount * 10 - elapsedSeconds * 6);
}

// Save score only if it's the best this session.
function saveMemoryScore() {
  const score = calculateMemoryScore();
  const levelConfig = getLevelConfig();

  if (!window.RevoLeaderboard || score <= bestSavedScore) {
    return;
  }

  bestSavedScore = score;
  window.RevoLeaderboard.addScore(
    "memory",
    score,
    `${levelConfig.label} | ${movesCount} moves in ${formatTime()}`,
    window.RevoLeaderboard.getPlayerName()
  );
}

// Build intro text for current level.
function getIntroText(initial = false) {
  const levelConfig = getLevelConfig();

  if (initial) {
    return `Pick a level and match ${levelConfig.pairs} Digimon pairs.`;
  }

  return `Match all ${levelConfig.pairs} Digimon pairs on ${levelConfig.label.toLowerCase()}.`;
}

// Stop timer and show intro or result.
function stopGame(won = false, initial = false) {
  window.clearInterval(interval);
  controls.classList.remove("hide");
  stopButton.classList.add("hide");
  startButton.textContent = won ? "Play Again" : initial ? "Start Game" : "Start New Round";

  if (won) {
    saveMemoryScore();
    result.innerHTML = `
      <h2>You Won</h2>
      <h4>Level: ${getLevelConfig().label}</h4>
      <h4>Moves: ${movesCount}</h4>
      <h4>Time: ${formatTime()}</h4>
    `;
    return;
  }

  result.innerHTML = `
    <h2>Digimon Memory</h2>
    <h4>${getIntroText(initial)}</h4>
  `;
}

// ===== Build cards =====
// Pick random Digimon cards for level.
function generateRandom(pairCount = getLevelConfig().pairs) {
  const tempArray = [...memoryItems];
  const cardValues = [];

  for (let index = 0; index < pairCount; index += 1) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    cardValues.push(tempArray[randomIndex]);
    tempArray.splice(randomIndex, 1);
  }

  return cardValues;
}

// Create card grid and click events.
function matrixGenerator(cardValues) {
  gameContainer.innerHTML = "";
  const randomizedCards = [...cardValues, ...cardValues].sort(() => Math.random() - 0.5);

  randomizedCards.forEach((item) => {
    const imagePath = getMemoryImagePath(item.image);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card-container";
    card.dataset.cardValue = item.name;
    card.innerHTML = `
      <div class="card-before">?</div>
      <div class="card-after">
        <img src="${imagePath}" class="image" alt="${item.name}">
      </div>
    `;
    gameContainer.appendChild(card);
  });

  gameContainer.style.gridTemplateColumns = `repeat(${getLevelConfig().columns}, minmax(0, 1fr))`;

  const cards = gameContainer.querySelectorAll(".card-container");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      handleCardClick(card, randomizedCards.length / 2);
    });
  });
}

// Check if card can be flipped now.
function canFlipCard(card) {
  return (
    !isBoardLocked &&
    !card.classList.contains("matched") &&
    !card.classList.contains("flipped")
  );
}

// Mark both cards as matched.
function markMatchedCards() {
  firstCard.classList.remove("flipped");
  secondCard.classList.remove("flipped");
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
  firstCard = false;
  secondCard = false;
  winCount += 1;
}

// Flip unmatched cards back after delay.
function resetUnmatchedCards(previousFirst, previousSecond) {
  window.setTimeout(() => {
    previousFirst.classList.remove("flipped");
    previousSecond.classList.remove("flipped");
    isBoardLocked = false;
  }, 900);
}

// Handle card click during game.
function handleCardClick(card, totalPairs) {
  if (!canFlipCard(card)) {
    return;
  }

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  movesCounter();
  secondCard = card;

  if (firstCard.dataset.cardValue === secondCard.dataset.cardValue) {
    markMatchedCards();
    if (winCount === totalPairs) {
      stopGame(true);
    }
    return;
  }

  // Not a match, flip both cards back after delay.
  const previousFirst = firstCard;
  const previousSecond = secondCard;
  isBoardLocked = true;
  firstCard = false;
  secondCard = false;
  resetUnmatchedCards(previousFirst, previousSecond);
}

// ===== Start game and events =====
// Start a fresh board with reset stats.
function initializer() {
  resetStats();
  const cardValues = generateRandom();
  matrixGenerator(cardValues);
}

levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentLevel = button.dataset.level;
    updateLevelUI();

    if (!controls.classList.contains("hide")) {
      stopGame(false, true);
    }
  });
});

startButton.addEventListener("click", () => {
  controls.classList.add("hide");
  stopButton.classList.remove("hide");
  window.clearInterval(interval);
  initializer();
  interval = window.setInterval(timeGenerator, 1000);
});

stopButton.addEventListener("click", () => {
  stopGame(false);
});

resetStats();
stopGame(false, true);
