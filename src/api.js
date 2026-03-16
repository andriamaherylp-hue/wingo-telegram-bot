// Importation du package node-fetch
const fetch = require('node-fetch');

// =============================
// FONCTION CALCUL PERIODE IST
// =============================

function generatePeriod(market){

  const now = new Date();

  // convertir en heure Inde (IST UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);

  const y = istTime.getFullYear();
  const m = String(istTime.getMonth() + 1).padStart(2,"0");
  const d = String(istTime.getDate()).padStart(2,"0");

  const date = `${y}${m}${d}`;

  const seconds =
    istTime.getHours()*3600 +
    istTime.getMinutes()*60 +
    istTime.getSeconds();

  let index = 0;

  if(market === "0.5"){      // 30 secondes
    index = Math.floor(seconds / 30);
  }

  if(market === "1"){        // 1 minute
    index = Math.floor(seconds / 60);
  }

  if(market === "3"){        // 3 minutes
    index = Math.floor(seconds / 180);
  }

  if(market === "5"){        // 5 minutes
    index = Math.floor(seconds / 300);
  }

  index = index + 1;

  return `${date}-${index}`;

}


// =============================
// FETCH PREDICTION
// =============================

async function fetchPrediction(market) {

  try {

    console.log(`Appel à l'API de prédiction pour le marché: ${market}`);

    const response = await fetch(
      `https://indialotteryapi.com/wp-json/wingo/v1/predict?market=${market}`
    );

    if (!response.ok) {
      throw new Error(`Erreur API Predict: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("Données reçues de l'API Prediction:", data);

    if (data.items && data.items.length > 0) {

      const item = data.items[0];

      // recalculer la vraie période
      item.period = generatePeriod(market);

      return item;

    } else {

      throw new Error("Aucune donnée dans la réponse de l'API Predict");

    }

  } catch (error) {

    console.error("Erreur lors de la récupération de la prédiction:", error);

    throw error;

  }

}


// =============================
// FETCH NEXT PERIOD
// =============================

async function fetchNextPeriod(market) {

  try {

    console.log(`Appel à l'API pour la période suivante pour le marché: ${market}`);

    const response = await fetch(
      `https://indialotteryapi.com/wp-json/wingo/v1/next?market=${market}`
    );

    if (!response.ok) {
      throw new Error(`Erreur API Next: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("Données reçues de l'API Next:", data);

    if (data.remain) {

      return {
        remain: data.remain
      };

    } else {

      throw new Error("Aucune donnée valide dans l'API Next");

    }

  } catch (error) {

    console.error("Erreur lors de la récupération de la période suivante:", error);

    throw error;

  }

}


// =============================
// EXPORT
// =============================

module.exports = { fetchPrediction, fetchNextPeriod };