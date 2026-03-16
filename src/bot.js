const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_TOKEN, ADMIN_ID } = require('../config/config');
const { fetchPrediction, fetchNextPeriod } = require('./api');
const { addUser, getUsers } = require('./users');
const path = require("path");

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const channelId = '@jalwawinssjgame7';

let autoRunning = true;


// images BIG / SMALL
const bigImage = path.join(__dirname,"../public/big.jpg");
const smallImage = path.join(__dirname,"../public/small.jpg");


// STICKER UNIQUE
const predictionSticker = "CAACAgUAAxkBAAIDi2m36V2DW5fQFOzsbGdOVhe_r1ocAAJSAwAC0qoBVU3NipS4NOxCOgQ";


// =============================
// CONVERT PERIOD TO JALWA FORMAT
// =============================

function convertToJalwaPeriod(period){

try{

const [date,index] = period.split("-");

const gameCode = "10001";

const formattedIndex = index.padStart(4,"0");

return `${date}${gameCode}${formattedIndex}`;

}catch(e){

return period;

}

}


// =============================
// DESIGN MESSAGE
// =============================

function formatPrediction(datas, marketName){

const jalwaPeriod = convertToJalwaPeriod(datas.period);

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

const message = formatPrediction(datas,marketMap[choice].name);


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


// GET PREDICTION

if(text === "🔮 Get Prediction"){
return sendPrediction(chatId,2);
}


// DASHBOARD ADMIN

if(text === "📊 Dashboard"){

if(chatId !== ADMIN_ID) return;

const users = getUsers();

bot.sendMessage(chatId,

`📊 ADMIN DASHBOARD

🤖 Bot Status: ✅ Running
👥 Total Users: ${users.length}
📡 Auto Predictions: ${autoRunning ? "Active" : "Stopped"}
📢 Channel: ${channelId}

Admin Commands:

/broadcast MESSAGE
/stat
/stopauto
/startauto
`

);

}


// prediction buttons

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


// register link

if(text === "🔗 Register Link"){

bot.sendMessage(chatId,
"🔗 Register Link:👇\nhttps://okwin.bio/#/register?invitationCode=75541615988"
);

}


// prediction channel

if(text === "📢 Prediction Channel"){

bot.sendMessage(chatId,
"✅ Get Fast And Accurate Predictions and Gift Codes:\nhttps://t.me/vipokwinbig"
);

}

});


// =============================
// ADMIN COMMANDS
// =============================


// broadcast

bot.onText(/\/broadcast (.+)/, async (msg, match)=>{

if(msg.chat.id !== ADMIN_ID) return;

const message = match[1];

const users = getUsers();

for(const user of users){

try{

await bot.sendMessage(user,message);

await new Promise(r=>setTimeout(r,50));

}catch(e){

console.log("User blocked bot",user);

}

}

bot.sendMessage(msg.chat.id,"✅ Broadcast envoyé");

});


// stats

bot.onText(/\/stat/, (msg)=>{

if(msg.chat.id !== ADMIN_ID) return;

const users = getUsers();

bot.sendMessage(msg.chat.id,

`📊 BOT STATISTICS

👥 Total Users: ${users.length}
⚡ Bot Status: Running
`

);

});


// stop auto

bot.onText(/\/stopauto/, (msg)=>{

if(msg.chat.id !== ADMIN_ID) return;

autoRunning = false;

bot.sendMessage(msg.chat.id,"⛔ Auto prediction stopped");

});


// start auto

bot.onText(/\/startauto/, (msg)=>{

if(msg.chat.id !== ADMIN_ID) return;

autoRunning = true;

bot.sendMessage(msg.chat.id,"✅ Auto prediction started");

});


// =============================
// AUTO PREDICTION
// =============================

async function autoPrediction(market,marketName){

if(!autoRunning) return;

try{

const datas = await fetchPrediction(market);

const message = formatPrediction(datas,marketName);


if(market === "1"){

let imageToSend;

if(datas.bigSmall.toLowerCase() === "big"){
imageToSend = bigImage;
}else{
imageToSend = smallImage;
}

await bot.sendPhoto(channelId,imageToSend,{
caption: message
});

await bot.sendSticker(channelId,predictionSticker);

}else{

await bot.sendMessage(channelId,message);

}

}catch(e){

console.log("Auto prediction error",e);

}

}


// =============================
// SYNCHRONIZED TIMER
// =============================

async function startAutoPrediction(market,marketName){

try{

const next = await fetchNextPeriod(market);

const wait = next.remain * 1000;

console.log(`${marketName} next prediction in ${next.remain}s`);

setTimeout(async ()=>{

await autoPrediction(market,marketName);

startAutoPrediction(market,marketName);

},wait);

}catch(e){

console.log("Timer sync error",e);

setTimeout(()=>startAutoPrediction(market,marketName),10000);

}

}


// =============================
// START AUTO SYSTEM
// =============================

startAutoPrediction("0.5","WinGo 30s");
startAutoPrediction("1","WinGo 1min");
startAutoPrediction("3","WinGo 3min");
startAutoPrediction("5","WinGo 5min");


// =============================
// STICKER DEBUG
// =============================

bot.on("sticker", (msg) => {
console.log("Sticker ID:", msg.sticker.file_id);
});


module.exports = bot;