const express = require('express');

const app = express();

// Render fournit le port automatiquement
const PORT = process.env.PORT || 10000;

// Sert les fichiers statiques
app.use(express.static('public'));

// route test pour Render
app.get('/', (req, res) => {
  res.send('Wingo Bot is running');
});

// démarrage serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur Express lancé sur le port ${PORT}`);
});