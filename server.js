const express = require('express'); 
const bot = require('./src/bot');
const { TELEGRAM_TOKEN } = require('./config/config');
const { fetchNextPeriod } = require('./src/api'); // ✅ AJOUT

const app = express();
const PORT = process.env.PORT || 10000;

// 👉 URL Render automatique
const URL = process.env.RENDER_EXTERNAL_URL;

// =============================
// WEBHOOK CONFIG
// =============================

// supprimer ancien webhook
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

// =============================
// STATIC
// =============================
app.use(express.static('public'));

// =============================
// ✅ ROUTE CORRIGÉE (PLUS D’ERREUR API)
// =============================
app.get('/', async (req, res) => {

  try{
    const data = await fetchNextPeriod("1");

    res.send(`
      <h1>🤖 Wingo Bot Running</h1>
      <p>⏱ Temps restant : ${data.remain}s</p>
    `);

  }catch(e){
    res.send(`
      <h1>❌ API ERROR</h1>
      <p>${e.message}</p>
    `);
  }

});

// =============================
// START SERVER
// =============================
app.listen(PORT, () => {
  console.log(`🚀 Serveur Express lancé sur le port ${PORT}`);
});