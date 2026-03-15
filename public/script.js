let choices = {
  1: {name: "5", remaining: null, id: null, date: null},
  2: {name: "1", remaining: null, id: null, date: null},
  3: {name: "2", remaining: null, id: null, date: null},
  4: {name: "3", remaining: null, id: null, date: null}
};

let mille = 1000;
let activeChoice = 1; 
let timerInterval = null;


 

// Fonction pour changer de choix
function setActiveChoice(choiceNumber) {
  activeChoice = choiceNumber;
  updateButtonColors();
  fetchNextPeriod(choiceNumber); // synchro API
  fetchPrediction(choiceNumber); // prédiction API
}

// Met à jour l’affichage
function updateDisplay() {
  let choice = choices[activeChoice];
  if (choice.remaining !== null) {
    document.getElementById("display").textContent =
      `${formatTime(choice.remaining)}`;
  } else {
    document.getElementById("display").textContent = "Loading...";
  }
  if (choice.date !== null){
    document.getElementById("info").textContent =
    `${choice.date}${mille}${choices[1].name}${choice.id}`;
  } else {
    document.getElementById("info").textContent = null
  }
  

}

// Met à jour la couleur du bouton actif
function updateButtonColors() {
  for (let i = 1; i <= 4; i++) {
    let btn = document.getElementById("btn" + i);
    if (i === activeChoice) {
      btn.classList.add("active-btn");
    } else {
      btn.classList.remove("active-btn");
    }
  }
}

// Format mm:ss
function formatTime(seconds) {
  let m = Math.floor(seconds / 60);
  let s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// 🔌 API : récupérer la prochaine période
async function fetchNextPeriod(choiceNumber) {
  let marketMap = {1: "0.5", 2: "1", 3: "3", 4: "5"};
  let market = marketMap[choiceNumber];

  try {
    let response = await fetch(`https://indialotteryapi.com/wp-json/wingo/v1/next?market=${market}`);
    let data = await response.json();
  
    console.log(data);
    
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

// 🔮 API : récupérer la prédiction
async function fetchPrediction(choiceNumber) {
  let marketMap = {1: "0.5", 2: "1", 3: "3", 4: "5"};
  let market = marketMap[choiceNumber];

  try {
    let response = await fetch(`https://indialotteryapi.com/wp-json/wingo/v1/predict?market=${market}`);
    let data = await response.json();
  
    let datas = data.items[0]
    
    
    
    // Bloc prédiction détaillée en bas
    let nextDiv = document.getElementById("nextPrediction");
    if (datas.digit !== undefined) {
      nextDiv.textContent =
        `Prochaine prédiction → Période: ${datas.period} | Numéro: ${datas.digit} | Couleur: ${datas.color} | Pair/Impair: ${datas.oddEven} | Grand/Petit: ${datas.bigSmall} | Confiance: ${datas.conf}%`;
    } else {
      nextDiv.textContent = "Prochaine prédiction : données non disponibles";
    }

    nextDiv.className = "next-prediction";
    if (datas.color) {
      nextDiv.classList.add(datas.color.toLowerCase());
    }

  } catch (error) {
    console.error("Erreur API Predict:", error);
    document.getElementById("nextPrediction").textContent = "Prochaine prédiction : erreur API";
  }
}

// Initialisation
setActiveChoice(activeChoice);


async function notifyTelegram(predictionText) {
  try {
    await fetch(`http://127.0.0.1:5000/sendPrediction?prediction=${encodeURIComponent(predictionText)}`);
  } catch (err) {
    console.error("Erreur envoi Telegram:", err);
  }
}

notifyTelegram(nextDiv.textContent);
