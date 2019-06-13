import * as Utils from './utils.js';

const ws = new WebSocket("ws://109.11.130.162:8083/serveur-java/endpoint");
var username = Utils.getCookie("login");

ws.onopen = function (event) {
  console.log("It's alive !");
  Utils.tryConnect(ws);
};

ws.onmessage=function(event) {
  console.log(event.data);

  var message = JSON.parse(event.data);
  console.log("Réception d'un message de type "+message.type+" depuis le serveur");

  switch(message.type) {
    case "identification":
      switch(message.data.action) {
        case "good_login":
          console.log("Login effectué avec succès, demandes des albums accesibles");
          Utils.sendMessage(ws, "album", "get_my_albums", "");
          Utils.sendMessage(ws, "album", "get_my_shared_albums", "");
          Utils.sendMessage(ws, "album", "get_my_invitations", "");
          Utils.sendMessage(ws, "album", "get_my_suggested_invitations", "");
          Utils.sendMessage(ws, "album", "get_pending_invitations", "");
          var nom = document.createElement("p");
          nom.innerHTML = "Connecté en tant que  "+ username;
          var menu = document.getElementById("menu");
          menu.insertBefore(nom,document.getElementById("disconnect"));
          break;
        case "bad_login":
          console.log("Mauvais login/password");
          break;
        default:
          console.log("L'action "+message.data.action+" n'est pas reconnue");
          break;
      }
      break;
    case "album":
      switch(message.data.action) {
        case "my_album":
          addAlbum(message.data.idalbu,message.data.name,message.data.editors_nb);
          break;
        case "my_shared_album":
          addAlbum(message.data.idalbu,message.data.name,message.data.editors_nb,"AlbumsPartages");
          break;
        case "good_creation":
          window.location.href = "./editor.php?id="+message.data.idalbu;
          break;
        case "bad_creation":
          console.log("Erreur de création");
          break;
        case "remove_album":
          $('#Album'+message.data.idalbu).remove();
          break;
        case "my_invitation":
          addGuest(message.data.idalbu,message.data.name,message.data.origin,username,"InvitationsRecues");
          break;
        case "suggested_invitation":
          addGuest(message.data.idalbu,message.data.name,message.data.origin,message.data.guest,"InvitationsAAccepter");
          break;
        case "my_pending_invitation":
          addGuest(message.data.idalbu,message.data.name,username,message.data.guest,"InvitationsEnCours");
          break;
        case "remove_invitation":
          $("#guest"+message.data.idalbu+message.data.guest).remove();
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

$("form#createAlbum").submit(function(e) {
  e.preventDefault();
  console.log("demande de création d'un nouvel album");
  Utils.sendMessage(ws, "album", "create_album", '"name" :'+'"' + $("#text").val()+'"');
  document.getElementById("text").value = "";
});

function addAlbum(id,name,editors_nb,cible= "MesAlbums"){
  var albu = document.createElement("div");
  albu.classList.add("border");
  albu.classList.add("m-2");
  albu.classList.add("d-flex");
  albu.classList.add("border-dark");
  albu.id="Album"+id;

  var left = document.createElement("p");
  left.innerHTML = "nom : "+ name +" => ";
  albu.appendChild(left);

  var right = document.createElement("p");
  right.innerHTML = editors_nb +" Editeur(s)";
  albu.appendChild(right);

  var poubelle = document.createElement("img");
  poubelle.classList.add("btnCliquable");
  poubelle.id="poubelle"+id;
  poubelle.style.width = "30px";
  poubelle.style.height = "30px";
  if (cible == "MesAlbums"){
    poubelle.src = "images/poubelle.jpg";
  }else{
    poubelle.src = "images/croix.jpg";
  }

  albu.appendChild(poubelle);


  var bank = document.getElementById(cible);
  bank.appendChild(albu);

  $('#poubelle'+id).attr('alt',"poubelle")
  $('#poubelle'+id).css('cursor','pointer');
  $('#poubelle'+id).click(function(e){
    e.stopPropagation();
    Utils.sendMessage(ws, "album", "delete_album", "", id);
  });
  $('#Album'+id).css('cursor','pointer');
  $('#Album'+id).click(function(){
    window.location.href = "./editor.php?id="+id;
  });
}

function addGuest(idalbu,name, origin ,guest ,cible){
  var divguest = document.createElement("div");
  divguest.classList.add("border");
  divguest.classList.add("m-2");
  divguest.classList.add("d-flex");
  divguest.classList.add("border-dark");
  divguest.id="guest"+idalbu+guest;

  if (guest != username){
    var textguest = document.createElement("p");
    textguest.innerHTML = "Invitation adressée à "+ guest +". ";
    divguest.appendChild(textguest);
  }


  var textalbum = document.createElement("p");
  textalbum.innerHTML = " Album cible de la demande : " + name + ". ";
  divguest.appendChild(textalbum);

  if (origin != username){
    var textorigin = document.createElement("p");
    textorigin.innerHTML = " Utilisateur à l'origine de la demande : " + origin + ". ";
    divguest.appendChild(textorigin);

    var accept = document.createElement("img");
    accept.classList.add("btnCliquable");
    accept.id="accept"+idalbu+guest;
    accept.style.width = "30px";
    accept.style.height = "30px";
    accept.src = "images/coche.jpg";
    divguest.appendChild(accept);
  }

  var deny = document.createElement("img");
  deny.classList.add("btnCliquable");
  deny.id="deny"+idalbu+guest;
  deny.style.width = "30px";
  deny.style.height = "30px";
  deny.src = "images/croix.jpg";
  divguest.appendChild(deny);

  var bank = document.getElementById(cible);
  bank.appendChild(divguest);


  //si ce n'est pas une de nos demande en attente
  if (origin != username){
    $('#accept'+idalbu+guest).attr('alt',"accept")
    $('#accept'+idalbu+guest).css('cursor','pointer');
    //si ce n'est pas nous qui est invité
    if (guest != username){
      $('#accept'+idalbu+guest).click(function(e){
        Utils.sendMessage(ws, "album", "accept_invitation_proposal", '"guest" : "'+guest+'"', idalbu);
      });
    } else{
      $('#accept'+idalbu+guest).click(function(e){
        Utils.sendMessage(ws, "album", "accept_invitation", "" , idalbu);
      });
    }
  }

  $('#deny'+idalbu+guest).attr('alt',"accept")
  $('#deny'+idalbu+guest).css('cursor','pointer');
  //si ce n'est pas une de nos demande en attente
  if (origin != username){
    if (guest != username){
      $('#deny'+idalbu+guest).click(function(e){
        Utils.sendMessage(ws, "album", "refuse_invitation_proposal", '"guest" : "'+guest+'"', idalbu);
      });
    //si ce n'est pas nous qui est invité
    }else{
      $('#deny'+idalbu+guest).click(function(e){
        Utils.sendMessage(ws, "album", "refuse_invitation", "", idalbu);
      });
    }
  }else{
    $('#deny'+idalbu+guest).click(function(e){
      Utils.sendMessage(ws, "album", "cancel_pending_invitation", '"guest" : "'+guest+'"', idalbu);
    });
  }

}


$('#disconnect').click(function(){
  Utils.disconnect();
 });

// Utils.tryConnect(ws); // Pour essayer de se connecter au serveur
