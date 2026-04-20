// Game: Rock Paper Scissors
// Description: Pick rock, paper, or scissors and play against a random computer choice.
// Concepts used: DOM manipulation, events, arrays, conditionals
// GAME FLOW:
// 1. Player clicks a move button.
// 2. Game runs countdown, then randomly picks computer move.
// 3. Result updates score/status.
// Code map: Rock Paper Scissors round engine.
// Flow: wire DOM -> playRound() starts countdown -> resolveRound() computes result.

// ===== DOM REFERENCES =====
const rpsButtons = document.querySelectorAll(".rps-choice");
const rpsWins = document.getElementById("rps-wins");
const rpsLosses = document.getElementById("rps-losses");
const rpsDraws = document.getElementById("rps-draws");
const rpsScore = document.getElementById("rps-score");
const rpsStatus = document.getElementById("rps-status");
const rpsResetButton = document.getElementById("rps-reset");
const rpsPreview = document.getElementById("rps-preview");
const playerPreview = document.getElementById("player-preview");
const computerPreview = document.getElementById("computer-preview");

// ===== STATIC DATA =====
const rpsChoices = ["rock", "paper", "scissors"];
const rpsImages = {
  rock: "../assets/Rock.png",
  paper: "../assets/Paper.png",
  scissors: "../assets/Scissors.png",
};

const score = {
  player: 0,
  computer: 0,
  draws: 0,
};

// ===== CONFIG =====
const countdownSteps = ["Rock...", "Paper...", "Scissors...", "Shoot!"];
const COUNTDOWN_STEP_MS = 170;
const COUNTDOWN_FINAL_DELAY_MS = 60;
const SHAKE_DURATION_MS = 820;
const RESULT_POP_MS = 320;

// ===== STATE =====
let bestSavedPlayerScore = 0;
let isResolvingRound = false;
let countdownTimerIds = [];
let duelShakeTimerId = 0;

// ===== UI FUNCTIONS =====
// This shows a message in the status box.
function setStatusText(text) {
  rpsStatus.textContent = text;
  pulseElement(rpsStatus);
}

// This enables/disables move buttons.
function setButtonsDisabled(disabled) {
  rpsButtons.forEach((button) => {
    button.disabled = disabled;
  });
}

// This highlights the selected move.
function updateSelectedChoice(choice) {
  rpsButtons.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.choice === choice);
  });
}

// This updates score text on screen.
function updateRpsScore() {
  rpsWins.textContent = String(score.player);
  rpsLosses.textContent = String(score.computer);
  rpsDraws.textContent = String(score.draws);
  rpsScore.textContent = `Best match streak saved: ${bestSavedPlayerScore} win${bestSavedPlayerScore === 1 ? "" : "s"}.`;
  pulseElement(rpsScore);
}

// This replays the pulse animation class.
function pulseElement(element) {
  element.classList.remove("is-pulsing");
  void element.offsetWidth;
  element.classList.add("is-pulsing");
}

// ===== GAME LOGIC =====
// This picks a random move for the CPU.
function getComputerChoice() {
  const index = Math.floor(Math.random() * rpsChoices.length);
  return rpsChoices[index];
}

// This compares moves and decides the round.
function decideRound(playerChoice, computerChoice) {
  if (playerChoice === computerChoice) {
    score.draws += 1;
    return {
      message: `Draw. You both picked ${playerChoice}.`,
      outcome: "draw",
    };
  }

  let playerWins = false;

  switch (playerChoice) {
    case "rock":
      playerWins = computerChoice === "scissors";
      break;
    case "paper":
      playerWins = computerChoice === "rock";
      break;
    case "scissors":
      playerWins = computerChoice === "paper";
      break;
    default:
      playerWins = false;
  }

  if (playerWins) {
    score.player += 1;
    return {
      message: `You win. ${playerChoice} beats ${computerChoice}.`,
      outcome: "win",
    };
  }

  score.computer += 1;
  return {
    message: `Computer wins. ${computerChoice} beats ${playerChoice}.`,
    outcome: "loss",
  };
}

// ===== GAME FLOW =====
// This clears active timers before a new round.
function clearCountdownTimers() {
  countdownTimerIds.forEach((timerId) => {
    window.clearTimeout(timerId);
  });
  window.clearTimeout(duelShakeTimerId);
  duelShakeTimerId = 0;
  rpsPreview.classList.remove("is-duel-shake");
  countdownTimerIds = [];
}

// This starts a new round.
function playRound(playerChoice) {
  if (isResolvingRound) {
    return;
  }

  clearCountdownTimers();
  isResolvingRound = true;
  setButtonsDisabled(true);
  updateSelectedChoice(playerChoice);
  playerPreview.src = rpsImages[playerChoice];
  computerPreview.src = rpsImages.rock;
  rpsStatus.dataset.outcome = "idle";
  rpsPreview.classList.remove("is-resolving");
  rpsPreview.classList.add("is-dueling", "is-duel-shake");
  duelShakeTimerId = window.setTimeout(() => {
    rpsPreview.classList.remove("is-duel-shake");
    duelShakeTimerId = 0;
  }, SHAKE_DURATION_MS);
  runCountdown(playerChoice);
}

// This runs the Rock-Paper-Scissors countdown.
function runCountdown(playerChoice) {
  countdownSteps.forEach((label, index) => {
    const timerId = window.setTimeout(() => {
      rpsStatus.textContent = label;
      pulseElement(rpsStatus);
    }, index * COUNTDOWN_STEP_MS);
    countdownTimerIds.push(timerId);
  });

  const resolveTimer = window.setTimeout(() => {
    resolveRound(playerChoice);
  }, countdownSteps.length * COUNTDOWN_STEP_MS + COUNTDOWN_FINAL_DELAY_MS);
  countdownTimerIds.push(resolveTimer);
}

// This resolves the round and updates the UI.
function resolveRound(playerChoice) {
  const computerChoice = getComputerChoice();
  const roundResult = decideRound(playerChoice, computerChoice);
  computerPreview.src = rpsImages[computerChoice];

  rpsPreview.classList.remove("is-dueling", "is-duel-shake", "is-resolving");
  void rpsPreview.offsetWidth;
  rpsPreview.classList.add("is-resolving");
  setStatusText(roundResult.message);
  rpsStatus.dataset.outcome = roundResult.outcome;
  rpsStatus.classList.remove("animate-pop");
  void rpsStatus.offsetWidth;
  rpsStatus.classList.add("animate-pop");
  window.setTimeout(() => {
    rpsStatus.classList.remove("animate-pop");
  }, RESULT_POP_MS);
  isResolvingRound = false;

  if (window.RevoLeaderboard && score.player > bestSavedPlayerScore) {
    bestSavedPlayerScore = score.player;
    window.RevoLeaderboard.addScore(
      "rps",
      score.player,
      `${score.player} win${score.player === 1 ? "" : "s"} in match`,
      window.RevoLeaderboard.getPlayerName()
    );
  }

  updateRpsScore();
  setButtonsDisabled(false);
}

// This resets the game to the default state.
function resetRpsGame() {
  clearCountdownTimers();
  score.player = 0;
  score.computer = 0;
  score.draws = 0;
  bestSavedPlayerScore = 0;
  isResolvingRound = false;
  setButtonsDisabled(false);
  updateSelectedChoice("");
  playerPreview.src = rpsImages.rock;
  computerPreview.src = rpsImages.rock;
  rpsPreview.classList.remove("is-dueling", "is-duel-shake", "is-resolving");
  rpsStatus.dataset.outcome = "idle";
  rpsStatus.textContent = "Choose your move to begin the showdown.";
  updateRpsScore();
}

// ===== EVENTS =====
// This handles move button clicks.
rpsButtons.forEach((button) => {
  button.addEventListener("click", () => {
    playRound(button.dataset.choice);
  });
});

// This handles the reset button click.
rpsResetButton.addEventListener("click", resetRpsGame);

// Start page in reset state.
resetRpsGame();
