"use strict";

// Ziel bleibt wie vereinbart bei deutscher Zeit: 12.09.2027, 00:00 MESZ.
const TARGET_DATE = "2027-09-12T00:00:00+02:00";
const GROWTH_START = "2026-09-05T00:00:00+02:00";
const targetTime = Date.parse(TARGET_DATE);
const growthStartTime = Date.parse(GROWTH_START);
const INTRO_KEY = "tz-cappadocia-intro-v1";
const INTRO_DURATION = 7800;
const PUMP_PERIOD = 1500;

function getRemainingTime(now) {
  const totalSeconds = Math.max(0, Math.ceil((targetTime - now) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor(totalSeconds / 3600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
    finished: totalSeconds === 0,
  };
}

function getBalloonProgress(now) {
  return Math.min(1, Math.max(0, (now - growthStartTime) / (targetTime - growthStartTime)));
}

function getBalloonScale(now) {
  // Fester Zeitraum für alle Besucher; ein Neuladen setzt das Wachstum nicht zurück.
  return 0.45 + 0.55 * getBalloonProgress(now);
}

function getSceneFrame(elapsed, intro = true) {
  if (!intro || elapsed >= INTRO_DURATION) {
    const pumpElapsed = intro ? elapsed - INTRO_DURATION : elapsed;
    return { phase: "pumping", pose: pumpElapsed % PUMP_PERIOD < 750 ? 6 : 7, transform: "" };
  }
  if (elapsed < 900) return { phase: "hello", pose: 0, transform: "" };
  if (elapsed < 2200) return { phase: "kiss", pose: 1, transform: "translateY(-2px)" };
  if (elapsed < 3200) return { phase: "hug", pose: 2, transform: "" };
  if (elapsed < 4100) return { phase: "hug", pose: 3, transform: "translateY(-3px)" };
  if (elapsed < 6500) {
    const progress = (elapsed - 4100) / 2400;
    const angle = progress * Math.PI * 2;
    const pose = progress < .125 || progress >= .875 ? 3 : progress < .375 || progress >= .625 ? 4 : 5;
    const flip = progress >= .625 && progress < .875 ? -1 : 1;
    const scale = .94 + .06 * Math.abs(Math.cos(angle));
    return {
      phase: "turn",
      pose,
      transform: "translate(" + (Math.sin(angle) * 9).toFixed(2) + "px, " + (-Math.sin(progress * Math.PI) * 12).toFixed(2) + "px) scaleX(" + (flip * scale).toFixed(3) + ")",
    };
  }
  if (elapsed < 7200) return { phase: "hug", pose: 3, transform: "" };
  return { phase: "ready", pose: 0, transform: "" };
}

const fields = Object.fromEntries(["days", "hours", "minutes", "seconds"].map(name => [name, document.getElementById(name)]));
const scene = document.getElementById("scene");
const couple = document.getElementById("couple");
const replayButton = document.getElementById("replay");
const motionButton = document.getElementById("motion-toggle");
const status = document.getElementById("scene-status");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let countdownTimeout;
let animationId;
let previousFrame = null;
let elapsed = 0;
let intro = true;
let userPaused = false;
let ready = false;
let lastPhase = "";
let introRecorded = false;

function hasSeenIntro() {
  try { return localStorage.getItem(INTRO_KEY) === "seen"; }
  catch { return false; }
}

function markIntroSeen() {
  if (introRecorded) return;
  introRecorded = true;
  try { localStorage.setItem(INTRO_KEY, "seen"); }
  catch { /* Der Countdown funktioniert auch ohne freigegebenen Browserspeicher. */ }
}

function updateCountdown() {
  clearTimeout(countdownTimeout);
  const now = Date.now();
  const remaining = getRemainingTime(now);
  for (const [name, element] of Object.entries(fields)) {
    const value = String(remaining[name]).padStart(2, "0");
    if (element.textContent !== value) element.textContent = value;
  }
  scene.style.setProperty("--balloon-scale", getBalloonScale(now).toFixed(6));
  document.getElementById("completion").hidden = !remaining.finished;
  document.getElementById("countdown-note").hidden = remaining.finished;
  if (document.visibilityState !== "hidden") {
    countdownTimeout = setTimeout(updateCountdown, 1000 - (Date.now() % 1000) + 10);
  }
}

function setFrame(frame) {
  couple.dataset.pose = String(frame.pose);
  couple.style.transform = frame.transform;
  scene.dataset.phase = frame.phase;
  if (frame.phase !== lastPhase) {
    lastPhase = frame.phase;
    if (frame.phase === "kiss") status.textContent = "Z gibt T einen Kuss.";
    if (frame.phase === "hug") status.textContent = "T nimmt Z in die Arme.";
    if (frame.phase === "turn") status.textContent = "Die beiden drehen sich einmal zusammen im Kreis.";
    if (frame.phase === "pumping") {
      status.textContent = "Jetzt pumpen T und Z gemeinsam ihren Ballon auf.";
      couple.setAttribute("aria-label", "Das blaue T-Bärchen und das rosa Z-Bärchen pumpen gemeinsam einen pastellfarbenen Ballon auf.");
    }
  }
}

function canAnimate() {
  return ready && !userPaused && !reducedMotion.matches && document.visibilityState !== "hidden";
}

function tick(timestamp) {
  animationId = undefined;
  if (!canAnimate()) { previousFrame = null; return; }
  if (previousFrame !== null) elapsed += Math.min(100, Math.max(0, timestamp - previousFrame));
  previousFrame = timestamp;
  setFrame(getSceneFrame(elapsed, intro));
  if (intro && elapsed >= INTRO_DURATION) markIntroSeen();
  animationId = requestAnimationFrame(tick);
}

function synchronizeMotion() {
  if (animationId !== undefined) cancelAnimationFrame(animationId);
  animationId = undefined;
  previousFrame = null;
  const reduced = reducedMotion.matches;
  document.body.classList.toggle("reduced-motion", reduced);
  document.body.classList.toggle("motion-paused", userPaused || document.visibilityState === "hidden");
  replayButton.disabled = !ready || reduced;
  motionButton.disabled = !ready || reduced;
  motionButton.setAttribute("aria-pressed", String(userPaused));
  motionButton.textContent = reduced ? "Bewegung reduziert" : userPaused ? "Animation fortsetzen" : "Animation pausieren";
  if (reduced) {
    setFrame({ phase: "still", pose: 6, transform: "" });
    status.textContent = "T und Z stehen gemeinsam an ihrer Pumpe. Die Bewegung ist entsprechend deiner Geräteeinstellung reduziert.";
  } else if (canAnimate()) animationId = requestAnimationFrame(tick);
}

replayButton.addEventListener("click", () => {
  if (!ready || reducedMotion.matches) return;
  intro = true;
  elapsed = 0;
  userPaused = false;
  lastPhase = "";
  couple.setAttribute("aria-label", "Die kleine Geschichte von T und Z: ein Kuss, eine Umarmung und eine gemeinsame Drehung.");
  setFrame(getSceneFrame(0));
  synchronizeMotion();
});
motionButton.addEventListener("click", () => {
  userPaused = !userPaused;
  synchronizeMotion();
});
document.addEventListener("visibilitychange", () => {
  updateCountdown();
  synchronizeMotion();
});
window.addEventListener("pageshow", () => {
  updateCountdown();
  synchronizeMotion();
});
reducedMotion.addEventListener("change", synchronizeMotion);

function loadSceneImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = reject;
    image.src = source;
  });
}

replayButton.disabled = true;
motionButton.disabled = true;
updateCountdown();
Promise.all([
  loadSceneImage("./assets/teddy-poses.png"),
  loadSceneImage("./assets/balloon.png"),
  loadSceneImage("./assets/pump-hose.png"),
]).then(() => {
  ready = true;
  intro = !hasSeenIntro();
  introRecorded = !intro;
  setFrame(getSceneFrame(0, intro));
  synchronizeMotion();
}).catch(() => {
  status.textContent = "Die Zeichnungen konnten nicht geladen werden. Bitte lade die Seite noch einmal.";
});
