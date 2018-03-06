let playerTurn = 0;

let sendAjaxRequest = function (method, url, cb, data = '') {
  let req = new XMLHttpRequest();
  req.open(method, url);
  req.addEventListener('load', () => cb(req.responseText));
  req.setRequestHeader("Content-Type", "application/json");
  req.send(data);
};

const setCurrentPlayer = function (player) {
  let pd = document.querySelector('#current-player');
  playerTurn = player.character.turn;
  let name = player.character.name.replace(/[.\s]+/, '_');
  pd.innerHTML = `
  <span class="image"
  style="background-image: url('/images/cards/Character/${name}.jpg');"></span>
  <span>${player.name}</span>`;
  showPlayerCards(player.cards);
};

const showPlayerCards = function(cards){
  let cardsDiv = document.getElementById('cards');
  cards.forEach((card)=>{
    let cardName = card.name.replace(/[.\s]+/,'_');
    cardsDiv.innerHTML +=
    `<img src='/images/cards/${card.type}/${cardName}.jpg'/>`;
  });
};

const setOtherPlayer = function (player) {
  let name = player.character.name.replace(/[.\s]+/, '_');
  let color = player.character.color;
  document.querySelector('#all-players').innerHTML +=
  `<div id='turn_${player.character.turn}' class="player"
  style='border: 0.8px solid ${color};
  border-bottom: 4px solid ${color}'>
    <span class="image"
    style="background-image: url('/images/cards/Character/${name}.jpg');
    border: 2px solid ${color}">
    </span>
    <span>${player.name}</span>
  </div>`;
};

const objectValues = function (obj) {
  return Object.keys(obj).map(key => obj[key]);
};

const fillPlayerDetails = function (data) {
  let playerDetails = JSON.parse(data);
  let players = Object.keys(playerDetails);
  let playerId = getCookie('playerId');
  players.forEach(id => {
    let player = playerDetails[id];
    playerId == id && setCurrentPlayer(player);
  });
  objectValues(playerDetails)
    .sort((player1, player2) => {
      return player1.character.turn - player2.character.turn;
    })
    .forEach(setOtherPlayer);
};

const getPlayerDetails = function () {
  let url = getBaseUrl();
  sendAjaxRequest('get', `${url}/data`, fillPlayerDetails);
};

const disableRuleOut = function(){
  let messageBox = document.getElementById('message-box');
  messageBox.innerHTML = '';
  disablePopup();
};

const enableRuleOut = function(cards){
  let messageBox = document.getElementById('message-box');
  messageBox.innerHTML = 'Rule out suspicion using a highlighted card';
  let popup = document.getElementById('activity-box');
  let character = document.getElementById('character-card').
    setAttribute('style','opacity:0.3');
  let weapon = document.getElementById('weapon-card').
    setAttribute('style','opacity:0.3');
  let room = document.getElementById('room-card').
    setAttribute('style','opacity:0.3');
  cards.forEach(card=>{
    let cardName = card._name.replace(/[\s]+/,'_').toLowerCase();
    let image=document.getElementsByClassName(cardName)[0];
    if(image){
      image.setAttribute('style','opacity:');
      image.setAttribute('id',card._name);
      image.setAttribute('onclick',"highlightCard(event)");
    }
  });
  let div=`<div><button type='button' onclick=sendRuleOutCard('activity-box')>
  Confirm</button></div>`;
  popup.innerHTML+=div;
  enablePopup();
};

const sendRuleOutCard = function(parentId){
  let id = getHighlightedCard(parentId);
  if(id){
    ruleOutSuspicion(id);
  }
};

const getHighlightedCard = function(id){
  let element = document.getElementById(id);
  let highlightedCard = element.getElementsByClassName('highlight')[0];
  return highlightedCard && highlightedCard.id;
};

const getImages = function(cards){
  let images = '';
  cards.forEach(card=>{
    let name = card['_name'].replace(/[.\s]+/,'_');
    images += `<img
    src="/images/cards/${card._type}/${name}.jpg"
    name="${card._name}" id="${card._name}"
    onclick="highlightCard(event)"> </img>`;
  });
  return images;
};

const highlightCard = function(event){
  let id = event.target.id;
  let parent = document.getElementById(id).parentElement;
  let images = parent.querySelectorAll('img');
  images.forEach(image=>{
    let id = image.id;
    document.getElementById(id).className = '';
  });
  document.getElementById(id).className = 'highlight';
};

const showRuleOutCard = function(suspicion){
  let messageBox = document.getElementById('message-box');
  messageBox.innerHTML = `${suspicion.cancelledBy} has ruled out your suspicion
    using ${suspicion.ruleOutCard}`;
  let popup = document.getElementById('activity-box');
  let name = suspicion.ruleOutCard.replace(/[.\s]+/,'_');
  let type = suspicion.ruleOutCardType;
  let images = '<div id="ruledOutCard">';
  images += `<img src="/images/cards/${type}/${name}.jpg"></img>`;
  images+=`<button type="button" onclick="showPossibleOptions()">Ok
  </button></div>`;
  popup.innerHTML = `<div class="popup"> ${images} </div>`;
  enablePopup();
};

const removeTurnHighlight = function(){
  let players = document.querySelectorAll('.player');
  players.forEach(player=>{
    player.classList.remove('active-player');
  });
};

const getCookie = function (cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let index = 0; index < ca.length; index++) {
    let cookie = ca[index];
    while (cookie.charAt(0) == ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) == 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
};

window.onload = function () {
  sendAjaxRequest('get', '/svg/board.svg', (res) => {
    document.querySelector('#board').innerHTML = res;
    startStatusUpdater();
    getPlayerDetails();
    showBoardStatus();
  });
  let modal = document.getElementById('myModal');
};
