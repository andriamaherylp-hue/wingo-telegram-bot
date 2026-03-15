const TelegramBot = require('node-telegram-bot-api');
const { TELEGRAM_TOKEN } = require('../config/config');
const { fetchPrediction } = require('./api');

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const channelId = '@jalwawinssjgame7';


// =============================
// DESIGN MESSAGE
// =============================

function formatPrediction(datas, marketName){

return `
╔══════════════════╗
🎰 𝗪𝗜𝗡𝗚𝗢 𝗣𝗥𝗘𝗗𝗜𝗖𝗧𝗜𝗢𝗡
╚══════════════════╝

🕒 Market : ${marketName}

📅 Period
${datas.period}

💰 Prediction
${datas.bigSmall}

🎨 Colour
${datas.color}

🔢 Numbers
${datas.digit} | ${datas.digit + 1}

━━━━━━━━━━━━━━

💡 Strategy
Play with **2X Strategy**

📊 Management
Follow **5 Level Fund Rule**

━━━━━━━━━━━━━━

🚀 Join Prediction Channel
https://t.me/okwinofficial88
`;
}


// =============================
// START COMMAND
// =============================

bot.onText(/\/start/, (msg) => {

bot.sendMessage(msg.chat.id,

`🚀 Welcome to Wingo Predict Bot PRO

Choose a market :

1️⃣ WinGo 30s
2️⃣ WinGo 1min
3️⃣ WinGo 3min
4️⃣ WinGo 5min

Use :
/predict1
/predict2
/predict3
/predict4
`,

{
reply_markup:{
inline_keyboard:[

[
{ text:"📢 Prediction Channel", url:"https://t.me/okwinofficial88"}
],

[
{ text:"📝 Register", url:"https://okwin.bio/#/register?invitationCode=75541615988"}
]

]
}
}

);

});


// =============================
// MANUAL PREDICT
// =============================

const marketMap = {
1: {market:"0.5", name:"WinGo 30s"},
2: {market:"1", name:"WinGo 1min"},
3: {market:"3", name:"WinGo 3min"},
4: {market:"5", name:"WinGo 5min"}
};


bot.onText(/\/predict (.+)/, async (msg, match)=>{

const chatId = msg.chat.id;
const choice = parseInt(match[1]);

if(!marketMap[choice]){
return bot.sendMessage(chatId,"❌ Invalid choice");
}

try{

const datas = await fetchPrediction(marketMap[choice].market);

const message = formatPrediction(datas,marketMap[choice].name);

bot.sendMessage(chatId,message,{parse_mode:"Markdown"});

}catch(e){

bot.sendMessage(chatId,"❌ Prediction error");

}

});


// =============================
// AUTO PREDICTIONS
// =============================

async function autoPrediction(market,marketName){

try{

const datas = await fetchPrediction(market);

const message = formatPrediction(datas,marketName);

bot.sendMessage(channelId,message,{parse_mode:"Markdown"});

}catch(e){

console.log("Auto prediction error",e);

}

}


// =============================
// AUTO TIMERS
// =============================

// WinGo 30s
setInterval(()=>{
autoPrediction("0.5","WinGo 30s");
},30000);


// WinGo 1min
setInterval(()=>{
autoPrediction("1","WinGo 1min");
},60000);


// WinGo 3min
setInterval(()=>{
autoPrediction("3","WinGo 3min");
},180000);


// WinGo 5min
setInterval(()=>{
autoPrediction("5","WinGo 5min");
},300000);


module.exports = bot;