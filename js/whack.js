// Whack-a-Mole game.
// Hit moles before they hide to get points.

// ===== Get elements =====
const whackScore = document.getElementById("whack-score");
const whackTime = document.getElementById("whack-time");
const whackStatus = document.getElementById("whack-status");
const whackStartButton = document.getElementById("whack-start");
const whackResetButton = document.getElementById("whack-reset");
const whackStage = document.getElementById("whack-stage");
const whackGrid = document.getElementById("whack-grid");
const hammerCursor = document.getElementById("hammer-cursor");
const whackHoles = Array.from(document.querySelectorAll(".whack-hole"));

// ===== Game state =====
let activeHole = -1;
let previousHole = -1;
let gameActive = false;
let score = 0;
let timeLeft = 20;
let hideTimer = 0;
let nextHoleTimer = 0;
let countdownTimer = 0;
let cursorReleaseTimer = 0;
let bestSavedScore = 0;

// ===== UI helpers =====
// Add a pulse effect to updated text.
function pulseElement(element) {
  element.classList.remove("is-pulsing");
  void element.offsetWidth;
  element.classList.add("is-pulsing");
}

// Update score and time on screen.
function updateWhackHud() {
  whackScore.textContent = String(score);
  whackTime.textContent = String(timeLeft);
  whackTime.classList.toggle("is-urgent", gameActive && timeLeft <= 5);
}

// Clear all active timers.
function clearWhackTimers() {
  window.clearInterval(countdownTimer);
  window.clearTimeout(hideTimer);
  window.clearTimeout(nextHoleTimer);
}

// ===== Mole flow =====
// Clear all hole states.
function clearHoleState() {
  whackHoles.forEach((hole) => {
    hole.classList.remove("is-active", "is-hiding", "is-hit");
  });
  activeHole = -1;
}

// Pick a random hole, avoid repeating the last one.
function getNextHoleIndex() {
  let nextHole = Math.floor(Math.random() * whackHoles.length);

  if (whackHoles.length > 1 && nextHole === previousHole) {
    nextHole = (nextHole + 1) % whackHoles.length;
  }

  previousHole = nextHole;
  return nextHole;
}

// Set when the next mole appears.
function scheduleNextHole(delay = 140) {
  window.clearTimeout(nextHoleTimer);
  nextHoleTimer = window.setTimeout(showNextMole, delay);
}

// Hide the current mole.
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
  }, 190);

  if (gameActive) {
    scheduleNextHole(130);
  }
}

// Show one mole and start hide timer.
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
  }, 900);
}

// ===== Hammer cursor =====
// Toggle hammer click style.
function setHammerActive(active) {
  hammerCursor.classList.toggle("is-active", active);
}

// Move hammer with mouse inside stage.
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

// Play quick hammer swing on click.
function triggerHammerSwing() {
  if (!window.matchMedia("(pointer:fine)").matches) {
    return;
  }

  window.clearTimeout(cursorReleaseTimer);
  setHammerActive(true);
  cursorReleaseTimer = window.setTimeout(() => {
    setHammerActive(false);
  }, 110);
}

// ===== Game flow =====
// Stop game loop and return to idle.
function stopWhackGame() {
  gameActive = false;
  clearWhackTimers();
  clearHoleState();
  whackGrid.classList.remove("is-live");
  whackStartButton.disabled = false;
  updateWhackHud();
}

// Save score only if it's the best this session.
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

// End game when time reaches zero.
function endWhackGame() {
  stopWhackGame();
  saveWhackScore();
  whackStatus.textContent = `Time's up. Final score: ${score}.`;
  pulseElement(whackStatus);
}

// Start a fresh game.
function startWhackGame() {
  stopWhackGame();
  score = 0;
  timeLeft = 20;
  gameActive = true;
  updateWhackHud();
  whackStatus.textContent = "Whack every mole before it ducks.";
  whackGrid.classList.add("is-live");
  whackStartButton.disabled = true;
  pulseElement(whackStatus);
  scheduleNextHole(220);

  countdownTimer = window.setInterval(() => {
    timeLeft -= 1;
    updateWhackHud();

    if (timeLeft <= 0) {
      endWhackGame();
    }
  }, 1000);
}

// Reset game to start state.
function resetWhackGame() {
  stopWhackGame();
  score = 0;
  timeLeft = 20;
  updateWhackHud();
  whackStatus.textContent = "Press start to begin.";
  pulseElement(whackStatus);
}

// ===== Events =====
whackHoles.forEach((hole, index) => {
  hole.addEventListener("click", () => {
    // Count hit only on active mole.
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
        scheduleNextHole(110);
      }
    }, 220);
  });
});

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

whackStartButton.addEventListener("click", startWhackGame);
whackResetButton.addEventListener("click", resetWhackGame);

resetWhackGame();
