// ======================= ZODIAC DATA WITH CUSTOM ICONS =======================
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
let isDrawing = false;
let lastX = 0,
  lastY = 0;
let currentUserName = "";
let scratchRevealed = false;

// ======================= INITIALIZATION =======================
document.addEventListener("DOMContentLoaded", () => {
  buildZodiacGrid();
  loadDefaultValues();
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
    option.innerHTML = `${zodiac.icon} ${zodiac.name} ${zodiac.symbol}`;
    option.onclick = () => {
      document
        .querySelectorAll(".zodiac-option")
        .forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      selectedZodiac = zodiac.name;
      document.getElementById("selectedZodiac").value = zodiac.name;
      generateRandomSecretQuestion();
    };
    grid.appendChild(option);
  });
}

function loadDefaultValues() {
  document.getElementById("dob").value = "1995-05-20";
  document.getElementById("firstName").value = "John";
  document.getElementById("lastName").value = "Carter";
  document.getElementById("fatherName").value = "Michael Carter";
  document.getElementById("motherName").value = "Susan Carter";
  document.getElementById("familyCount").value = "4";
  document.getElementById("selectedZodiac").value = "Leo";
}

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

// ======================= STAGE NAVIGATION =======================
function setupStageNavigation() {
  const nextBtns = document.querySelectorAll("[data-next]");
  const backBtns = document.querySelectorAll("[data-back]");

  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextStage = btn.getAttribute("data-next");
      if (validateCurrentStage(btn.closest(".stage-card"))) {
        showStage(nextStage);
      }
    });
  });

  backBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const prevStage = btn.getAttribute("data-back");
      showStage(prevStage);
    });
  });
}

function validateCurrentStage(stage) {
  const stageId = stage.id;

  if (stageId === "stage1") {
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const dob = document.getElementById("dob").value;

    if (!firstName || !lastName) {
      showNotification("Please enter your full name");
      return false;
    }
    if (!dob) {
      showNotification("Please select your date of birth");
      return false;
    }
    if (!selectedZodiac) {
      showNotification("Please select your zodiac sign");
      return false;
    }
  }

  if (stageId === "stage2") {
    const father = document.getElementById("fatherName").value.trim();
    const mother = document.getElementById("motherName").value.trim();

    if (!father || !mother) {
      showNotification("Please enter both parents names");
      return false;
    }
  }

  return true;
}

function showStage(stageId) {
  document.querySelectorAll(".stage-card").forEach((stage) => {
    stage.classList.remove("active");
  });
  document.getElementById(stageId).classList.add("active");

  if (stageId === "stage3") {
    generateRandomSecretQuestion();
  }
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "popup-notification";
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2500);
}

// ======================= SIBLINGS MANAGEMENT =======================
function setupSiblingManagement() {
  document
    .getElementById("addSiblingBtn")
    ?.addEventListener("click", addSibling);
  renderSiblings();
}

function addSibling() {
  const type = prompt(
    "Select sibling type:\n1. Younger Brother\n2. Elder Brother\n3. Younger Sister\n4. Elder Sister",
    "Younger Brother",
  );
  const name = prompt("Enter sibling name:");
  if (!name) return;

  let siblingType = "";
  if (type === "1" || type === "Younger Brother")
    siblingType = "Younger Brother";
  else if (type === "2" || type === "Elder Brother")
    siblingType = "Elder Brother";
  else if (type === "3" || type === "Younger Sister")
    siblingType = "Younger Sister";
  else if (type === "4" || type === "Elder Sister")
    siblingType = "Elder Sister";
  else siblingType = type || "Sibling";

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
            <div class="sibling-info">👤 ${escapeHtml(sib.name)} (${escapeHtml(sib.type)})</div>
            <div class="sibling-buttons">
                <button class="edit-sibling" data-idx="${idx}">✏️ Edit</button>
                <button class="remove-sibling" data-idx="${idx}">🗑️ Remove</button>
            </div>
        `;
    container.appendChild(div);
  });

  document.querySelectorAll(".edit-sibling").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"));
      const newName = prompt("Edit name:", siblings[idx].name);
      if (newName) siblings[idx].name = newName.trim();
      const newType = prompt("Edit type:", siblings[idx].type);
      if (newType) siblings[idx].type = newType.trim();
      renderSiblings();
      generateRandomSecretQuestion();
    });
  });

  document.querySelectorAll(".remove-sibling").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"));
      siblings.splice(idx, 1);
      renderSiblings();
      generateRandomSecretQuestion();
    });
  });
}

// ======================= SECRET QUESTION GENERATION =======================
function generateRandomSecretQuestion() {
  const questionTypes = ["a", "b", "c"];
  currentQuestionType = questionTypes[Math.floor(Math.random() * 3)];

  let questionText = "";
  let generatedCode = "";

  const firstName = document
    .getElementById("firstName")
    .value.trim()
    .toLowerCase();
  const dob = new Date(document.getElementById("dob").value);
  const birthDate = dob.getDate();
  const birthMonth = dob.getMonth() + 1;
  const birthYear = dob.getFullYear();
  const fatherName = document
    .getElementById("fatherName")
    .value.trim()
    .toLowerCase();
  const motherName = document
    .getElementById("motherName")
    .value.trim()
    .toLowerCase();

  const zodiacPos =
    zodiacData.find((z) => z.name === selectedZodiac)?.position || 5;

  if (currentQuestionType === "a") {
    const firstTwo = firstName.substring(0, 2);
    const fatherCount = fatherName.replace(/\s/g, "").length;
    generatedCode = `${firstTwo}${birthDate}${fatherCount}`;
    questionText = `🔐 Question A: Enter your FIRST 2 letters (${firstTwo}) + Birth Date (${birthDate}) + Father's name letter count (${fatherCount})`;
    questionText += `<br><small style="color:#aaa">Example: "jo157" where jo=first 2 letters, 15=birth date, 7=father letters</small>`;
  } else if (currentQuestionType === "b") {
    const firstTwo = firstName.substring(0, 2);
    generatedCode = `${birthYear}${zodiacPos}${firstTwo}`;
    questionText = `🔐 Question B: Enter your BIRTH YEAR (${birthYear}) + Zodiac Position (${zodiacPos}) + First name first 2 letters (${firstTwo})`;
    questionText += `<br><small style="color:#aaa">Example: "20035jo" where 2003=year, 5=zodiac pos, jo=first letters</small>`;
  } else {
    const lastTwo = firstName.length >= 2 ? firstName.slice(-2) : firstName;
    const motherLetters =
      motherName.length >= 3
        ? motherName.substring(1, 3)
        : motherName.substring(0, 2);
    generatedCode = `${lastTwo}${birthMonth}${motherLetters}`;
    questionText = `🔐 Question C: Enter LAST 2 letters of first name (${lastTwo}) + Birth Month (${birthMonth}) + Mother's 2nd & 3rd letter (${motherLetters})`;
    questionText += `<br><small style="color:#aaa">Example: "hn6li" where hn=last 2, 6=month, li=mother letters</small>`;
  }

  currentSecretCode = generatedCode.toLowerCase();
  document.getElementById("questionText").innerHTML = questionText;
  document.getElementById("generatedCodeDisplay").innerHTML =
    `🔑 Generated Secret Code: <strong>${currentSecretCode}</strong>`;
}

function verifySecretAndProceed() {
  const userAnswer = document
    .getElementById("secretAnswer")
    .value.trim()
    .toLowerCase();

  if (userAnswer === currentSecretCode) {
    currentUserName = document.getElementById("firstName").value.trim();
    showScratchModal();
  } else {
    showNotification(
      `❌ Incorrect secret code! Expected: ${currentSecretCode}`,
    );
  }
}

// ======================= SCRATCH CARD MODAL =======================
function showScratchModal() {
  const modal = document.getElementById("scratchModal");
  modal.classList.add("active");
  document.getElementById("scratchCodeInput").value = "";
  document.getElementById("scratchWrapper").style.display = "none";
  document.getElementById("shareSection").style.display = "none";
  document.getElementById("scratchCodeInput").disabled = false;
  document.getElementById("unlockScratchBtn").disabled = false;
  document.getElementById("unlockScratchBtn").style.opacity = "1";
  scratchRevealed = false;
}

function unlockScratchWithCode() {
  const enteredCode = document
    .getElementById("scratchCodeInput")
    .value.trim()
    .toLowerCase();

  if (enteredCode === currentSecretCode) {
    document.getElementById("scratchWrapper").style.display = "block";
    document.getElementById("unlockScratchBtn").disabled = true;
    document.getElementById("unlockScratchBtn").style.opacity = "0.5";
    document.getElementById("scratchCodeInput").disabled = true;
    initScratchCard();
    showNotification("✅ Scratch card unlocked! Scratch the silver area!");
  } else {
    showNotification(`❌ Wrong code! Secret code is: ${currentSecretCode}`);
  }
}

// ======================= FIX: initScratchCard =======================
function initScratchCard() {
  const wrapper = document.getElementById("scratchWrapper");
  if (!wrapper) return;

  window.foolRevealed = false;

  // FIX: Clone to remove any stale event listeners from previous uses
  const oldCanvas = document.getElementById("scratchCanvas");
  const newCanvas = oldCanvas.cloneNode(false); // false = don't clone children
  newCanvas.style.pointerEvents = "auto"; // Ensure it's interactive if opened again
  oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);

  // FIX: Size the canvas to actual pixel dimensions of the wrapper
  const width = wrapper.clientWidth;
  const height = Math.round(width * 0.6);
  newCanvas.width = width;
  newCanvas.height = height;

  const ctx = newCanvas.getContext("2d");

  // Draw the silver scratch layer
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#c8cdd8");
  gradient.addColorStop(0.5, "#e0e4ed");
  gradient.addColorStop(1, "#9aa0b0");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Noise texture for realism
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
    ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
  }
  ctx.globalAlpha = 1;

  // Cross-hatch shimmer lines
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  for (let i = 0; i < 200; i++) {
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
  }
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // FIX: Switch to erase mode AFTER all drawing is done
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = 30;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  let isDrawing = false;
  let lastX = 0,
    lastY = 0;

  function getXY(e) {
    const rect = newCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = newCanvas.width / rect.width;
    const scaleY = newCanvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function startDraw(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getXY(e);
    lastX = pos.x;
    lastY = pos.y;
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getXY(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
    checkScratchCompletion();
  }

  function stopDraw() {
    isDrawing = false;
  }

  function checkScratchCompletion() {
    if (window.foolRevealed) return;
    const imageData = ctx.getImageData(0, 0, width, height);
    let cleared = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 50) cleared++;
    }
    const percent = (cleared / (width * height)) * 100;
    if (percent > 40) {
      revealFoolSurprise(newCanvas, ctx);
    }
  }

  newCanvas.addEventListener("mousedown", startDraw);
  newCanvas.addEventListener("mousemove", draw);
  newCanvas.addEventListener("mouseup", stopDraw);
  newCanvas.addEventListener("mouseleave", stopDraw);
  newCanvas.addEventListener("touchstart", startDraw, { passive: false });
  newCanvas.addEventListener("touchmove", draw, { passive: false });
  newCanvas.addEventListener("touchend", stopDraw);
}

// ======================= FIX: revealFoolSurprise =======================
// Now receives canvas + ctx directly — no stale global references
function revealFoolSurprise(canvas, ctx) {
  if (window.foolRevealed) return;
  window.foolRevealed = true;
  scratchRevealed = true;

  // Fully clear canvas so reward-content underneath shows through
  if (canvas && ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.pointerEvents = "none";
  }

  const rewardContent = document.getElementById("rewardContent");
  if (rewardContent) {
    rewardContent.innerHTML = `
            <div class="reward-icon" style="font-size:3rem;">🎉🤡🎉</div>
            <div class="fool-message" style="font-size:1.1rem;font-weight:bold;text-align:center;padding:0 12px;">
                🤣 Hey ${escapeHtml(currentUserName)}! You Are FOOLED! 🤣<br>
                Today April 1 — April Fools' Day! 😂
            </div>
            <div style="font-size:2rem;margin-top:8px;">😜🎭</div>
        `;
  }

  setTimeout(() => {
    showFoolPopup();
  }, 2000);
}

function showFoolPopup() {
  const popup = document.createElement("div");
  popup.className = "popup-notification";
  popup.innerHTML =
    '🎭 Share this to Fool your friends! 🎭 <button id="closePopupBtn" style="margin-left:8px;background:none;border:1px solid #1e1a2f;border-radius:20px;padding:2px 8px;cursor:pointer;font-weight:bold;">✖</button>';
  document.body.appendChild(popup);

  const closeBtn = document.getElementById("closePopupBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.remove();
      document.getElementById("shareSection").style.display = "flex";
    });
  }

  setTimeout(() => {
    if (popup.parentElement) {
      popup.remove();
      document.getElementById("shareSection").style.display = "flex";
    }
  }, 5000);
}

function shareFoolMessage() {
  const text = `It has  working Really Predict Your Future ! 🔮 Try your luck → https://future-lac-sigma.vercel.app`;

  if (navigator.share) {
    navigator
      .share({
        title: "Future Prediction App 🔮",
        text: text,
        url: "https://future-lac-sigma.vercel.app",
      })
      .catch(() => copyToClipboard(text));
  } else {
    copyToClipboard(text);
  }
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showNotification("✨ Copied! Share with unfooled friends ✨");
    })
    .catch(() => {
      alert("Share manually: " + text);
    });
}

function closeScratchModal() {
  const modal = document.getElementById("scratchModal");
  modal.classList.remove("active");
  window.foolRevealed = false;
  scratchRevealed = false;
  document.getElementById("unlockScratchBtn").disabled = false;
  document.getElementById("unlockScratchBtn").style.opacity = "1";
  document.getElementById("scratchCodeInput").disabled = false;
  document.getElementById("scratchCodeInput").value = "";
  document.getElementById("scratchWrapper").style.display = "none";
  document.getElementById("shareSection").style.display = "none";

  const rewardContent = document.getElementById("rewardContent");
  if (rewardContent) {
    rewardContent.innerHTML = `
            <div class="reward-icon">🎁✨</div>
            <div class="reward-title">SCRATCH TO REVEAL</div>
            <div class="scratch-instruction">👆 Scratch the silver area 👆</div>
        `;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function (m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

// ======================= GOOGLE SHEETS INTEGRATION =======================
// Paste your Web App URL here (from Apps Script Deploy step)
const SHEET_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbz_iw2pkEfe8n2qDw5kMWgC4wY_Q7xGeBkO7dmRjC4In7sbY9uSBdz0uxGCwRs05wBqGA/exec";

function sendToGoogleSheet() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const dob = document.getElementById("dob").value;
  const gender = document.getElementById("gender").value;

  const payload = {
    fullName: `${firstName} ${lastName}`,
    dob: dob,
    gender: gender,
    zodiac: selectedZodiac,
  };

  // Fire-and-forget — don't block the user flow
  fetch(SHEET_WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        console.log("✅ Data saved to Google Sheet");
      } else {
        console.warn("⚠️ Sheet error:", data.message);
      }
    })
    .catch((err) => {
      console.warn("⚠️ Could not reach sheet:", err);
    });
}

// ======================= UPDATED: verifySecretAndProceed =======================
// Replace your existing verifySecretAndProceed() with this version
function verifySecretAndProceed() {
  const userAnswer = document
    .getElementById("secretAnswer")
    .value.trim()
    .toLowerCase();

  if (userAnswer === currentSecretCode) {
    currentUserName = document.getElementById("firstName").value.trim();

    sendToGoogleSheet(); // ✅ Save to sheet on successful verification

    showScratchModal();
  } else {
    showNotification(
      `❌ Incorrect secret code! Expected: ${currentSecretCode}`,
    );
  }
}
