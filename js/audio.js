// Shared audio controller for all RevoFun pages.
// Keeps music + SFX behavior consistent across the arcade.
(function setupRevoAudio() {
  const MUTE_STORAGE_KEY = "revofun_audio_muted";
  const MUSIC_STARTED_KEY = "revofun_music_started";
  const MUSIC_POSITION_KEY = "revofun_music_position";
  const MUSIC_SAVE_INTERVAL_MS = 1200;
  const isGamePage = window.location.pathname.includes("/pages/");
  const pageBody = document.body;
  const isWhackPage = pageBody?.classList.contains("game-whack");
  const soundsBasePath = isGamePage ? "../assets/sounds/" : "assets/sounds/";

  const uiClickVolume = isGamePage ? 0.1 : 0.07;
  const hitVolume = isWhackPage ? 0.34 : 0.24;

  const volume = {
    music: 0.16,
    win: 0.34,
    lose: 0.3,
    hit: hitVolume,
    flip: 0.2,
    uiClick: uiClickVolume,
  };

  // Reusable audio elements.
  const bgMusic = createAudio("bg-music.mp3", volume.music, true);
  const sfxLibrary = {
    win: createAudio("win.mp3", volume.win),
    lose: createAudio("lose.mp3", volume.lose),
    hit: createAudio("hit.mp3", volume.hit),
    flip: createAudio("flip.mp3", volume.flip),
    uiClick: createAudio("ui-click.mp3", volume.uiClick),
  };

  let hasInteracted = readMusicStartedFlag();
  let lastUiClickSoundAt = 0;
  let isMuted = readMutedPreference();
  let musicPositionTimerId = 0;
  let hasRestoredPosition = false;
  const toggleButton = createMuteToggleButton();

  function createAudio(fileName, audioVolume, shouldLoop = false) {
    const audio = new Audio(`${soundsBasePath}${fileName}`);
    audio.preload = "auto";
    audio.volume = audioVolume;
    audio.loop = shouldLoop;
    return audio;
  }

  function readMutedPreference() {
    try {
      return localStorage.getItem(MUTE_STORAGE_KEY) === "true";
    } catch (error) {
      return false;
    }
  }

  function saveMutedPreference() {
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
    } catch (error) {
      // Ignore storage errors; audio still works for this session.
    }
  }

  function readMusicStartedFlag() {
    try {
      return localStorage.getItem(MUSIC_STARTED_KEY) === "true";
    } catch (error) {
      return false;
    }
  }

  function saveMusicStartedFlag() {
    try {
      localStorage.setItem(MUSIC_STARTED_KEY, "true");
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function readSavedMusicPosition() {
    try {
      const savedValue = Number(localStorage.getItem(MUSIC_POSITION_KEY));
      return Number.isFinite(savedValue) && savedValue >= 0 ? savedValue : 0;
    } catch (error) {
      return 0;
    }
  }

  // Save current music position so next page can continue smoothly.
  function saveMusicPosition() {
    if (!Number.isFinite(bgMusic.currentTime)) {
      return;
    }

    try {
      localStorage.setItem(MUSIC_POSITION_KEY, String(bgMusic.currentTime));
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function clampToDuration(position) {
    if (!Number.isFinite(bgMusic.duration) || bgMusic.duration <= 0) {
      return position;
    }

    return position % bgMusic.duration;
  }

  function restoreMusicPosition() {
    if (hasRestoredPosition) {
      return;
    }

    const savedPosition = readSavedMusicPosition();
    if (!savedPosition) {
      hasRestoredPosition = true;
      return;
    }

    const applyPosition = () => {
      bgMusic.currentTime = clampToDuration(savedPosition);
      hasRestoredPosition = true;
    };

    if (bgMusic.readyState >= 1) {
      applyPosition();
      return;
    }

    bgMusic.addEventListener("loadedmetadata", applyPosition, { once: true });
  }

  function startMusicPositionSync() {
    window.clearInterval(musicPositionTimerId);
    musicPositionTimerId = window.setInterval(() => {
      if (!bgMusic.paused) {
        saveMusicPosition();
      }
    }, MUSIC_SAVE_INTERVAL_MS);
  }

  function syncMutedState() {
    bgMusic.muted = isMuted;
    updateToggleButton();
  }

  function updateToggleButton() {
    if (!toggleButton) {
      return;
    }

    toggleButton.textContent = isMuted ? "Sound Off" : "Sound On";
    toggleButton.setAttribute("aria-pressed", String(isMuted));
    toggleButton.setAttribute(
      "aria-label",
      isMuted ? "Enable game sound" : "Mute game sound"
    );
  }

  function playBackgroundMusic() {
    if (isMuted || !hasInteracted) {
      return;
    }

    restoreMusicPosition();
    bgMusic.play().then(() => {
      startMusicPositionSync();
    }).catch(() => {
      // Browser can still block playback in strict contexts.
      // We keep waiting for the next user interaction.
    });
  }

  function playSfx(name) {
    if (isMuted) {
      return;
    }

    const sample = sfxLibrary[name];
    if (!sample) {
      return;
    }

    // Clone so rapid game events do not cut off previous sounds.
    const instance = sample.cloneNode();
    instance.volume = sample.volume;
    instance.play().catch(() => {
      // Ignore if file is missing or playback is blocked.
    });
  }

  function setMuted(nextMuted) {
    isMuted = Boolean(nextMuted);
    syncMutedState();
    saveMutedPreference();

    if (isMuted) {
      saveMusicPosition();
      bgMusic.pause();
      return;
    }

    playBackgroundMusic();
  }

  function toggleMuted() {
    setMuted(!isMuted);
  }

  function onFirstInteraction() {
    hasInteracted = true;
    saveMusicStartedFlag();
    playBackgroundMusic();
  }

  function createMuteToggleButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "audio-toggle";
    button.id = "audio-toggle";
    button.addEventListener("click", () => {
      toggleMuted();
      playSfx("uiClick");
    });
    document.body.appendChild(button);
    return button;
  }

  function shouldPlayUiClick(event) {
    const target = event.target.closest("button, a, [role='button']");
    if (!target || target.disabled) {
      return false;
    }

    if (target.id === "audio-toggle") {
      return false;
    }

    // Whack and memory have their own event sounds.
    if (target.classList.contains("whack-hole") || target.classList.contains("card-container")) {
      return false;
    }

    return true;
  }

  function handleUiClick(event) {
    if (!shouldPlayUiClick(event)) {
      return;
    }

    const now = Date.now();
    if (now - lastUiClickSoundAt < 120) {
      return;
    }

    lastUiClickSoundAt = now;
    playSfx("uiClick");
  }

  function handlePageHidden() {
    saveMusicPosition();
    window.clearInterval(musicPositionTimerId);
  }

  window.addEventListener("pointerdown", onFirstInteraction, { once: true });
  window.addEventListener("keydown", onFirstInteraction, { once: true });
  document.addEventListener("click", handleUiClick);
  window.addEventListener("beforeunload", handlePageHidden);
  window.addEventListener("pagehide", handlePageHidden);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveMusicPosition();
    }
  });

  syncMutedState();
  if (hasInteracted && !isMuted) {
    // Continue music session when returning to another page.
    playBackgroundMusic();
  }

  // Shared API used by individual game scripts.
  window.RevoAudio = {
    playSfx,
    setMuted,
    toggleMuted,
    isMuted() {
      return isMuted;
    },
    startMusic() {
      hasInteracted = true;
      saveMusicStartedFlag();
      playBackgroundMusic();
    },
  };
})();
