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
// MENU PRINCIPAL 
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
// MENU PREDICTION
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
// FORMAT MESSAGE
// =============================
function formatPrediction(datas, marketName, market){

  return `
🎰 Prediction for ${marketName.toUpperCase()} 🎰

📅 Period: ${datas.period}
💸 Purchase: ${datas.bigSmall}

🔮 Colour: ${datas.color}
🔢 Numbers: ${datas.digit} or ${datas.digit + 1}
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
// MESSAGE HANDLER
// =============================
bot.on("message", async (msg)=>{

  const chatId = msg.chat.id;
  const text = msg.text;

  if(!text) return;

  if(text === "🔮 Get Prediction"){
    return bot.sendMessage(chatId,"🏪 Choose Market",predictionMenu);
  }

  if(text === "📊 Dashboard"){
    if(chatId !== ADMIN_ID) return;

    const users = getUsers();

    bot.sendMessage(chatId,
`📊 ADMIN DASHBOARD

👥 Users: ${users.length}

Commands:
/broadcast
/broadcast_photo
/broadcast_video
/broadcast_doc
/stat
`);
  }

  if(text === "🔗 Register Link"){
    bot.sendMessage(chatId,"https://okwin.bio/#/register?invitationCode=75541615988");
  }

  if(text === "📢 Prediction Channel"){
    bot.sendMessage(chatId,"https://t.me/vipokwinbig");
  }

});

// =============================
// INLINE CLICK
// =============================
bot.on("callback_query", async (query) => {

  const chatId = query.message.chat.id;
  const choice = parseInt(query.data.split("_")[1]);

  await sendPrediction(chatId, choice);
  bot.answerCallbackQuery(query.id);
});

// =============================
// DELAY
// =============================
function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================
// BROADCAST TEXT (FIX)
// =============================
bot.onText(/\/broadcast/, async (msg) => {

const chatId = msg.chat.id;

if(chatId !== ADMIN_ID){
return bot.sendMessage(chatId,"❌ Unauthorized");
}

const message = msg.text.replace('/broadcast','').trim();

if(!message){
return bot.sendMessage(chatId,"❌ Add message");
}

const users = getUsers();

for(const userId of users){
await bot.sendMessage(userId, message);
await sleep(50);
}

await bot.sendMessage(channelId, message);

bot.sendMessage(chatId,"✅ Broadcast done");

});

// =============================
// BROADCAST PHOTO
// =============================
bot.onText(/\/broadcast_photo ([\s\S]+)/, async (msg, match) => {

const chatId = msg.chat.id;
if(chatId !== ADMIN_ID) return;

const parts = match[1].split("|");

const fileId = parts[0]?.trim();
const caption = parts[1]?.trim() || "";
const link = parts[2]?.trim() || "";
const buttonText = parts[3]?.trim() || "📲 Download";

const keyboard = link ? {
  reply_markup:{
    inline_keyboard:[
      [{ text: buttonText, url: link }]
    ]
  }
} : {};

const users = getUsers();

for(const userId of users){
await bot.sendPhoto(userId,fileId,{ caption,...keyboard });
await sleep(50);
}

await bot.sendPhoto(channelId,fileId,{ caption,...keyboard });

bot.sendMessage(chatId,"✅ Photo broadcast done");

});

// =============================
// BROADCAST VIDEO
// =============================
bot.onText(/\/broadcast_video ([\s\S]+)/, async (msg, match) => {

const parts = match[1].split("|");
const fileId = parts[0]?.trim();
const caption = parts[1]?.trim() || "";

const users = getUsers();

for(const userId of users){
await bot.sendVideo(userId,fileId,{ caption });
await sleep(50);
}

await bot.sendVideo(channelId,fileId,{ caption });

});

// =============================
// BROADCAST DOC
// =============================
bot.onText(/\/broadcast_doc ([\s\S]+)/, async (msg, match) => {

const parts = match[1].split("|");
const fileId = parts[0]?.trim();
const caption = parts[1]?.trim() || "";

const users = getUsers();

for(const userId of users){
await bot.sendDocument(userId,fileId,{ caption });
await sleep(50);
}

await bot.sendDocument(channelId,fileId,{ caption });

});

// =============================
// STAT
// =============================
bot.onText(/\/stat/, (msg) => {

const chatId = msg.chat.id;
if(chatId !== ADMIN_ID) return;

const users = getUsers();

bot.sendMessage(chatId,`👥 Users: ${users.length}`);

});

module.exports = bot;