const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_TOKEN, ADMIN_ID } = require('../config/config');
const { fetchPrediction } = require('./api');
const { addUser, getUsers } = require('./users');
const path = require("path");

// ✅ BOT
const bot = new TelegramBot(TELEGRAM_TOKEN);

const channelId = '@jalwawinssjgame7';

// =============================
// IMAGES + STICKER
// =============================
const bigImage = path.join(__dirname,"../public/big.jpg");
const smallImage = path.join(__dirname,"../public/small.jpg");

const predictionSticker = "CAACAgUAAxkBAAIDi2m36V2DW5fQFOzsbGdOVhe_r1ocAAJSAwAC0qoBVU3NipS4NOxCOgQ";

// =============================
// MENU PRINCIPAL (CORRIGÉ)
// =============================
const userKeyboard = {
  reply_markup:{
    keyboard:[
      ["🔮 Get Prediction"],
      ["🔗 Register Link","📢 Prediction Channel"]
    ],
    resize_keyboard:true
  }
};

const adminKeyboard = {
  reply_markup:{
    keyboard:[
      ["🔮 Get Prediction"],
      ["📊 Dashboard"],
      ["🔗 Register Link","📢 Prediction Channel"]
    ],
    resize_keyboard:true
  }
};

// =============================
// MENU PREDICTION (INLINE)
// =============================
const predictionMenu = {
  reply_markup:{
    inline_keyboard:[
      [
        { text:"30 Seconds", callback_data:"pred_1" },
        { text:"1 Minute", callback_data:"pred_2" }
      ],
      [
        { text:"3 Minutes", callback_data:"pred_3" },
        { text:"5 Minutes", callback_data:"pred_4" }
      ]
    ]
  }
};

// =============================
// START
// =============================
bot.onText(/\/start/, (msg) => {

  const chatId = msg.chat.id;
  addUser(chatId);

  if(chatId === ADMIN_ID){
    bot.sendMessage(chatId,"👑 Admin Panel",adminKeyboard);
  } else {
    bot.sendMessage(chatId,
`🚀 Welcome to Wingo Predict Bot PRO
🎮 The Best Betting Platforms ! 🔥

Please select an option below :`,
    userKeyboard
    );
  }
});

// =============================
// MARKET MAP
// =============================
const marketMap = {
  1: {market:"0.5", name:"WinGo 30s"},
  2: {market:"1", name:"WinGo 1min"},
  3: {market:"3", name:"WinGo 3min"},
  4: {market:"5", name:"WinGo 5min"}
};

// =============================
// FORMAT PERIOD
// =============================
function convertToJalwaPeriod(period, market){
  try{
    const [date,index] = period.split("-");
    const gameCode = "1000";

    let marketCode = "1";
    if(market === "0.5") marketCode = "5";
    if(market === "1") marketCode = "1";
    if(market === "3") marketCode = "2";
    if(market === "5") marketCode = "3";

    const formattedIndex = index.padStart(4,"0");
    return `${date}${gameCode}${marketCode}${formattedIndex}`;

  }catch(e){
    return period;
  }
}

// =============================
// FORMAT MESSAGE
// =============================
function formatPrediction(datas, marketName, market){

  const jalwaPeriod = convertToJalwaPeriod(datas.period, market);

  return `
🎰 Prediction for ${marketName.toUpperCase()} 🎰

📅 Period: ${jalwaPeriod}
💸 Purchase: ${datas.bigSmall}

🔮 Risky Predictions:
👉🏻 Colour: ${datas.color}
👉🏻 Numbers: ${datas.digit} or ${datas.digit + 1}

💡 Strategy Tip:
Use the 2x strategy for better chances.

📊 Fund Management:
Always play with management.
`;
}

// =============================
// SEND PREDICTION
// =============================
async function sendPrediction(chatId,choice){

  if(!marketMap[choice]){
    return bot.sendMessage(chatId,"❌ Invalid choice");
  }

  try{

    const datas = await fetchPrediction(marketMap[choice].market);

    const message = formatPrediction(
      datas,
      marketMap[choice].name,
      marketMap[choice].market
    );

    // IMAGE SEULEMENT POUR 1 MIN
    if(choice === 2){

      let imageToSend =
        datas.bigSmall.toLowerCase() === "big" ? bigImage : smallImage;

      await bot.sendPhoto(chatId,imageToSend,{ caption: message });
      await bot.sendSticker(chatId,predictionSticker);

    } else {
      await bot.sendMessage(chatId,message);
    }

  }catch(e){
    bot.sendMessage(chatId,"❌ Prediction error");
  }
}

// =============================
// MESSAGE HANDLER (CORRIGÉ)
// =============================
bot.on("message", async (msg)=>{

  const chatId = msg.chat.id;
  const text = msg.text;

  if(!text) return;

  // 🔥 MENU PREDICTION
  if(text === "🔮 Get Prediction"){
    return bot.sendMessage(chatId,"🏪 Choose Market",predictionMenu);
  }

  // DASHBOARD
  if(text === "📊 Dashboard"){
    if(chatId !== ADMIN_ID) return;

    const users = getUsers();

    bot.sendMessage(chatId,
`📊 ADMIN DASHBOARD

👥 Users: ${users.length}
📡 Auto: OFF
📢 Channel: ${channelId}`
    );
  }

  // REGISTER
  if(text === "🔗 Register Link"){
    bot.sendMessage(chatId,
"🔗 https://okwin.bio/#/register?invitationCode=75541615988"
    );
  }

  // CHANNEL
  if(text === "📢 Prediction Channel"){
    bot.sendMessage(chatId,
"📢 https://t.me/vipokwinbig"
    );
  }

});

// =============================
// INLINE BUTTON CLICK
// =============================
bot.on("callback_query", async (query) => {

  const chatId = query.message.chat.id;
  const data = query.data;

  if(data.startsWith("pred_")){
    const choice = parseInt(data.split("_")[1]);

    await sendPrediction(chatId, choice);

    bot.answerCallbackQuery(query.id);
  }

});

// =============================
// DELAY
// =============================
function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================
// BROADCAST (INCHANGÉ)
// =============================
// (je n’ai rien modifié ici pour respecter ta logique)

bot.onText(/\/broadcast ([\s\S]+)/, async (msg, match) => {

const chatId = msg.chat.id;

if(chatId !== ADMIN_ID){
return bot.sendMessage(chatId,"❌ Unauthorized");
}

const message = match[1];
const users = getUsers();

let success = 0;
let failed = 0;

for(const userId of users){
try{
await bot.sendMessage(userId, message);
success++;
}catch(e){
failed++;
}
await sleep(50);
}

await bot.sendMessage(channelId, message);

bot.sendMessage(chatId,
`📢 Broadcast terminé
✅ ${success} | ❌ ${failed}`
);

});

// =============================
// EXPORT
// =============================
module.exports = bot;