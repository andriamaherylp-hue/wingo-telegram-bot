// Importation du package node-fetch
const fetch = require('node-fetch');

// Fonction pour récupérer la prédiction
async function fetchPrediction(market) {
  try {
    console.log(`Appel à l'API de prédiction pour le marché: ${market}`);

    // Appel à l'API de prédiction
    const response = await fetch(`https://indialotteryapi.com/wp-json/wingo/v1/predict?market=${market}`);
    
    // Vérification de la réponse de l'API
    if (!response.ok) {
      throw new Error(`Erreur API Predict: ${response.statusText}`);
    }

    // Transformation de la réponse en JSON
    const data = await response.json();

    // Log des données reçues pour déboguer
    console.log("Données reçues de l'API Prediction:", data);

    // Vérification de la présence des données
    if (data.items && data.items.length > 0) {
      return data.items[0];  // Retourner les données de la première prédiction
    } else {
      throw new Error('Aucune donnée dans la réponse de l\'API Predict');
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la prédiction:", error);
    throw error;  // Rejeter l'erreur pour qu'elle soit gérée par le bot
  }
}

// Fonction pour récupérer la période suivante
async function fetchNextPeriod(market) {
  try {
    console.log(`Appel à l'API pour la période suivante pour le marché: ${market}`);

    // Appel à l'API de la prochaine période
    const response = await fetch(`https://indialotteryapi.com/wp-json/wingo/v1/next?market=${market}`);
    
    // Vérification de la réponse de l'API
    if (!response.ok) {
      throw new Error(`Erreur API Next: ${response.statusText}`);
    }

    // Transformation de la réponse en JSON
    const data = await response.json();
    
    // Log des données reçues pour déboguer
    console.log("Données reçues de l'API Next:", data);

    // Vérification de la présence des données
    if (data.idx && data.remain && data.ymd) {
      return data;  // Retourner les données de la période suivante
    } else {
      throw new Error('Aucune donnée valide dans la réponse de l\'API Next');
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la période suivante:", error);
    throw error;  // Rejeter l'erreur pour qu'elle soit gérée par le bot
  }
}

// Exporter les deux fonctions
module.exports = { fetchPrediction, fetchNextPeriod };