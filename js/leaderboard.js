// Shared leaderboard for all games.
// Scores are saved in localStorage.

// ===== Storage keys =====
const LEADERBOARD_KEY = "revofun_leaderboard";
const PLAYER_NAME_KEY = "revofun_player_name";
const MAX_ENTRIES = 5;

// Escape text before showing with innerHTML.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const defaultBoard = {
  rps: [],
  whack: [],
  memory: [],
};

// ===== Load and save =====
// Read leaderboard from localStorage.
function loadLeaderboard() {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (!stored) {
      return { ...defaultBoard };
    }

    const parsed = JSON.parse(stored);
    let whack = Array.isArray(parsed.whack) ? parsed.whack : [];
    if (!whack.length && Array.isArray(parsed.mole)) {
      whack = parsed.mole;
    }

    return {
      rps: Array.isArray(parsed.rps) ? parsed.rps : [],
      whack,
      memory: Array.isArray(parsed.memory) ? parsed.memory : [],
    };
  } catch (error) {
    console.error('Leaderboard load failed:', error);
    return { ...defaultBoard };
  }
}

// Save leaderboard to localStorage.
function saveLeaderboard(board) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board));
  } catch (error) {
    console.error('Leaderboard save failed:', error);
  }
}

// ===== Player name =====
// Clear all saved scores and refresh list.
function clearLeaderboard() {
  saveLeaderboard({ ...defaultBoard });
  renderAllLeaderboards();
}

// Clean player name before saving.
function normalizeName(value) {
  const name = String(value || "").trim().replace(/\s+/g, " ");
  return name.slice(0, 20);
}

// Get last saved player name.
function getStoredPlayerName() {
  try {
    return normalizeName(localStorage.getItem(PLAYER_NAME_KEY));
  } catch (error) {
    return "";
  }
}

// Save player name when input has text.
function setStoredPlayerName(name) {
  const normalized = normalizeName(name);

  try {
    if (normalized) {
      localStorage.setItem(PLAYER_NAME_KEY, normalized);
    }
  } catch (error) {
    console.error('Player name save failed:', error);
  }
}

// Get player name from input or saved value.
function getPlayerName() {
  const input = document.getElementById("player-name");

  if (input) {
    input.value = normalizeName(input.value);
    if (input.value) {
      setStoredPlayerName(input.value);
      return input.value;
    }
  }

  return getStoredPlayerName() || "Player";
}

// Fill name input and auto-save while typing.
function hydratePlayerName() {
  const input = document.getElementById("player-name");

  if (!input) {
    return;
  }

  input.value = getStoredPlayerName();
  input.addEventListener("input", () => {
    setStoredPlayerName(input.value);
  });
}

// ===== Render leaderboard =====
// Render one game leaderboard list.
function renderLeaderboardList(gameKey, elementId) {
  const board = loadLeaderboard();
  const list = document.getElementById(elementId);

  if (!list) {
    return;
  }

  const entries = board[gameKey];

  if (!entries.length) {
    list.innerHTML = '<li class="leaderboard-empty">No scores yet. Play a round.</li>';
    return;
  }

  list.innerHTML = entries.map((entry) => {
    const name = escapeHtml(entry.name ?? "");
    const label = escapeHtml(entry.label ?? "");
    const score = escapeHtml(Number(entry.score) || 0);
    return `
    <li>
      <span class="leaderboard-name">${name} - ${label}</span>
      <span class="leaderboard-score">${score}</span>
    </li>
  `;
  }).join("");
}

// Render all game leaderboards.
function renderAllLeaderboards() {
  renderLeaderboardList("rps", "leaderboard-rps");
  renderLeaderboardList("whack", "leaderboard-whack");
  renderLeaderboardList("memory", "leaderboard-memory");
}

// ===== Add score =====
// Add score, sort, and keep top 5.
function addScore(gameKey, score, label, name) {
  const board = loadLeaderboard();
  const entry = {
    score,
    label,
    name: normalizeName(name) || "Player",
    date: new Date().toISOString(),
  };

  board[gameKey] = [...board[gameKey], entry]
    .sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date))
    .slice(0, MAX_ENTRIES);

  saveLeaderboard(board);
  renderAllLeaderboards();
}

// ===== Public API =====
window.RevoLeaderboard = {
  addScore,
  clear: clearLeaderboard,
  getBoard: loadLeaderboard,
  getPlayerName,
  hydratePlayerName,
  render: renderAllLeaderboards,
};

hydratePlayerName();
renderAllLeaderboards();

// If clear button exists, confirm before clearing scores.
const clearLeaderboardButton = document.getElementById("clear-leaderboard");
if (clearLeaderboardButton) {
  clearLeaderboardButton.addEventListener("click", () => {
    const ok = window.confirm(
      "Clear all saved scores for every game? This only affects this browser."
    );
    if (ok) {
      clearLeaderboard();
    }
  });
}
