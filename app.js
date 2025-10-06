const canvas = document.getElementById("arenaCanvas");
const ctx = canvas.getContext("2d");
const rocket = document.getElementById("rocket");
const startBtn = document.getElementById("startRound");
const cashOutBtn = document.getElementById("cashOut");
const roundIdEl = document.getElementById("roundId");
const multiplierEl = document.getElementById("currentMultiplier");
const secondaryMultiplierEl = document.getElementById("secondaryMultiplier");
const eventFeed = document.getElementById("eventFeed");
const betInput = document.getElementById("betAmount");
const walletBalanceEl = document.getElementById("walletBalance");
const mainBetEl = document.getElementById("mainBet");
const returnedEl = document.getElementById("returned");
const payoutEl = document.getElementById("payout");
const liabilityEl = document.getElementById("liability");
const maxRoundEl = document.getElementById("maxRound");
const microTotalEl = document.getElementById("microTotal");

const addButtons = document.querySelectorAll("[data-add]");
const fillButtons = document.querySelectorAll("[data-fill]");

let wallet = 741.77;
let round = 0;
let animationFrame;
let startedAt = 0;
let activeRound = null;
let cashedOut = false;
let canvasWidth = 0;
let canvasHeight = 0;

const MICRO_BETS_TOTAL = 20;
microTotalEl.textContent = `$${MICRO_BETS_TOTAL.toFixed(2)}`;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvasWidth = rect.width;
  canvasHeight = rect.height;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function randomCrashMultiplier() {
  const roll = Math.pow(Math.random(), 2.6);
  const crash = 1.25 + roll * 10;
  return parseFloat(crash.toFixed(2));
}

function createCurve(color) {
  const crashMultiplier = randomCrashMultiplier();
  const growth = 0.42;
  const crashTime = Math.log(crashMultiplier) / growth;
  return {
    color,
    crashMultiplier,
    growth,
    crashTime,
    crashed: false,
    points: []
  };
}

function pushEvent(title, description, tone = "neutral") {
  const event = document.createElement("div");
  event.className = "event";
  if (tone === "positive") event.style.borderColor = "rgba(108, 247, 197, 0.35)";
  if (tone === "danger") event.style.borderColor = "rgba(255, 122, 147, 0.4)";
  event.innerHTML = `<strong>${title}</strong><span>${description}</span>`;
  eventFeed.prepend(event);
  const limit = 12;
  while (eventFeed.children.length > limit) {
    eventFeed.lastElementChild.remove();
  }
}

function updateWalletDisplay() {
  walletBalanceEl.textContent = `$${wallet.toFixed(2)}`;
}

function formatMultiplier(value) {
  return `x${value.toFixed(2)}`;
}

function resetRoundStats() {
  returnedEl.textContent = "$0.00";
  payoutEl.textContent = "$0.00";
  liabilityEl.textContent = "$0.00";
  mainBetEl.textContent = "$0.00";
  multiplierEl.textContent = "x1.00";
  secondaryMultiplierEl.textContent = "x1.00";
}

function startRound() {
  if (activeRound) return;

  const wager = Math.max(1, Number(betInput.value) || 0);
  if (wager > wallet) {
    pushEvent("Balance warning", "Недостаточно средств для ставки.", "danger");
    return;
  }

  wallet -= wager;
  updateWalletDisplay();

  round += 1;
  cashedOut = false;
  startedAt = performance.now();

  const primary = createCurve("#6f7dff");
  const secondary = createCurve("#6cf7c5");
  const curves = [primary, secondary];

  activeRound = {
    wager,
    curves
  };

  resetRoundStats();
  maxRoundEl.textContent = formatMultiplier(Math.max(primary.crashMultiplier, secondary.crashMultiplier));
  mainBetEl.textContent = `$${wager.toFixed(2)}`;
  liabilityEl.textContent = `$${(wager + MICRO_BETS_TOTAL).toFixed(2)}`;
  roundIdEl.textContent = `#${String(round).padStart(4, "0")}`;
  pushEvent(
    "Новый раунд",
    `Раунд ${roundIdEl.textContent} начат. Целевые множители: ${formatMultiplier(primary.crashMultiplier)} и ${formatMultiplier(secondary.crashMultiplier)}.`
  );

  startBtn.disabled = true;
  cashOutBtn.disabled = false;
  animate();
}

function endRound() {
  if (!activeRound) return;

  cashOutBtn.disabled = true;
  startBtn.disabled = false;
  cancelAnimationFrame(animationFrame);

  if (!cashedOut) {
    pushEvent("Краш!", "Ракета не была выведена вовремя.", "danger");
  }
  activeRound = null;
}

function animate() {
  if (!activeRound) return;

  const now = performance.now();
  const elapsed = (now - startedAt) / 1000;
  const curves = activeRound.curves;

  const maxCrash = Math.max(...curves.map((curve) => curve.crashMultiplier), 4);
  const maxTime = Math.max(...curves.map((curve) => curve.crashTime)) * 1.08;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawGrid(maxCrash, maxTime);

  curves.forEach((curve, index) => {
    const effectiveElapsed = Math.min(elapsed, curve.crashTime);
    const multiplier = Math.min(Math.exp(curve.growth * effectiveElapsed), curve.crashMultiplier);

    const lastPoint = curve.points[curve.points.length - 1];
    if (!lastPoint || lastPoint.time !== effectiveElapsed) {
      curve.points.push({ time: effectiveElapsed, multiplier });
    }

    if (!curve.crashed && elapsed >= curve.crashTime) {
      curve.crashed = true;
      pushEvent(
        "Линия крашнулась",
        `${index === 0 ? "Основная" : "Вторая"} линия остановилась на ${formatMultiplier(curve.crashMultiplier)}.`,
        "danger"
      );
    }

    drawCurve(curve, maxCrash, maxTime);
  });

  const primary = curves[0];
  const secondary = curves[1];

  const primaryElapsed = Math.min(elapsed, primary.crashTime);
  const secondaryElapsed = Math.min(elapsed, secondary.crashTime);
  const currentMultiplier = Math.min(Math.exp(primary.growth * primaryElapsed), primary.crashMultiplier);
  const secondMultiplier = Math.min(Math.exp(secondary.growth * secondaryElapsed), secondary.crashMultiplier);

  multiplierEl.textContent = formatMultiplier(currentMultiplier);
  secondaryMultiplierEl.textContent = formatMultiplier(secondMultiplier);

  positionRocket(primary, currentMultiplier, primaryElapsed, maxCrash, maxTime);

  const allCrashed = curves.every((curve) => curve.crashed && elapsed >= curve.crashTime);

  if (allCrashed) {
    endRound();
    return;
  }

  animationFrame = requestAnimationFrame(animate);
}

function drawGrid(maxMultiplier, maxTime) {
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;

  const horizontalSteps = 5;
  for (let i = 1; i <= horizontalSteps; i += 1) {
    const y = (canvasHeight / horizontalSteps) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }

  const verticalSteps = 6;
  for (let i = 1; i <= verticalSteps; i += 1) {
    const x = (canvasWidth / verticalSteps) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCurve(curve, maxMultiplier, maxTime) {
  if (curve.points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = curve.color;
  ctx.lineWidth = 3;
  ctx.beginPath();

  curve.points.forEach((point, index) => {
    const x = mapX(point.time, maxTime);
    const y = mapY(point.multiplier, maxMultiplier);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  if (curve.crashed) {
    const last = curve.points[curve.points.length - 1];
    const x = mapX(last.time, maxTime);
    const y = mapY(last.multiplier, maxMultiplier);
    drawCrashMarker(x, y, curve.color);
  }

  ctx.restore();
}

function drawCrashMarker(x, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function mapX(time, maxTime) {
  return (time / maxTime) * canvasWidth;
}

function mapY(multiplier, maxMultiplier) {
  const clamped = Math.min(multiplier, maxMultiplier);
  const range = Math.max(maxMultiplier - 1, 1);
  const normalized = (clamped - 1) / range;
  const padding = 30;
  return canvasHeight - padding - normalized * (canvasHeight - padding * 2);
}

function positionRocket(curve, multiplier, elapsed, maxMultiplier, maxTime) {
  const x = mapX(elapsed, maxTime) - 12;
  const y = mapY(multiplier, maxMultiplier) - 12;
  rocket.style.transform = `translate(${x}px, ${y}px)`;
}

function handleCashOut() {
  if (!activeRound || cashedOut) return;
  const primary = activeRound.curves[0];
  const elapsed = Math.min((performance.now() - startedAt) / 1000, primary.crashTime);
  const currentMultiplier = Math.min(Math.exp(primary.growth * elapsed), primary.crashMultiplier);
  cashedOut = true;

  const winnings = activeRound.wager * currentMultiplier;
  wallet += winnings;
  payoutEl.textContent = `$${winnings.toFixed(2)}`;
  returnedEl.textContent = `$${activeRound.wager.toFixed(2)}`;
  updateWalletDisplay();

  pushEvent(
    "Успешный вывод",
    `Вы вывели по множителю ${formatMultiplier(currentMultiplier)} и получили $${winnings.toFixed(2)}.`,
    "positive"
  );
  cashOutBtn.disabled = true;
}

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const delta = Number(button.dataset.add);
    wallet += delta;
    updateWalletDisplay();
    pushEvent("Пополнение", `Баланс увеличен на $${delta.toFixed(2)}.`);
  });
});

fillButtons.forEach((button) => {
  button.addEventListener("click", () => {
    betInput.value = Number(button.dataset.fill);
  });
});

startBtn.addEventListener("click", startRound);
cashOutBtn.addEventListener("click", handleCashOut);

window.addEventListener("resize", () => {
  resizeCanvas();
  if (activeRound) {
    drawGrid(
      Math.max(...activeRound.curves.map((c) => c.crashMultiplier), 4),
      Math.max(...activeRound.curves.map((c) => c.crashTime)) * 1.08
    );
  }
});

resetRoundStats();
updateWalletDisplay();
resizeCanvas();
