const express = require('express');
const { PORT } = require('../config/config');

const app = express();

// Sert les fichiers HTML/CSS/JS
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`🚀 Serveur Express lancé sur http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Bot is running');
});