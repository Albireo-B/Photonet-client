import * as Utils from './utils.js';

const ws = new WebSocket("ws://109.11.130.162:8083/serveur-java/endpoint");

$(document).ready(function()
{
 $("#show_login").click(function(){
  showpopup();
 });
 $("#close_login").click(function(){
  hidepopup();
 });
 
  $("form#loginform").submit(function(e) {
    e.preventDefault();
    var login = document.getElementById("login").value;
    var password = document.getElementById("password").value;
    Utils.setCookie("login", login);
    Utils.setCookie("password", password);
    Utils.sendLoginPassword(ws, login, password);
  });


  $('#doregister').click(function(){
    if (document.getElementById("CGU").checked){
      var login = document.getElementById("login").value;
      var password = document.getElementById("password").value;
      Utils.createLoginPassword(ws, login, password);
    }
   });
});

function goToHomePage() {
  window.location.href = "./dashboard.html";
}

ws.onopen = function (event) {
  console.log("It's alive !");

  var cookie_exist = Utils.tryConnect(ws);
  if (!cookie_exist) {
    showpopup();
  }
};

ws.onmessage=function(event) {
  console.log(event.data);

  var message = JSON.parse(event.data);
  console.log("Réception d'un message de type "+message.type+" depuis le serveur");

  switch(message.type) {
    case "identification":
      console.log("Message d'identification");
      switch(message.data.action) {
        case "good_login":
          console.log("Login effectué avec succès");
          goToHomePage();
          break;
        case "bad_login":
          console.log("Mauvais login/password");
          showpopup();
          break;
        case "good_register":
          console.log("Compte créé avec succès");
          var login = document.getElementById("login").value;
          var password = document.getElementById("password").value;
          Utils.setCookie("login", login);
          Utils.setCookie("password", password);
          Utils.sendLoginPassword(ws, login, password);
          break;
        case "bad_register":
          console.log("Impossible de créer ce compte");
          showpopup();
          break;
        default:
          console.log("L'action "+message.data.action+" n'est pas reconnue");
          break;
      }
      break;
    default:
      console.log("Message inconnu")
      break;
  }
}

function showpopup()
{
 $("#loginform").fadeIn();
 $("#loginform").css({"visibility":"visible","display":"block"});
}

function hidepopup()
{
 $("#loginform").fadeOut();
 $("#loginform").css({"visibility":"hidden","display":"none"});
}
