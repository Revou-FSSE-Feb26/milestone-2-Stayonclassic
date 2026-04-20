// Game: Whack-a-Mole
// Description: Hit the active mole quickly before it hides and collect as many points as possible.
// Concepts used: DOM manipulation, events, arrays, conditionals
// GAME FLOW:
// 1. Player starts game and countdown begins.
// 2. One random mole appears at a time in the grid.
// 3. Hits increase score until timer ends, then best score is saved.
// Code map: Whack-a-Mole loop with timed mole spawning.
// Flow: startWhackGame() starts timer -> showNextMole()/hideCurrentMole() cycle holes -> hits update score.

// ===== DOM REFERENCES =====
const whackScore = document.getElementById("whack-score");
const whackTime = document.getElementById("whack-time");
const whackStatus = document.getElementById("whack-status");
const whackStartButton = document.getElementById("whack-start");
const whackResetButton = document.getElementById("whack-reset");
const whackStage = document.getElementById("whack-stage");
const whackGrid = document.getElementById("whack-grid");
const hammerCursor = document.getElementById("hammer-cursor");
const whackHoles = Array.from(document.querySelectorAll(".whack-hole"));

// ===== STATIC DATA =====
const WHACK_GAME_SECONDS = 20;

// ===== CONFIG =====
const DEFAULT_NEXT_HOLE_DELAY_MS = 140;
const AVOID_REPEAT_NEXT_HOLE_DELAY_MS = 130;
const START_NEXT_HOLE_DELAY_MS = 220;
const HIT_NEXT_HOLE_DELAY_MS = 110;
const HIDE_MOLE_DELAY_MS = 900;
const HIDE_CLASS_CLEAR_DELAY_MS = 190;
const HIT_CLASS_CLEAR_DELAY_MS = 220;
const CURSOR_RELEASE_DELAY_MS = 110;
const COUNTDOWN_INTERVAL_MS = 1000;
const URGENT_TIME_SECONDS = 5;

// ===== STATE =====
let activeHole = -1;
let previousHole = -1;
let gameActive = false;
let score = 0;
let timeLeft = WHACK_GAME_SECONDS;
let hideTimer = 0;
let nextHoleTimer = 0;
let countdownTimer = 0;
let cursorReleaseTimer = 0;
let bestSavedScore = 0;

// ===== UI FUNCTIONS =====
// This replays the pulse animation class.
function pulseElement(element) {
  element.classList.remove("is-pulsing");
  void element.offsetWidth;
  element.classList.add("is-pulsing");
}

// This updates score and timer text.
function updateWhackHud() {
  whackScore.textContent = String(score);
  whackTime.textContent = String(timeLeft);
  whackTime.classList.toggle("is-urgent", gameActive && timeLeft <= URGENT_TIME_SECONDS);
}

// This clears all running timers.
function clearWhackTimers() {
  window.clearInterval(countdownTimer);
  window.clearTimeout(hideTimer);
  window.clearTimeout(nextHoleTimer);
}

// ===== GAME LOGIC =====
// This clears current mole classes.
function clearHoleState() {
  whackHoles.forEach((hole) => {
    hole.classList.remove("is-active", "is-hiding", "is-hit");
  });
  activeHole = -1;
}

// This picks the next hole index.
function getNextHoleIndex() {
  let nextHole = Math.floor(Math.random() * whackHoles.length);

  if (whackHoles.length > 1 && nextHole === previousHole) {
    nextHole = (nextHole + 1) % whackHoles.length;
  }

  previousHole = nextHole;
  return nextHole;
}

// This schedules the next mole spawn.
function scheduleNextHole(delay = DEFAULT_NEXT_HOLE_DELAY_MS) {
  window.clearTimeout(nextHoleTimer);
  nextHoleTimer = window.setTimeout(showNextMole, delay);
}

// This hides the active mole.
function hideCurrentMole(index) {
  const hole = whackHoles[index];

  if (!hole) {
    return;
  }

  hole.classList.remove("is-active");
  hole.classList.add("is-hiding");
  activeHole = -1;

  window.setTimeout(() => {
    hole.classList.remove("is-hiding");
  }, HIDE_CLASS_CLEAR_DELAY_MS);

  if (gameActive) {
    scheduleNextHole(AVOID_REPEAT_NEXT_HOLE_DELAY_MS);
  }
}

// This shows the next mole.
function showNextMole() {
  if (!gameActive) {
    return;
  }

  clearHoleState();
  activeHole = getNextHoleIndex();
  whackHoles[activeHole].classList.add("is-active");

  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    if (gameActive && activeHole !== -1) {
      hideCurrentMole(activeHole);
    }
  }, HIDE_MOLE_DELAY_MS);
}

// This turns hammer swing class on/off.
function setHammerActive(active) {
  hammerCursor.classList.toggle("is-active", active);
}

// This moves hammer cursor inside stage.
function moveHammer(event) {
  if (!window.matchMedia("(pointer:fine)").matches) {
    return;
  }

  const stageRect = whackStage.getBoundingClientRect();
  const withinStage =
    event.clientX >= stageRect.left &&
    event.clientX <= stageRect.right &&
    event.clientY >= stageRect.top &&
    event.clientY <= stageRect.bottom;

  hammerCursor.classList.toggle("hide", !withinStage);

  if (!withinStage) {
    return;
  }

  const x = event.clientX - stageRect.left;
  const y = event.clientY - stageRect.top;
  hammerCursor.style.left = `${x}px`;
  hammerCursor.style.top = `${y}px`;
}

// This plays quick hammer swing feedback.
function triggerHammerSwing() {
  if (!window.matchMedia("(pointer:fine)").matches) {
    return;
  }

  window.clearTimeout(cursorReleaseTimer);
  setHammerActive(true);
  cursorReleaseTimer = window.setTimeout(() => {
    setHammerActive(false);
  }, CURSOR_RELEASE_DELAY_MS);
}

// ===== GAME FLOW =====
// This stops the game and clears active state.
function stopWhackGame() {
  gameActive = false;
  clearWhackTimers();
  clearHoleState();
  whackGrid.classList.remove("is-live");
  whackStartButton.disabled = false;
  updateWhackHud();
}

// This saves only a new best score.
function saveWhackScore() {
  if (!window.RevoLeaderboard || score <= bestSavedScore) {
    return;
  }

  bestSavedScore = score;
  window.RevoLeaderboard.addScore(
    "whack",
    score,
    `${score} hit${score === 1 ? "" : "s"} in 20s`,
    window.RevoLeaderboard.getPlayerName()
  );
}

// This ends the game when time is up.
function endWhackGame() {
  stopWhackGame();
  saveWhackScore();
  whackStatus.textContent = `Time's up. Final score: ${score}.`;
  pulseElement(whackStatus);
}

// This starts a fresh game.
function startWhackGame() {
  stopWhackGame();
  score = 0;
  timeLeft = WHACK_GAME_SECONDS;
  gameActive = true;
  updateWhackHud();
  whackStatus.textContent = "Whack every mole before it ducks.";
  whackGrid.classList.add("is-live");
  whackStartButton.disabled = true;
  pulseElement(whackStatus);
  scheduleNextHole(START_NEXT_HOLE_DELAY_MS);

  countdownTimer = window.setInterval(() => {
    timeLeft -= 1;
    updateWhackHud();

    if (timeLeft <= 0) {
      endWhackGame();
    }
  }, COUNTDOWN_INTERVAL_MS);
}

// This resets the UI to idle state.
function resetWhackGame() {
  stopWhackGame();
  score = 0;
  timeLeft = WHACK_GAME_SECONDS;
  updateWhackHud();
  whackStatus.textContent = "Press start to begin.";
  pulseElement(whackStatus);
}

// ===== EVENTS =====
// This handles clicking each mole hole.
whackHoles.forEach((hole, index) => {
  hole.addEventListener("click", () => {
    if (!gameActive || index !== activeHole) {
      return;
    }

    triggerHammerSwing();
    score += 1;
    updateWhackHud();
    pulseElement(whackScore);
    window.clearTimeout(hideTimer);
    activeHole = -1;
    hole.classList.remove("is-active");
    hole.classList.add("is-hit");
    whackStatus.textContent = `Nice hit! Score is now ${score}.`;
    pulseElement(whackStatus);

    window.setTimeout(() => {
      hole.classList.remove("is-hit");
      if (gameActive) {
        scheduleNextHole(HIT_NEXT_HOLE_DELAY_MS);
      }
    }, HIT_CLASS_CLEAR_DELAY_MS);
  });
});

// These handle mouse events for the hammer cursor.
whackStage.addEventListener("mousemove", moveHammer);
whackStage.addEventListener("mouseenter", moveHammer);
whackStage.addEventListener("mouseleave", () => {
  hammerCursor.classList.add("hide");
  setHammerActive(false);
});
whackStage.addEventListener("mousedown", triggerHammerSwing);

window.addEventListener("mouseup", () => {
  setHammerActive(false);
});

// These handle button click events.
whackStartButton.addEventListener("click", startWhackGame);
whackResetButton.addEventListener("click", resetWhackGame);

// Start page in reset state.
resetWhackGame();
