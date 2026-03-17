const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_TOKEN, ADMIN_ID } = require('../config/config');
const { fetchPrediction } = require('./api');
const { addUser, getUsers } = require('./users');
const path = require("path");

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const channelId = '@jalwawinssjgame7';

let autoRunning = false;


// images BIG / SMALL
const bigImage = path.join(__dirname,"../public/big.jpg");
const smallImage = path.join(__dirname,"../public/small.jpg");


// STICKER UNIQUE
const predictionSticker = "CAACAgUAAxkBAAIDi2m36V2DW5fQFOzsbGdOVhe_r1ocAAJSAwAC0qoBVU3NipS4NOxCOgQ";


// =============================
// CONVERT PERIOD TO JALWA FORMAT
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
// DESIGN MESSAGE
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
Use the 2x strategy for better chances of profit and winning.

📊 Fund Management:
Always play through fund management 5 level.
`;

}


// =============================
// KEYBOARDS
// =============================

const userKeyboard = {
reply_markup:{
keyboard:[
["🔮 Get Prediction"],
["1️⃣ WinGo 30s","2️⃣ WinGo 1min"],
["3️⃣ WinGo 3min","4️⃣ WinGo 5min"],
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
["1️⃣ WinGo 30s","2️⃣ WinGo 1min"],
["3️⃣ WinGo 3min","4️⃣ WinGo 5min"],
["🔗 Register Link","📢 Prediction Channel"]
],
resize_keyboard:true
}
};


// =============================
// START COMMAND
// =============================

bot.onText(/\/start/, (msg) => {

const chatId = msg.chat.id;

addUser(chatId);

if(chatId === ADMIN_ID){

bot.sendMessage(chatId,"👑 Admin Panel",adminKeyboard);

}else{

bot.sendMessage(chatId,
`🚀 Welcome to Wingo Predict Bot PRO
🎮 The Best Betting Platforms ! 🔥
Join the community 👉 @Jalwa_Game_Channel
Tutorials, Gifts, Subscribe to Me! 🥰🎁 💶

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
// SEND PREDICTION FUNCTION
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


// IMAGE + STICKER UNIQUEMENT POUR WINGO 1 MIN

if(choice === 2){

let imageToSend;

if(datas.bigSmall.toLowerCase() === "big"){
imageToSend = bigImage;
}else{
imageToSend = smallImage;
}

await bot.sendPhoto(chatId,imageToSend,{
caption: message
});

await bot.sendSticker(chatId,predictionSticker);

}else{

await bot.sendMessage(chatId,message);

}

}catch(e){

bot.sendMessage(chatId,"❌ Prediction error");

}

}


// =============================
// BUTTON HANDLER
// =============================  

bot.on("message", async (msg)=>{

const chatId = msg.chat.id;
const text = msg.text;

if(!text) return;


if(text === "🔮 Get Prediction"){
return sendPrediction(chatId,2);
}


if(text === "📊 Dashboard"){

if(chatId !== ADMIN_ID) return;

const users = getUsers();

bot.sendMessage(chatId,

`📊 ADMIN DASHBOARD

🤖 Bot Status: ✅ Running
👥 Total Users: ${users.length}
📡 Auto Predictions: OFF
📢 Channel: ${channelId}

Admin Commands:

/broadcast MESSAGE
/stat
`

);

}


if(text === "1️⃣ WinGo 30s"){
return sendPrediction(chatId,1);
}

if(text === "2️⃣ WinGo 1min"){
return sendPrediction(chatId,2);
}

if(text === "3️⃣ WinGo 3min"){
return sendPrediction(chatId,3);
}

if(text === "4️⃣ WinGo 5min"){
return sendPrediction(chatId,4);
}


if(text === "🔗 Register Link"){

bot.sendMessage(chatId,
"🔗 Register Link:👇\nhttps://okwin.bio/#/register?invitationCode=75541615988"
);

}


if(text === "📢 Prediction Channel"){

bot.sendMessage(chatId,
"✅ Get Fast And Accurate Predictions and Gift Codes:\nhttps://t.me/vipokwinbig"
);

}

});


// =============================
// DELAY FUNCTION (ANTI BAN)
// =============================

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}


// =============================
// BROADCAST TEXTE (MULTI-LIGNE)
// =============================

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
await bot.sendMessage(userId, message, {
parse_mode: "HTML",
disable_web_page_preview: false
});

success++;

}catch(e){
failed++;
}

await sleep(50); // anti-ban

}

bot.sendMessage(chatId,
`📢 Broadcast terminé

✅ Envoyé: ${success}
❌ Échoué: ${failed}
👥 Total: ${users.length}`
);

});


// =============================
// BROADCAST PHOTO + TEXTE + BOUTON
// =============================

bot.onText(/\/broadcast_photo (.+)/, async (msg, match) => {

const chatId = msg.chat.id;

if(chatId !== ADMIN_ID){
return bot.sendMessage(chatId,"❌ Unauthorized");
}

// Format attendu : file_id|texte|lien
const parts = match[1].split("|");

const fileId = parts[0];
const caption = parts[1] || "";
const link = parts[2] || "";

const users = getUsers();

let success = 0;
let failed = 0;

for(const userId of users){

try{

await bot.sendPhoto(userId, fileId, {
caption: caption,
reply_markup: link ? {
inline_keyboard: [[
{ text: "🔗 Register Now", url: link }
]]
} : undefined
});

success++;

}catch(e){
failed++;
}

await sleep(50);

}

bot.sendMessage(chatId,`📢 Photo broadcast terminé\n✅ ${success} | ❌ ${failed}`);

});


// =============================
// BROADCAST VIDEO
// =============================

bot.onText(/\/broadcast_video (.+)/, async (msg, match) => {

const chatId = msg.chat.id;

if(chatId !== ADMIN_ID){
return bot.sendMessage(chatId,"❌ Unauthorized");
}

const parts = match[1].split("|");

const fileId = parts[0];
const caption = parts[1] || "";

const users = getUsers();

for(const userId of users){

try{
await bot.sendVideo(userId, fileId, { caption });
}catch(e){}

await sleep(50);

}

bot.sendMessage(chatId,"📢 Video broadcast envoyé");

});


// =============================
// BROADCAST DOCUMENT
// =============================

bot.onText(/\/broadcast_doc (.+)/, async (msg, match) => {

const chatId = msg.chat.id;

if(chatId !== ADMIN_ID){
return bot.sendMessage(chatId,"❌ Unauthorized");
}

const parts = match[1].split("|");

const fileId = parts[0];
const caption = parts[1] || "";

const users = getUsers();

for(const userId of users){

try{
await bot.sendDocument(userId, fileId, { caption });
}catch(e){}

await sleep(50);

}

bot.sendMessage(chatId,"📢 Document broadcast envoyé");

});


// =============================
// STATS
// =============================

bot.onText(/\/stat/, (msg) => {

const chatId = msg.chat.id;

if(chatId !== ADMIN_ID){
return bot.sendMessage(chatId,"❌ Unauthorized");
}

const users = getUsers();

bot.sendMessage(chatId,
`📊 BOT STATISTICS

👥 Total Users: ${users.length}
🤖 Status: Running
📡 Auto Prediction: OFF
📢 Channel: ${channelId}
`
);

});


// =============================
// STICKER DEBUG
// =============================

bot.on("sticker", (msg) => {
console.log("Sticker ID:", msg.sticker.file_id);
});


module.exports = bot;