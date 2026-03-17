let choices = {
  1: { name: "5", remaining: null, id: null, date: null },
  2: { name: "1", remaining: null, id: null, date: null },
  3: { name: "2", remaining: null, id: null, date: null },
  4: { name: "3", remaining: null, id: null, date: null }
};

let mille = 1000;
let activeChoice = 1;
let timerInterval = null;

// =============================
// CHANGER CHOIX
// =============================
function setActiveChoice(choiceNumber) {
  activeChoice = choiceNumber;
  updateButtonColors();
  fetchNextPeriod(choiceNumber);
  fetchPrediction(choiceNumber);
}

// =============================
// UPDATE DISPLAY
// =============================
function updateDisplay() {
  let choice = choices[activeChoice];

  document.getElementById("display").textContent =
    choice.remaining !== null ? formatTime(choice.remaining) : "Loading...";

  document.getElementById("info").textContent =
    choice.date !== null
      ? `${choice.date}${mille}${choices[1].name}${choice.id}`
      : "";
}

// =============================
// BOUTONS ACTIFS
// =============================
function updateButtonColors() {
  for (let i = 1; i <= 4; i++) {
    let btn = document.getElementById("btn" + i);
    btn.classList.toggle("active-btn", i === activeChoice);
  }
}

// =============================
// FORMAT TEMPS
// =============================
function formatTime(seconds) {
  let m = Math.floor(seconds / 60);
  let s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// =============================
// 🔌 API NEXT PERIOD
// =============================
async function fetchNextPeriod(choiceNumber) {
  let marketMap = { 1: "0.5", 2: "1", 3: "3", 4: "5" };
  let market = marketMap[choiceNumber];

  try {
    let response = await fetch(
      `https://indialotteryapi.com/wp-json/wingo/v1/next?market=${market}`
    );
    let data = await response.json();

    let choice = choices[choiceNumber];
    choice.id = data.idx;
    choice.remaining = data.remain;
    choice.date = data.ymd;

    updateDisplay();

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      choice.remaining--;

      if (choice.remaining <= 0) {
        fetchNextPeriod(choiceNumber);
        fetchPrediction(choiceNumber);
      }

      updateDisplay();
    }, 1000);
  } catch (error) {
    console.error("Erreur API Next:", error);
  }
}

// =============================
// 🔮 API PREDICTION (BACKEND)
// =============================
async function fetchPrediction(choiceNumber) {
  let marketMap = { 1: "0.5", 2: "1", 3: "3", 4: "5" };
  let market = marketMap[choiceNumber];

  try {
    let response = await fetch(`/api/predict?market=${market}`);
    let datas = await response.json();

    let nextDiv = document.getElementById("nextPrediction");

    if (datas && datas.digit !== undefined) {
      const text = `Prochaine → ${datas.period} | Num: ${datas.digit} | ${datas.color} | ${datas.bigSmall}`;

      nextDiv.textContent = text;

      // reset style + couleur dynamique
      nextDiv.className = "next-prediction";
      if (datas.color) {
        nextDiv.classList.add(datas.color.toLowerCase());
      }

      // 🔥 ENVOI TELEGRAM
      notifyTelegram(text);
    } else {
      nextDiv.textContent =
        "Prochaine prédiction : données non disponibles";
    }
  } catch (error) {
    console.error("Erreur API Predict:", error);
    document.getElementById("nextPrediction").textContent =
      "Prochaine prédiction : erreur API";
  }
}

// =============================
// 📡 ENVOI TELEGRAM (RENDER OK)
// =============================
async function notifyTelegram(predictionText) {
  try {
    await fetch(
      `/sendPrediction?prediction=${encodeURIComponent(predictionText)}`
    );
  } catch (err) {
    console.error("Erreur envoi Telegram:", err);
  }
}

// =============================
// INITIALISATION
// =============================
setActiveChoice(activeChoice);