const express = require('express');
const bot = require('./src/bot');
const { TELEGRAM_TOKEN } = require('./config/config');

const app = express();
const PORT = process.env.PORT || 10000;

// 👉 URL Render automatique
const URL = process.env.RENDER_EXTERNAL_URL;

// =============================
// WEBHOOK CONFIG
// =============================

// supprimer ancien webhook (important)
bot.deleteWebHook().then(() => {
  console.log("🧹 Old webhook removed");
});

// définir nouveau webhook
setTimeout(() => {
  bot.setWebHook(`${URL}/bot${TELEGRAM_TOKEN}`);
  console.log("✅ Webhook set:", `${URL}/bot${TELEGRAM_TOKEN}`);
}, 2000);

app.use(express.json());

// endpoint Telegram
app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// test route
app.get('/', (req, res) => {
  res.send('✅ Wingo Bot is running (Webhook OK)');
});

// start server
app.listen(PORT, () => {
  console.log(`🚀 Serveur Express lancé sur le port ${PORT}`);
});