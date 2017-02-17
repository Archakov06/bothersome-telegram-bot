var TelegramBot = require('node-telegram-bot-api');
var config = require('./config');
var fs = require('fs');
var bot = new TelegramBot(config.token, {polling: true});

var users = [];

function getRandomSticker(){
  var arr = fs.readdirSync('./stickers').filter(function(file){
    return file.indexOf('.webp') >= 0;
  });
  return './stickers/' + arr[ Math.floor( Math.random() * arr.length ) ];
}

function createUser(uid, props){
  users.push(Object.assign({ id:uid, stop: false, }, props));
}

function getUser(uid){
  for (var i = 0; i < users.length; i++){
    if (users[i].id == uid) {
      return users[i];
    }
  }
  return false;
}

function setUser(uid, props){
  var user = getUser(uid);
  if (!user || !users.length) createUser(uid, props);
  users.forEach(function(user){
    if (user.id == uid) Object.assign(user, props);
  });
}

function startAnnoy(uid){
  bot.sendSticker(uid, getRandomSticker());
}

function disableStop(uid){
  setUser(uid, {stop: false});
}

bot.onText(/разбуди меня в (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var time = match[1];
  setUser(fromId, {time: time});
  bot.sendMessage(fromId, 'Замётано! 🌝 Я буду тебя доставать каждый день в "' + time + '"!');
});

bot.onText(/стоп/, function (msg, match) {
  var fromId = msg.from.id;
  config.stopDisabled = true;
  if (!config.stopDisabled) setUser(fromId, {stop: true}); else {
    bot.sendSticker(fromId, './stickers/pls_stop.webp');
  }
});

bot.onText(/пожалуйста остановись/, function (msg, match) {
  var fromId = msg.from.id;
  config.stopDisabled = false;
  setUser(fromId, {stop: true});
  bot.sendSticker(fromId, './stickers/gatsby.webp');
  bot.sendMessage(fromId, 'Ну ладно)00))) 😉');
});

setInterval(function(){
  var currentTime = (new Date().getHours() <= 9 ? '0' + new Date().getHours() : new Date().getHours()) + ':' + (new Date().getMinutes() <= 9 ? '0' + new Date().getMinutes() : new Date().getMinutes());
  users.forEach(function(user){
    if (user.time == currentTime && !user.stop) startAnnoy(user.id);
  });
}, 5000);
