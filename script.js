// ======================= ZODIAC DATA =======================
const zodiacData = [
  { name: "Aries", icon: "🐏", symbol: "♈", position: 1 },
  { name: "Taurus", icon: "🐂", symbol: "♉", position: 2 },
  { name: "Gemini", icon: "👯", symbol: "♊", position: 3 },
  { name: "Cancer", icon: "🦀", symbol: "♋", position: 4 },
  { name: "Leo", icon: "🦁", symbol: "♌", position: 5 },
  { name: "Virgo", icon: "🌾", symbol: "♍", position: 6 },
  { name: "Libra", icon: "⚖️", symbol: "♎", position: 7 },
  { name: "Scorpio", icon: "🦂", symbol: "♏", position: 8 },
  { name: "Sagittarius", icon: "🏹", symbol: "♐", position: 9 },
  { name: "Capricorn", icon: "🐐", symbol: "♑", position: 10 },
  { name: "Aquarius", icon: "💧", symbol: "♒", position: 11 },
  { name: "Pisces", icon: "🐟", symbol: "♓", position: 12 },
];

let selectedZodiac = "Leo";
let siblings = [];
let currentSecretCode = "";
let currentQuestionType = "";
let currentUserName = "";
let scratchRevealed = false;
let cipherAttempts = 0;
let hintRevealed   = false;

// ======================= GOOGLE SHEETS (CORS FIX) =======================
const SHEET_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbz_iw2pkEfe8n2qDw5kMWgC4wY_Q7xGeBkO7dmRjC4In7sbY9uSBdz0uxGCwRs05wBqGA/exec";

// ── Send Stage 1 data (Name, DOB, Gender, Zodiac) to Google Sheet ──
// Uses GET + no-cors image trick — most reliable way to bypass Apps Script CORS redirect
function sendStage1ToGoogleSheet() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName  = document.getElementById("lastName").value.trim();
  const dob       = document.getElementById("dob").value;
  const gender    = document.getElementById("gender").value;

  const params = new URLSearchParams({
    fullName: lastName ? `${firstName} ${lastName}` : firstName,
    dob:      dob,
    gender:   gender,
    zodiac:   selectedZodiac,
  });

  // GET request via a hidden image tag avoids CORS preflight entirely.
  // Apps Script doGet(e) reads e.parameter.fullName etc.
  const url = `${SHEET_WEBHOOK_URL}?${params.toString()}`;
  const img = new Image();
  img.src = url;
  img.onload  = () => console.log("✅ Data sent to sheet (GET)");
  img.onerror = () => console.log("✅ Data sent to sheet (GET — response not image, but that is fine)");
}

// ── (kept for backward compat — called at final verify step) ──
function sendToGoogleSheet() {
  // Data already sent at Stage 1 → nothing to do here.
  console.log("ℹ️ Data was already sent at Stage 1.");
}

// ======================= INITIALIZATION =======================
document.addEventListener("DOMContentLoaded", () => {
  buildZodiacGrid();
  // NOTE: loadDefaultValues() removed — placeholders are now generic
  setupEventListeners();
  setupStageNavigation();
  setupSiblingManagement();
  generateRandomSecretQuestion();
});

function buildZodiacGrid() {
  const grid = document.getElementById("zodiacGrid");
  if (!grid) return;
  grid.innerHTML = "";
  zodiacData.forEach((zodiac) => {
    const option = document.createElement("div");
    option.className = "zodiac-option";
    if (zodiac.name === selectedZodiac) option.classList.add("active");
    option.innerHTML = `
            <span class="z-icon">${zodiac.icon}</span>
            <span class="z-name">${zodiac.name}</span>
            <span class="z-sym">${zodiac.symbol}</span>`;
    option.onclick = () => {
      document
        .querySelectorAll(".zodiac-option")
        .forEach((o) => o.classList.remove("active"));
      option.classList.add("active");
      selectedZodiac = zodiac.name;
      document.getElementById("selectedZodiac").value = zodiac.name;
      generateRandomSecretQuestion();
    };
    grid.appendChild(option);
  });
}

// ======================= STAGE NAVIGATION =======================
function setupEventListeners() {
  document
    .getElementById("firstName")
    ?.addEventListener("input", generateRandomSecretQuestion);
  document
    .getElementById("lastName")
    ?.addEventListener("input", generateRandomSecretQuestion);
  document
    .getElementById("dob")
    ?.addEventListener("change", generateRandomSecretQuestion);
  document
    .getElementById("fatherName")
    ?.addEventListener("input", generateRandomSecretQuestion);
  document
    .getElementById("motherName")
    ?.addEventListener("input", generateRandomSecretQuestion);
  document
    .getElementById("verifySecretBtn")
    ?.addEventListener("click", verifySecretAndProceed);
  document
    .getElementById("unlockScratchBtn")
    ?.addEventListener("click", unlockScratchWithCode);
  document
    .getElementById("shareBtn")
    ?.addEventListener("click", shareFoolMessage);
  document
    .getElementById("closeModalBtn")
    ?.addEventListener("click", closeScratchModal);
}

function setupStageNavigation() {
  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const currentStage = btn.closest(".stage-card");
      if (validateCurrentStage(currentStage)) {
        // ── Send to Google Sheet when leaving Stage 1 ──
        if (currentStage && currentStage.id === "stage1") {
          sendStage1ToGoogleSheet();
        }
        showStage(btn.getAttribute("data-next"));
      }
    });
  });
  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", () =>
      showStage(btn.getAttribute("data-back")),
    );
  });
}

function validateCurrentStage(stage) {
  if (!stage) return true;
  if (stage.id === "stage1") {
    if (!document.getElementById("firstName").value.trim()) {
      showNotification("Please enter your first name");
      return false;
    }
    if (!document.getElementById("dob").value) {
      showNotification("Please select your date of birth");
      return false;
    }
    if (!selectedZodiac) {
      showNotification("Please select your zodiac sign");
      return false;
    }
  }
  if (stage.id === "stage2") {
    if (
      !document.getElementById("fatherName").value.trim() ||
      !document.getElementById("motherName").value.trim()
    ) {
      showNotification("Please enter both parents' names");
      return false;
    }
  }
  return true;
}

function showStage(stageId) {
  document
    .querySelectorAll(".stage-card")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(stageId).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (stageId === "stage3") generateRandomSecretQuestion();
}

function showNotification(message) {
  document.querySelectorAll(".popup-notification").forEach((n) => n.remove());
  const n = document.createElement("div");
  n.className = "popup-notification";
  n.textContent = message;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

// ======================= SIBLINGS =======================
function setupSiblingManagement() {
  document
    .getElementById("addSiblingBtn")
    ?.addEventListener("click", addSibling);
  renderSiblings();
}

function addSibling() {
  const type = prompt(
    "Sibling type:\n1 — Younger Brother\n2 — Elder Brother\n3 — Younger Sister\n4 — Elder Sister",
    "1",
  );
  const name = prompt("Sibling's name:");
  if (!name) return;
  const types = [
    "Younger Brother",
    "Elder Brother",
    "Younger Sister",
    "Elder Sister",
  ];
  const siblingType = types[parseInt(type) - 1] || type || "Sibling";
  siblings.push({ name: name.trim(), type: siblingType });
  renderSiblings();
}

function renderSiblings() {
  const container = document.getElementById("siblingsList");
  if (!container) return;
  container.innerHTML = "";
  siblings.forEach((sib, idx) => {
    const div = document.createElement("div");
    div.className = "sibling-card";
    div.innerHTML = `
            <div class="sibling-info">◈ ${escapeHtml(sib.name)} · ${escapeHtml(sib.type)}</div>
            <div class="sibling-buttons">
                <button class="edit-sibling"   data-idx="${idx}">Edit</button>
                <button class="remove-sibling" data-idx="${idx}">Remove</button>
            </div>`;
    container.appendChild(div);
  });
  container.querySelectorAll(".edit-sibling").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx);
      const n = prompt("Edit name:", siblings[idx].name);
      if (n) siblings[idx].name = n.trim();
      const t = prompt("Edit type:", siblings[idx].type);
      if (t) siblings[idx].type = t.trim();
      renderSiblings();
      generateRandomSecretQuestion();
    });
  });
  container.querySelectorAll(".remove-sibling").forEach((btn) => {
    btn.addEventListener("click", () => {
      siblings.splice(parseInt(btn.dataset.idx), 1);
      renderSiblings();
      generateRandomSecretQuestion();
    });
  });
}

// ======================= SECRET QUESTION =======================
function generateRandomSecretQuestion() {
  const types = ["a", "b", "c"];
  currentQuestionType = types[Math.floor(Math.random() * 3)];

  const firstName = (document.getElementById("firstName")?.value || "")
    .trim()
    .toLowerCase();
  const fatherName = (document.getElementById("fatherName")?.value || "")
    .trim()
    .toLowerCase();
  const motherName = (document.getElementById("motherName")?.value || "")
    .trim()
    .toLowerCase();
  const dobVal = document.getElementById("dob")?.value || "1990-01-01";
  const dob = new Date(dobVal);
  const birthDate = dob.getDate();
  const birthMonth = dob.getMonth() + 1;
  const birthYear = dob.getFullYear();
  const zodiacPos =
    zodiacData.find((z) => z.name === selectedZodiac)?.position || 5;

  let questionText, generatedCode;

  if (currentQuestionType === "a") {
    const firstTwo = firstName.substring(0, 2);
    const fatherCount = fatherName.replace(/\s/g, "").length;
    generatedCode = `${firstTwo}${birthDate}${fatherCount}`;
    questionText = `🔐 <b>Cipher A</b> — first 2 name letters <em>(${firstTwo})</em> + birth date <em>(${birthDate})</em> + father's name letter count <em>(${fatherCount})</em>`;
    questionText += `<br><small>e.g. "jo2014" → jo + 20 + 14</small>`;
  } else if (currentQuestionType === "b") {
    const firstTwo = firstName.substring(0, 2);
    generatedCode = `${birthYear}${zodiacPos}${firstTwo}`;
    questionText = `🔐 <b>Cipher B</b> — birth year <em>(${birthYear})</em> + zodiac position <em>(${zodiacPos})</em> + first 2 name letters <em>(${firstTwo})</em>`;
    questionText += `<br><small>e.g. "199553jo"</small>`;
  } else {
    const lastTwo = firstName.length >= 2 ? firstName.slice(-2) : firstName;
    const motherLetters =
      motherName.length >= 3
        ? motherName.substring(1, 3)
        : motherName.substring(0, 2);
    generatedCode = `${lastTwo}${birthMonth}${motherLetters}`;
    questionText = `🔐 <b>Cipher C</b> — last 2 name letters <em>(${lastTwo})</em> + birth month <em>(${birthMonth})</em> + mother's 2nd & 3rd letter <em>(${motherLetters})</em>`;
    questionText += `<br><small>e.g. "hn6li"</small>`;
  }

  currentSecretCode = generatedCode.toLowerCase();

  // Reset attempt state whenever a new question is generated
  cipherAttempts = 0;
  hintRevealed   = false;

  const qtEl = document.getElementById("questionText");
  const cdEl = document.getElementById("generatedCodeDisplay");
  if (qtEl) qtEl.innerHTML = questionText;

  // Code is hidden by default — user must solve the cipher themselves
  if (cdEl) {
    cdEl.innerHTML = `
      <div class="code-hidden-msg">
        🔍 Solve the cipher above and type your answer below.<br>
        <small>If correct, you will get a code to paste into the scratch card.</small>
      </div>
      <div id="hintBtnWrapper" style="display:none; margin-top:10px; text-align:center;">
        <button id="hintBtn" class="hint-btn">💡 Show Hint</button>
      </div>
      <div id="hintRevealArea" style="display:none; margin-top:10px;"></div>`;
    document.getElementById("hintBtn")?.addEventListener("click", revealHint);
  }
}

function revealHint() {
  hintRevealed = true;
  const hintArea = document.getElementById("hintRevealArea");
  const hintBtn  = document.getElementById("hintBtn");
  if (hintBtn) hintBtn.style.display = "none";
  if (hintArea) {
    hintArea.style.display = "block";
    hintArea.innerHTML = `🔑 Your Code: <strong style="letter-spacing:0.12em; color:var(--gold-light);">${currentSecretCode}</strong>
      <br><small style="color:var(--smoke-dim);">Copy this and paste it into the scratch card input to unlock your fate.</small>`;
  }
}

// ======================= VERIFY =======================
function verifySecretAndProceed() {
  const answer = document
    .getElementById("secretAnswer")
    .value.trim()
    .toLowerCase();

  if (answer === currentSecretCode) {
    currentUserName = document.getElementById("firstName").value.trim();
    // Show code prominently so user can copy it into the scratch card
    const cdEl = document.getElementById("generatedCodeDisplay");
    if (cdEl) {
      cdEl.innerHTML = `
        <div style="text-align:center; padding:4px 0;">
          ✅ Correct! Copy &amp; paste this code to unlock the scratch card:<br>
          <strong id="copyableCode" style="font-size:1.1rem; letter-spacing:0.15em;
            color:var(--gold-light); cursor:pointer;" title="Tap to copy">${currentSecretCode}</strong>
          <br><small style="color:var(--smoke-dim);">(tap the code to copy it)</small>
        </div>`;
      document.getElementById("copyableCode")?.addEventListener("click", () => {
        navigator.clipboard.writeText(currentSecretCode)
          .then(() => showNotification("✦ Code copied! Paste it in the scratch card to reveal your fate."))
          .catch(() => showNotification("Your code: " + currentSecretCode));
      });
    }
    showNotification("✦ Cipher solved! Copy your code and paste it in the scratch card.");
    setTimeout(() => showScratchModal(), 1400);
  } else {
    cipherAttempts++;
    if (cipherAttempts >= 2) {
      const hintWrapper = document.getElementById("hintBtnWrapper");
      if (hintWrapper && hintWrapper.style.display === "none") {
        hintWrapper.style.display = "block";
      }
      showNotification('✗ Wrong again — tap "Show Hint" below to reveal your code.');
    } else {
      const left = 2 - cipherAttempts;
      showNotification(`✗ Incorrect. ${left} attempt${left !== 1 ? "s" : ""} left before a hint appears.`);
    }
  }
}

// ======================= SCRATCH MODAL =======================
function showScratchModal() {
  document.getElementById("scratchModal").classList.add("active");
  document.getElementById("scratchCodeInput").value = "";
  document.getElementById("scratchCodeInput").disabled = false;
  document.getElementById("scratchWrapper").style.display = "none";
  document.getElementById("shareSection").style.display = "none";
  const btn = document.getElementById("unlockScratchBtn");
  btn.disabled = false;
  btn.style.opacity = "1";
  scratchRevealed = false;
  resetRewardContent();
}

function unlockScratchWithCode() {
  const entered = document
    .getElementById("scratchCodeInput")
    .value.trim()
    .toLowerCase();
  if (entered === currentSecretCode) {
    document.getElementById("scratchWrapper").style.display = "block";
    const btn = document.getElementById("unlockScratchBtn");
    btn.disabled = true;
    btn.style.opacity = "0.4";
    document.getElementById("scratchCodeInput").disabled = true;
    requestAnimationFrame(() => initScratchCard());
    showNotification("✦ Unsealed. Scratch to reveal your fate…");
  } else {
    showNotification(`✗ Wrong code. Expected: ${currentSecretCode}`);
  }
}

// ======================= SCRATCH CARD =======================
function initScratchCard() {
  const wrapper = document.getElementById("scratchWrapper");
  if (!wrapper) return;
  window.foolRevealed = false;

  const oldCanvas = document.getElementById("scratchCanvas");
  const newCanvas = document.createElement("canvas");
  newCanvas.id = "scratchCanvas";
  oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);

  const W = wrapper.clientWidth;
  const H = Math.round(W * 0.58);
  newCanvas.width = W;
  newCanvas.height = H;

  const rc = document.getElementById("rewardContent");
  if (rc) rc.style.height = H + "px";

  const ctx = newCanvas.getContext("2d");

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#b0b6c2");
  g.addColorStop(0.4, "#d4dae6");
  g.addColorStop(0.75, "#c0c6d2");
  g.addColorStop(1, "#888e9a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 160; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * W, Math.random() * H);
    ctx.lineTo(Math.random() * W, Math.random() * H);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#445";
  ctx.font = `bold ${Math.round(W * 0.036)}px 'Courier New', monospace`;
  ctx.textAlign = "center";
  ctx.fillText("✦  S C R A T C H  H E R E  ✦", W / 2, H / 2);
  ctx.globalAlpha = 1;

  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = 34;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  let drawing = false, lx = 0, ly = 0;

  function xy(e) {
    const r = newCanvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (cx - r.left) * (W / r.width),
      y: (cy - r.top) * (H / r.height),
    };
  }

  function start(e) { e.preventDefault(); drawing = true; const p = xy(e); lx = p.x; ly = p.y; }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = xy(e);
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lx = p.x; ly = p.y;
    checkReveal();
  }
  function stop() { drawing = false; }

  function checkReveal() {
    if (window.foolRevealed) return;
    const d = ctx.getImageData(0, 0, W, H).data;
    let cleared = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 50) cleared++;
    if ((cleared / (W * H)) * 100 > 42)
      revealFoolSurprise(newCanvas, ctx, W, H);
  }

  newCanvas.addEventListener("mousedown", start);
  newCanvas.addEventListener("mousemove", move);
  newCanvas.addEventListener("mouseup", stop);
  newCanvas.addEventListener("mouseleave", stop);
  newCanvas.addEventListener("touchstart", start, { passive: false });
  newCanvas.addEventListener("touchmove", move, { passive: false });
  newCanvas.addEventListener("touchend", stop);
}

function revealFoolSurprise(canvas, ctx, W, H) {
  if (window.foolRevealed) return;
  window.foolRevealed = true;
  scratchRevealed = true;

  ctx.clearRect(0, 0, W, H);
  canvas.style.pointerEvents = "none";
  canvas.style.opacity = "0";

  const inner = document.getElementById("rewardInner");
  if (inner) {
    inner.innerHTML = `
            <div class="reward-icon" style="font-size: clamp(1.8rem, 6vw, 2.4rem);">🎉 🤡 🎉</div>
            <div class="fool-message">
                <strong>Ha! ${escapeHtml(currentUserName)}, you've been FOOLED!</strong><br>
                No oracle exists — Happy April Fools' Day! 😂
            </div>
            <div style="font-size: clamp(1.3rem, 4vw, 1.7rem); margin-top: 4px;">😜 🎭 😂</div>`;
  }

  setTimeout(showFoolPopup, 1800);
}

function showFoolPopup() {
  showNotification("🎭 Share this to fool your friends!");
  setTimeout(() => {
    document.getElementById("shareSection").style.display = "flex";
  }, 900);
}

// ======================= SHARE =======================
function shareFoolMessage() {
  const url = window.location.href;
  const text = `🔮 This app REALLY predicts your future… or does it? Try it → ${url}`;
  if (navigator.share) {
    navigator
      .share({ title: "The Oracle 🔮", text, url })
      .catch(() => copyToClipboard(text));
  } else {
    copyToClipboard(text);
  }
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() =>
      showNotification("✦ Copied! Send it to your unsuspecting friends."),
    )
    .catch(() => alert("Share manually:\n" + text));
}

// ======================= CLOSE MODAL =======================
function closeScratchModal() {
  document.getElementById("scratchModal").classList.remove("active");
  window.foolRevealed = false;
  scratchRevealed = false;
  document.getElementById("scratchWrapper").style.display = "none";
  document.getElementById("shareSection").style.display = "none";
  document.getElementById("scratchCodeInput").disabled = false;
  document.getElementById("scratchCodeInput").value = "";
  const btn = document.getElementById("unlockScratchBtn");
  btn.disabled = false;
  btn.style.opacity = "1";
  resetRewardContent();
}

function resetRewardContent() {
  const inner = document.getElementById("rewardInner");
  if (inner) {
    inner.innerHTML = `
            <div class="reward-icon">🔮</div>
            <div class="reward-title">SCRATCH TO REVEAL</div>
            <div class="scratch-instruction">Run your finger across the surface</div>`;
  }
  const rc = document.getElementById("rewardContent");
  if (rc) rc.style.height = "";
  const cv = document.getElementById("scratchCanvas");
  if (cv) {
    cv.style.opacity = "1";
    cv.style.pointerEvents = "auto";
  }
}

// ======================= UTILITY =======================
function escapeHtml(s) {
  if (!s) return "";
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}