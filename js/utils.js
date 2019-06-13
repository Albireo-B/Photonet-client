// Enregistre une valeure cvalue dans un cookie pour une certaine durée
export function setCookie(cname, cvalue, exdays = 100) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function sendMessage(ws, type, action, args, idalbu=0) {
  var virgule = '';
  if (args !== "") { // On rajoute une virgule
    virgule = ', ';
  }
  var message = '{"type": "'+type+'", "data": {"action": "'+action+'", "idalbu":'+idalbu+virgule+args+'}}';
  console.log("Envoi d'un message de type "+type+" et d'action "+action);
  //console.log(message);
  ws.send(message);
}

// Donne la valeur d'un Cookie
export function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Regarde si on a déja le cookie avec le nom d'utilisateur et le mot de passe,
// si oui essaie de se connecter et return true, sinon return false
export function tryConnect(ws) {
  var login = getCookie("login");
  var password = getCookie("password");

  var cookiesExists = (login != "" && password != "");

  if (cookiesExists) {
    sendLoginPassword(ws, login, password);
  }
  return cookiesExists;
}

// Send login and password to the server to check validity
export function sendLoginPassword(ws, login, password) {
  sendMessage(ws, "identification", "login", '"login":"'+login+'", "password":"'+password+'"');
}

export function createLoginPassword(ws, login, password) {
  sendMessage(ws, "identification", "register", '"login":"'+login+'", "password":"'+password+'"');
}

export function disconnect() {
  setCookie("login", "");
  setCookie("password", "");
  window.location.href = "./index.html";
}
