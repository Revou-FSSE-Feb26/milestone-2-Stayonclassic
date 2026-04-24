// Rock Paper Scissors game.
// Player picks a move, CPU picks random, then score updates.

// ===== Get elements =====
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

// ===== Game data =====
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

// ===== Round timing =====
const countdownSteps = ["Rock...", "Paper...", "Scissors...", "Shoot!"];
const COUNTDOWN_STEP_MS = 170;
const COUNTDOWN_FINAL_DELAY_MS = 60;
const SHAKE_DURATION_MS = 820;
const RESULT_POP_MS = 320;

// ===== Game state =====
let bestPlayerScore = 0;
let isResolvingRound = false;
let countdownTimerIds = [];
let duelShakeTimerId = 0;

// Update the result text.
function setStatusText(text) {
  rpsStatus.textContent = text;
  pulseElement(rpsStatus);
}

// Enable or disable move buttons.
function setButtonsDisabled(disabled) {
  rpsButtons.forEach((button) => {
    button.disabled = disabled;
  });
}

// Highlight the selected move.
function updateSelectedChoice(choice) {
  rpsButtons.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.choice === choice);
  });
}

// Update score text on screen.
function updateRpsScore() {
  rpsWins.textContent = String(score.player);
  rpsLosses.textContent = String(score.computer);
  rpsDraws.textContent = String(score.draws);
  rpsScore.textContent = `Best match streak saved: ${bestPlayerScore} win${bestPlayerScore === 1 ? "" : "s"}.`;
  pulseElement(rpsScore);
}

// Add a quick pulse effect.
function pulseElement(element) {
  element.classList.remove("is-pulsing");
  void element.offsetWidth;
  element.classList.add("is-pulsing");
}

// Clear all running timers.
function clearCountdownTimers() {
  countdownTimerIds.forEach((timerId) => {
    window.clearTimeout(timerId);
  });
  window.clearTimeout(duelShakeTimerId);
  duelShakeTimerId = 0;
  rpsPreview.classList.remove("is-duel-shake");
  countdownTimerIds = [];
}

// Pick a random move for CPU.
function getComputerChoice() {
  const index = Math.floor(Math.random() * rpsChoices.length);
  return rpsChoices[index];
}

// Compare both moves and get result.
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

// Start one round.
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

// Show Rock-Paper-Scissors-Shoot countdown.
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

// Play one result animation.
function playResultAnimation() {
  rpsStatus.classList.remove("animate-pop");
  void rpsStatus.offsetWidth;
  rpsStatus.classList.add("animate-pop");
  window.setTimeout(() => {
    rpsStatus.classList.remove("animate-pop");
  }, RESULT_POP_MS);
}

// Save score only if it's the best this session.
function saveBestRpsScore() {
  if (!window.RevoLeaderboard || score.player <= bestPlayerScore) {
    return;
  }

  bestPlayerScore = score.player;
  window.RevoLeaderboard.addScore(
    "rps",
    score.player,
    `${score.player} win${score.player === 1 ? "" : "s"} in match`,
    window.RevoLeaderboard.getPlayerName()
  );
}

// Finish the round after countdown.
function resolveRound(playerChoice) {
  const computerChoice = getComputerChoice();
  const roundResult = decideRound(playerChoice, computerChoice);
  computerPreview.src = rpsImages[computerChoice];

  rpsPreview.classList.remove("is-dueling", "is-duel-shake", "is-resolving");
  void rpsPreview.offsetWidth;
  rpsPreview.classList.add("is-resolving");

  setStatusText(roundResult.message);
  rpsStatus.dataset.outcome = roundResult.outcome;
  playResultAnimation();

  isResolvingRound = false;
  saveBestRpsScore();
  updateRpsScore();
  setButtonsDisabled(false);
}

// Reset the whole game.
function resetRpsGame() {
  clearCountdownTimers();
  score.player = 0;
  score.computer = 0;
  score.draws = 0;
  bestPlayerScore = 0;
  isResolvingRound = false;
  setButtonsDisabled(false);
  updateSelectedChoice("");
  playerPreview.src = rpsImages.rock;
  computerPreview.src = rpsImages.scissors;
  rpsPreview.classList.remove("is-dueling", "is-duel-shake", "is-resolving");
  rpsStatus.dataset.outcome = "idle";
  rpsStatus.textContent = "Choose your move to begin the showdown.";
  updateRpsScore();
}

// ===== Events =====
rpsButtons.forEach((button) => {
  button.addEventListener("click", () => {
    playRound(button.dataset.choice);
  });
});

rpsResetButton.addEventListener("click", resetRpsGame);

resetRpsGame();
