const express = require('express');

// démarrer le bot
require('./src/bot');

const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Wingo Bot is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur Express lancé sur le port ${PORT}`);
});