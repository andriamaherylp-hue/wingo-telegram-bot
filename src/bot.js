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
`✨ Welcome to Wingo Predict Bot PRO ✨  
🎮 The most reliable and exciting prediction platform! 🔥
Join our community 👉 @Jalwa_Game_Channel
🎁 Tutorials, gifts, and exclusive surprises await you 💶🥳

Please select an option below :`,
    userKeyboard
    );
  }
});

// =============================
// MARKET MAP
// =============================
const marketMap = {
  1: {market:"0.5", name:"WinGo 0.5 MIN"},
  2: {market:"1", name:"WinGo 1 MIN"},
  3: {market:"3", name:"WinGo 3 MIN"},
  4: {market:"5", name:"WinGo 5 MIN"}
};

// =============================
// FORMAT JALWA PERIOD 
// =============================
function convertToJalwaPeriod(period, market){
  try{
    if(!period.includes("-")){
      return period;
    }

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
🎰 Prediction for ${marketName} 🎰

📅 Period: ${jalwaPeriod}
💸 Purchase: ${datas.bigSmall}

🔮 Risky Predictions:
👉 Couleur : ${datas.color}
👉 Nombres : ${datas.digit} ou ${datas.digit + 1}

💡 Strategy Tip:
Utiliser la stratégie 2x

📊 Fund Management:
Gestion en 5 niveaux
`;
}

// =============================
// SEND PREDICTION (FIX APPLIQUÉ)
// =============================
async function sendPrediction(chatId,choice){

  if(!marketMap[choice]){
    return bot.sendMessage(chatId,"❌ Invalid choice");
  }

  try{
    await new Promise(r => setTimeout(r, 2000));

    // ✅ CORRECTION ICI
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

🤖 Bot Status: ✅ Running
👥 Users: ${users.length}

Commands:
/broadcast MESSAGE
/broadcast_photo FILEID|CAPTION|LINK|BUTTON
/broadcast_video FILEID|CAPTION
/broadcast_doc FILEID|CAPTION
/stat
`);
  }

  if(text === "🔗 Register Link"){
    bot.sendMessage(chatId,"🔗 Register Link:👇\nhttps://okwin.bio/#/register?invitationCode=75541615988");
  }

  if(text === "📢 Prediction Channel"){
    bot.sendMessage(chatId,"✅ Get Fast And Accurate Predictions and Gift Codes:\nhttps://t.me/vipokwinbig");
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
// BROADCAST TEXT
// =============================
bot.onText(/\/broadcast([\s\S]*)/, async (msg, match) => {

const chatId = msg.chat.id;

if(chatId !== ADMIN_ID){
return bot.sendMessage(chatId,"❌ Unauthorized");
}

const message = match[1].trim();

if(!message){
return bot.sendMessage(chatId,"❌ Add message");
}

const users = getUsers();

for(const userId of users){
try{
await bot.sendMessage(userId, message);
}catch(e){}
await sleep(50);
}

await bot.sendMessage(channelId, message);

bot.sendMessage(chatId,`✅ Broadcast done
👥 Total: ${users.length}`);

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
const buttonText = parts[3]?.trim() || "📲 Install App";

if(!fileId){
return bot.sendMessage(chatId,"❌ Format incorrect");
}

const users = getUsers();

const keyboard = link ? {
  reply_markup:{
    inline_keyboard:[
      [{ text: buttonText, url: link }]
    ]
  }
} : {};

for(const userId of users){
try{
await bot.sendPhoto(userId,fileId,{ caption,...keyboard });
}catch(e){}
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
try{
await bot.sendVideo(userId,fileId,{ caption });
}catch(e){}
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
try{
await bot.sendDocument(userId,fileId,{ caption });
}catch(e){}
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