const fs = require("fs");

const USERS_FILE = "./users.json";

function getUsers(){

if(!fs.existsSync(USERS_FILE)){
fs.writeFileSync(USERS_FILE,"[]");
}

return JSON.parse(fs.readFileSync(USERS_FILE));

}

function addUser(id){

let users = getUsers();

if(!users.includes(id)){
users.push(id);
fs.writeFileSync(USERS_FILE,JSON.stringify(users));
}

}

module.exports = { getUsers, addUser };