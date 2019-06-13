import * as Utils from './utils.js';
//idalbu est défini dans le php
console.log("idalbu = "+idalbu);
//la page actuellement affiché à gauche
var currentLeftPage=1;

var numPageWhenElementSelected;
var owner = NaN;
var username = Utils.getCookie("login");

var lesCollabos=[];

var nbTotalPages=10;
//On crée 20 pages accessibles par les miniatures
createPages(nbTotalPages);


/// ------------------------ WS -------------------------
const ws = new WebSocket("ws://109.11.130.162:8083/serveur-java/endpoint");
var canvasEditPages = [];
var images;
var defaultText = "Cliquez pour écrire";

// Ajoute une méthode last() aux tableaux JavaScript pour accéder à leur dernier élément
if (!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

$('#disconnect').click(function(){
  Utils.disconnect();
 });


// Si on a appuyé sur suppr: envoie la
// demande de suppression au serveur
$(document).keyup(function(e){
    if(e.keyCode === 46){ // Si on appuye sur suppr
      var numPage;
      if (canvasEditPages[0].getActiveObject()) {
        numPage = 0;
      }
      else {
        numPage = 1;
      }
      var obj = canvasEditPages[numPage].getActiveObject();
      Utils.sendMessage(ws, "content", "remove", '"id": '+obj.id+', "page":' + (currentLeftPage+numPage),idalbu);
    }
});


// Supprime un élément de la page
function deleteElement(id, page) {
  var pageCanevas = (page-1)%2;
  var object;
  //on cherche le bon objet
  canvasEditPages[pageCanevas].forEachObject(function(obj) {
    if (obj.id!=NaN && obj.id === id) {
      console.log("suppression de l'élément avec l'id "+id+" sur la page "+page);
      //on le selectionne plus qu'on ne le supprime mais normalement c'est le seul avec cet id
      object = obj;
    }
  });
  //on le supprime si il existante
  if (object){
    object.remove();
  }

}
//déselectionnes tout les objets du canevas oposé à la page
function selectOnly(page){
  canvasEditPages[page%2].deactivateAll().renderAll();
  //canvasEditPages[page%2].discardActiveObject();
}

// Crée une nouvelle image
function createImage(posx, posy, id, path, page, scaleX = 1, scaleY = 1, angle = 0) {
  console.log("Création d'une image d'id "+id+" en ("+posx+":"+posy+") sur la page "+page);
  var pageCanevas = (page-1)%2;
  var img = document.getElementById(path);
  var newImage = new fabric.Image(img, {
        width: img.width,
        height: img.height,
        left: posx,
        top: posy,
        id : id,
        path : path,
        page : page,
        scaleX :scaleX,
        scaleY :scaleY,
        angle :angle
  });

  newImage.on('selected',function(){
    selectOnly(newImage.page);
    ask_update_users_selection(newImage.id, newImage.page,true);
  });

  newImage.on('deselected',function(){
    ask_update_users_selection(newImage.id, newImage.page,false);
  });

  canvasEditPages[pageCanevas].add(newImage);

  // On crée la fonction qui sera exécutée lorsque l'image sera modifié
  newImage.on('modified', function(obj){
    askImageUpdate(newImage.left, newImage.top, newImage.scaleX, newImage.scaleY, newImage.angle, newImage.id, newImage.page, newImage.path);
  });
}


// Crée une nouvelle zone de texte
function createText(posx, posy, id, page, text, scaleX = 1, scaleY = 1, angle = 0) {
  console.log("Création d'une zone de texte d'id "+id+" en ("+posx+":"+posy+") sur la page "+page);
  var pageCanevas = (page-1)%2;
  text=text.replace(/%n/g,"\n");
  var newText = new fabric.IText(text, {
      left: posx,
      top: posy,
      fontFamily: 'arial black',
      fill: '#333',
      fontSize: 50,
      id : id,
      page : page,
      scaleX :scaleX,
      scaleY :scaleY,
      angle :angle
    });

    newText.on('selected',function(){
      selectOnly(newText.page);
      ask_update_users_selection(newText.id, newText.page,true);
    });

    newText.on('deselected',function(){
      ask_update_users_selection(newText.id, newText.page,false);
    });

  canvasEditPages[pageCanevas].add(newText);



  // On crée la fonction qui sera exécutée lorsque le texte sera modifié
  newText.on('modified', function(obj){
    askTextUpdate(newText.left, newText.top, newText.scaleX, newText.scaleY, newText.angle, newText.id, newText.page, newText.text);
  });

}
//On demande au serveur une opération sur le contenu
function OperationOnContent(action, posx, posy, scaleX, scaleY, angle, id, page, name) {
  //pour que les retoures à la ligne entrent dans le tube ws, le formate
  name=name.replace(/\n/g,"%n");
  Utils.sendMessage(ws, "content", action, '"posx":'+posx+', "posy":'+posy+', "scaleX":'+scaleX+', "scaleY":'+scaleY+', "angle":'+angle+',"id":'+id+',"name":"'+name+'","page":'+page,idalbu);

}

// Demande au serveur de créer une image
function askImageCreation(posx, posy, id, path, page) {
  console.log("Demande au serveur de créer l'image ");
  OperationOnContent("create_image", posx, posy, 1, 1, 0, id, page, path);

}


// Demande au serveur de créer un texte
function askTextCreation(posx, posy, id, page, text) {
  console.log("Demande au serveur de créer le texte ");
  OperationOnContent("create_text", posx, posy, 1, 1, 0, id, page, text);

}


// Demande au serveur de faire des modifications sur une image
function askImageUpdate(posx, posy, scaleX, scaleY, angle, id, page, path) {
  console.log("Demande au serveur de modifier l'image ");
  OperationOnContent("update_image", posx, posy, scaleX, scaleY, angle, id, page, path);

}


// Demande au serveur de faire des modifications sur le texte
function askTextUpdate(posx, posy, scaleX, scaleY, angle, id, page, text) {
  console.log("Demande au serveur de modifier le texte ");
  OperationOnContent("update_text", posx, posy, scaleX, scaleY, angle, id, page, text);

}


// Modifie les propriétés d'une image existante
function updateImage(posx, posy, scaleX, scaleY, angle, id, page) {
  console.log("Modification d'une image d'id "+id+" en ("+posx+":"+posy+") sur la page "+page);
  var pageCanevas = (page-1)%2;
  canvasEditPages[pageCanevas].forEachObject(function(obj) {
    if (obj.id!=NaN && obj.id === id) {
        obj.scaleX=scaleX;
        obj.scaleY=scaleY;
        obj.left=posx;
        obj.top=posy;
        obj.angle=angle;
        obj.setCoords();
    }
  });

}


// Modifie les propriétés d'un texte existant
function updateText(posx, posy, scaleX, scaleY, angle, id, page, text) {
  console.log("Modification d'une zone de texte d'id "+id+" en ("+posx+":"+posy+") sur la page "+page);
  var pageCanevas = (page-1)%2;
  text=text.replace(/%n/g,"\n");
  canvasEditPages[pageCanevas].forEachObject(function(obj) {
    if (obj.id!=NaN && obj.id === id) {

        obj.scaleX = scaleX;
        obj.scaleY = scaleY;
        obj.left = posx;
        obj.top = posy;
        obj.angle = angle;


        obj.text = text;
        obj.setCoords();
    }
  });

}


// Supprime tous les objects des 2 canvas
function cleanPages(){
  var objets = [];
  for (var i=0;i<2;i++){
    canvasEditPages[i].forEachObject(function(obj) {
      objets.push(obj);
    });
  }
  for (var i=0;i<objets.length;i++){
    objets[i].remove();
  }

}


// Nettoie les pages puis
// Demande au serveur de nous resservir les pages
// et mets à jour notre banque d'image
function reload() {
  console.log("rafraichissement de la double page");
  Utils.sendMessage(ws, "refresh_canvas", "", '"page":'+currentLeftPage,idalbu);
}


// A l'ouverture du client WebSocket, on se connecte
ws.onopen = function (event) {
  console.log("Serveur websocket ouvert");
  Utils.tryConnect(ws); // On envoie notre login et notre mot de passe au serveur
};

//quand on clique sur upload, on execute une fonction php qui upload notre image sélectionné et renvoi le resultat
$("form#data").submit(function(e) {
    e.preventDefault();
    var formData = new FormData(this);

    $.ajax({
        url: "traitement.php",
        type: 'POST',
        data: formData,
        success: function (data) {
            console.log("Message reçu du script php :" + data);
            var parsed = parseInt(data,10);
            //si le resultat est un chemin on l'envoie au serveur pour l'ajouter
            if (!(isNaN(parsed))) {
              Utils.sendMessage(ws,"upload","",'"path":"'+parsed+'"',idalbu);
             }
        },
        cache: false,
        contentType: false,
        processData: false
    });
});

// ajoute une image à la banque d'image
function addImage(path){
    var divimg = document.createElement("div");
    divimg.classList.add("border");
    divimg.classList.add("m-2");
    divimg.classList.add("furniture");
    divimg.style.width = "125px";
    divimg.style.height = "100px";

    var img = document.createElement("img");
    img.id = path;
    img.style.display = "block";
    img.style.margin = "auto";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    img.src = "imported_images/"+path+".jpg";
    img.setAttribute('draggable', true);
    divimg.appendChild(img);

    var bank = document.getElementById("images");
    bank.appendChild(divimg);
    img.addEventListener('dragstart', handleDragStart, false);
    img.addEventListener('dragend', handleDragEnd, false);
}

function makeItRed(){
  var out = document.getElementById("chat");
  out.style.backgroundColor = "#B22222";
}
function makeItBlue(){
  var out = document.getElementById("chat");
  out.style.backgroundColor = "#007bff";
}

//Affichage d'un nouveau message sur le chat
function newMessage(id, message) {
  var cp = $(".user-message").length+1
  var out = document.getElementById("messages-area");
  var c = 0;
  var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;

  var messagediv = document.createElement("div");
  messagediv.id = "user-message";
  messagediv.classList.add("user-message");
  messagediv.classList.add("d-flex");

  var messagelog = document.createElement("div");
  messagelog.id = "user-icon";

  var plog = document.createElement("p");
  plog.innerHTML=id;
  plog.classList.add("text-dark");
  messagelog.appendChild(plog);

  var messagetex = document.createElement("div");
  messagetex.id = "user-text";

  var ptex = document.createElement("p");
  ptex.innerHTML=message;
  ptex.classList.add("text-dark");
  messagetex.appendChild(ptex);

  var messageint = document.createElement("div");

  var pint = document.createElement("p");
  pint.innerHTML=":";
  pint.classList.add("text-dark");
  messageint.appendChild(pint);


 //Si le message vient de cet utilisateur, alors on affiche le texte a gauche
  if (id==username){
    messagediv.classList.add("justify-content-end");
    messagediv.appendChild(messagetex);
    messagediv.appendChild(messageint);
    messagediv.appendChild(messagelog);
  }else{
    messagediv.classList.add("justify-content-start");
    messagediv.appendChild(messagelog);
    messagediv.appendChild(messageint);
    messagediv.appendChild(messagetex);
  }

  out.appendChild(messagediv);
  // scroll to bottom if isScrolledToBottom and the panel is open
  console.log("display : "+document.getElementById("Popup").style.display);
  if(isScrolledToBottom && document.getElementById("Popup").style.display != "none") {
    out.scrollTop = out.scrollHeight - out.clientHeight;
  }else{
    makeItRed();
  }
}


// A la réception d'un message depuis le serveur
ws.onmessage = function(event) {

  console.log(event.data);

  var message = JSON.parse(event.data);
  console.log("Réception d'un message de type "+message.type+" depuis le serveur");
  switch(message.type) {
    case "content":
      //si le contenu se trouve sur l'album sur la double page actuellement éditées par l'utilisateur
      if (message.data.idalbu==idalbu && (currentLeftPage==message.data.page || currentLeftPage+1==message.data.page)){

        switch(message.data.action) {
          case "create_image":
            createImage(message.data.posx, message.data.posy, message.data.id, message.data.name,  message.data.page,  message.data.scaleX, message.data.scaleY, message.data.angle);
            break;
          case "update_image":
            updateImage(message.data.posx, message.data.posy, message.data.scaleX, message.data.scaleY, message.data.angle, message.data.id, message.data.page);
            break;
          case "create_text":
            createText(message.data.posx, message.data.posy, message.data.id, message.data.page, message.data.name, message.data.scaleX, message.data.scaleY, message.data.angle);
            break;
          case "update_text":
            updateText(message.data.posx, message.data.posy, message.data.scaleX, message.data.scaleY, message.data.angle, message.data.id, message.data.page, message.data.name);
            break;
          case "remove":
            deleteElement(message.data.id, message.data.page);
            break;
          default:
            console.log("L'action "+message.data.action+" n'est pas reconnue");
            break;
        }
        updatePages(currentLeftPage);
        canvasEditPages[(message.data.page+1)%2].renderAll();
      }
      break;
    case "bank":
      if (message.data.idalbu==idalbu){
        switch(message.data.action) {
          case "add_image":
            addImage(message.data.path);
            break;
          default:
            console.log("L'action "+message.data.action+" n'est pas reconnue");
            break;
          }
      }
      break;
      case "album":
        if (message.data.idalbu==idalbu){
          switch(message.data.action) {
            case "album_name":
            var nom = document.createElement("p");
            nom.innerHTML = "Album : "+ message.data.name;
            nom.classList.add('border');
            nom.classList.add('border-dark');
            nom.style.textAlign = "center";
            var menuG = document.getElementById("listePages");
            menuG.insertBefore(nom,document.getElementById("pages"));
              break;
              case "owner":
                owner = message.data.login;
                console.log("owner : "+owner);
                Utils.sendMessage(ws, "album", "get_collabos", "",idalbu);
                setLock();
                break;
              case "add_collabo":
                  addCollabo(message.data.login);
                break;
              case "remove_collabo":
                  $('#collabo'+message.data.login).remove();
                break;
              case "bad_invite":
                var alert = document.createElement("p");
                alert.innerHTML = "Cet utilisateur n'as pas pu être invité ";
                alert.classList.add('border');
                alert.classList.add('alert');
                alert.classList.add('border-dark');
                alert.style.textAlign = "center";
                var partage = document.getElementById("Showshare");
                $(".alert").remove();
                partage.insertBefore(alert,document.getElementById("shareform"));
                break;
              case "good_invite":
                var alert = document.createElement("p");
                alert.innerHTML = "Cet utilisateur a été invité ";
                alert.classList.add('border');
                alert.classList.add('alert');
                alert.classList.add('border-dark');
                alert.style.textAlign = "center";
                var partage = document.getElementById("Showshare");
                $(".alert").remove();
                partage.insertBefore(alert,document.getElementById("shareform"));
                break;
            default:
              console.log("L'action "+message.data.action+" n'est pas reconnue");
              break;
            }
        }
        break;
    case "identification":
      switch(message.data.action) {
        case "good_login":
          console.log("Login effectué avec succès");
          Utils.sendMessage(ws, "refresh_bank", "", "",idalbu);
          Utils.sendMessage(ws, "album", "get_info_album", "",idalbu);
          break;
        case "bad_login":
          console.log("Mauvais login/password");
          break;
        default:
          console.log("L'action "+message.data.action+" n'est pas reconnue");
          break;
      }
      break;
    case "clean_page":
      cleanPages();
      updatePages(currentLeftPage);
      break;
    case "message":
      if (message.data.idalbu==idalbu){
        newMessage(message.data.id, message.data.message);
      }
      break;
    case "status_page":
      if (message.data.idalbu==idalbu && currentLeftPage==message.data.page){
        //vérifier lequel est vrai // TO DO
        if (message.data.action==1 || message.data.action=="true"){
          lockPages();
        } else if (message.data.action==0 || message.data.action=="false"){
          unlockPages();
        }
      }
      break;
  case "select":
      if (message.data.idalbu==idalbu && (currentLeftPage==message.data.page || currentLeftPage+1==message.data.page)){

        for (var num = 0; num < lesCollabos.length; num++) {
          if (lesCollabos[num]["login"]==message.data.login){
            if (message.data.selected == "true"){
              lesCollabos[num]["id"]=message.data.id;
              lesCollabos[num]["page"]=message.data.page;
            }else{
              lesCollabos[num]["id"]=NaN;
              lesCollabos[num]["page"]=NaN;
            }
            console.log("Selection de "+message.data.login+" modifié");
          }
        }
        update_users_selection();
      }
        break;
    case "end_refresh":
      reload();
      break;
    default:
      console.log("Le type de message "+message.type+" n'est pas reconnu");
      break;
  }

}

var imageOffsetX, imageOffsetY;


function handleDragStart(e) {
  images = document.querySelectorAll('.furniture img, #AjouterTexte');
  images.forEach(function(img) {
    img.classList.remove('img_dragging');
  });
  this.classList.add('img_dragging');

  var imageOffset = $(this).offset();
  imageOffsetX = e.clientX - imageOffset.left;
  imageOffsetY = e.clientY - imageOffset.top;
}
function handleDragEnd(e) {
}

/// --------------------- DRAG-DROP ----------------------
function initCanvas() {
  $('.canvas-container').each(function(index) {
    images = document.querySelectorAll('.furniture img, #AjouterTexte');
    var canvasContainer = $(this)[0];
    var canvasObject = $("canvas", this)[0];
    var url = $(this).data('floorplan');
    var canvas = window._canvas = new fabric.Canvas(canvasObject);
    canvasEditPages[index] = canvas;

    canvas.setHeight(560);
    canvas.setWidth(460);
    canvas.setBackgroundImage(url, canvas.renderAll.bind(canvas));

    function handleDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.dataTransfer.dropEffect = 'copy';
    }

    function handleDragEnter(e) {
      this.classList.add('over');
    }

    function handleDragLeave(e) {
      this.classList.remove('over');
    }

    function handleDrop(e) {
      e = e || window.event;
      if (e.preventDefault) {
        e.preventDefault();
      }
      if (e.stopPropagation) {
        e.stopPropagation();
      }

      var img = document.querySelector('.furniture img.img_dragging');
      var offset = $(canvasObject).offset();
      var posx = e.clientX - (offset.left + imageOffsetX);
      var posy = e.clientY - (offset.top + imageOffsetY);

      //On demande de créer l'élement
      // Si on drop du texte
      if (img.src.split("/").last() === "drop_text.png") {
        askTextCreation(posx, posy, 0,currentLeftPage+index, defaultText);
      } else { // Si on drop une image
        askImageCreation(posx, posy, 0, img.id, currentLeftPage+index);
      }
    }

    //handler for done modifying objects on canvas
    var modifiedHandler = function (evt) {
      var modifiedObject = evt.target;
      //console.log(modifiedObject.get('left'), modifiedObject.get('top'));
    };


    // On met en place l'écoute
    images.forEach(function(img) {
      img.addEventListener('dragstart', handleDragStart, false);
      img.addEventListener('dragend', handleDragEnd, false);
    });
    canvasContainer.addEventListener('dragenter', handleDragEnter, false);
    canvasContainer.addEventListener('dragover', handleDragOver, false);
    canvasContainer.addEventListener('dragleave', handleDragLeave, false);
    canvasContainer.addEventListener('drop', handleDrop, false);
  });
}



initCanvas();

$('#reload').click(reload);

//----------- gestion du chat ---------------
$("form#message").submit(function(e) {
  e.preventDefault();
  Utils.sendMessage(ws, "message", "", '"id":"' + username +'", "message":"'+document.getElementById("posttext").value+'"',idalbu);
  document.getElementById("posttext").value = "";
});


$(".popup").hide();

// Quand l'utilisateur clique sur .popup, on affiche le chat
$('#chat').click(function() {
  makeItBlue();
  $('.popup').toggle("show");
});

$('#chat').css('cursor','pointer');

$(document.body).click( function() {
   $('#Popup').hide();
   $('#ShowList').hide();
   $('#Showshare').hide();
});

$(".popupContainer").click( function(e) {
    e.stopPropagation();
});

//----------- fin de la gestion du chat ---------------

//----------- gestion de la liste des collabos ---------------

$(".showList").hide();

// Quand l'utilisateur clique sur .popup, on affiche le chat
$('#collabList').click(function() {
  $('.showList').toggle("show");
});

$('#collabList').css('cursor','pointer');


$(".listContainer").click( function(e) {
    e.stopPropagation();
});

function addCollabo(login){
  var user = document.createElement("div");
  user.classList.add("m-2");
  user.classList.add("d-flex");
  user.id = "collabo"+login;

  var name = document.createElement("p");
  name.innerHTML = login;
  user.appendChild(name);

  if (owner == username && username!=login){
    var croix = document.createElement("img");
    croix.classList.add("btnCliquable");
    croix.id="croix"+login;
    croix.style.width = "30px";
    croix.style.height = "30px";
    croix.src = "images/croix.jpg";
    user.appendChild(croix);
  }

  var listCollabo = document.getElementById("nameList");
  listCollabo.appendChild(user);

  $('#croix'+login).attr('alt',"supprimer")
  $('#croix'+login).css('cursor','pointer');
  $('#croix'+login).click(function(e){
    e.stopPropagation();
    Utils.sendMessage(ws, "album", "delete_collabo", '"login" :'+'"' + login+'"', idalbu);
  });


    var color;
    var colorUnique=false;
    while (!(colorUnique)){
      colorUnique=true;
      color=getRandomColor();
      for (var i = 0; i < lesCollabos.length; i++) {
        if (lesCollabos[i]["color"]==color){
          colorUnique=false;
        }
      }
    }
    var collabo = [];
    collabo["login"]=login;
    collabo["color"]=color;
    lesCollabos.push(collabo);
    //On ecrit le nom des collaborateurs dans leurs couleurs
    $("#collabo"+login).first().css("color",collabo["color"]);
}

//----------- fin de la gestion de la liste des collabos ---------------

//----------- gestion du partage ---------------
$("form#shareform").submit(function(e) {
  e.preventDefault();
  Utils.sendMessage(ws, "album", "invite_collabo", '"login":"' + document.getElementById("logintext").value +'"',idalbu);
  document.getElementById("logintext").value = "";
});

$(".showshare").hide();

// Quand l'utilisateur clique sur .popup, on affiche le chat
$('#shareList').click(function() {
  $('.showshare').toggle("show");
});

$('#shareList').css('cursor','pointer');


$(".shareContainer").click( function(e) {
    e.stopPropagation();
});

//----------- fin de la gestion du partage ---------------

// GESTION DES MINIATURES DES PAGES


function updatePages(numPage){

  var doublePage=parseInt(numPage/2)+1;

  var messagePages=document.createElement("div");
  messagePages.id="deuxPages"+doublePage;
  messagePages.classList.add("d-flex");
  messagePages.classList.add("justify-content-between");

  html2canvas($('#pageG'), {
      onrendered: function(canvas) {
        var pageGauche = canvas.toDataURL("image/png");
        var messagediv = document.createElement("div");
        messagediv.id = "premièrePage"+numPage;
        messagediv.classList.add("border");
        messagediv.classList.add("border-secondary");
        messagediv.classList.add("m-2");
        var image=new Image();
        image.src=pageGauche;
        messagediv.append(image);
        //Afin d'éviter le problème d'asynchronisation
        //sur les fonctions html2canvas
        messagePages.insertBefore(messagediv,messagePages.firstChild);
        }
  });


  html2canvas($('#pageD'), {
      onrendered: function(canvas) {
        var pageDroite = canvas.toDataURL("image/png");
        var messagediv2 = document.createElement("div");
        messagediv2.id = "deuxièmePage"+(numPage+1);
        messagediv2.classList.add("border");
        messagediv2.classList.add("border-secondary");
        messagediv2.classList.add("m-2");
        var image=new Image();
        image.src=pageDroite;
        messagediv2.append(image);
        messagePages.append(messagediv2);
        }
  });


  $("#deuxPages"+doublePage).remove();
  if (numPage!=1){
    $("#deuxPages"+(doublePage-1)).after(messagePages);
  }else{
    $("#deuxPages"+(doublePage+1)).before(messagePages);
  }

  $("#deuxPages"+doublePage).click(function(){
    //Changement de page actuelle
    currentLeftPage=numPage;
    //rafraichissement des pages sur lesquelles on arrive
    reload();
    console.log("Passage a la page "+numPage+",à la miniature/double page "+ doublePage);
  });
}

function fastPagesUpdate(){
  var tempPage=1;
  fastPagesUpdateWorker(tempPage);
}

function fastPagesUpdateWorker(tempPage){
  if (tempPage>nbTotalPages){
    setTimeout(function(){
      currentLeftPage=1;
      reload();
    },1000);
  }else{
    setTimeout(function(){
      currentLeftPage=tempPage;
      reload();
      fastPagesUpdateWorker(tempPage+2);
    },750);
  }
}


function createPages(nbPage){
  for (var tab = [],i=1; i <= nbPage/2; i++) {
      tab[i]=i;
  }
  tab.forEach (function(doublePage) {

      var page=doublePage*2;

      var messagePages=document.createElement("div");
      messagePages.id="deuxPages"+doublePage;
      messagePages.classList.add("d-flex");
      messagePages.classList.add("justify-content-between");

      var messagediv = document.createElement("div");
      messagediv.id = "premièrePage"+(page-1);
      messagediv.classList.add("border");
      messagediv.classList.add("border-secondary");
      messagediv.classList.add("m-2");
      var image=new Image();
      messagediv.append(image);
      messagePages.append(messagediv);


      var messagediv2 = document.createElement("div");
      messagediv2.id = "deuxièmePage"+page;
      messagediv2.classList.add("border");
      messagediv2.classList.add("border-secondary");
      messagediv2.classList.add("m-2");
      var image=new Image();
      messagediv2.append(image);
      messagePages.append(messagediv2);

      $("#pages").append(messagePages);
      $("#deuxPages"+doublePage).click(function(){
        //Changement de page actuelle
        currentLeftPage=page-1;
        //rafraichissement des pages sur lesquelles on arrive
        reload();
        console.log("Passage a la page "+(page-1)+",à la miniature/double page "+ doublePage);
      });
  });
}


$( document ).ready(function(){
  fastPagesUpdate(nbTotalPages);
  $('input[type="file"]').change(function(e){
            $("form#data").submit()
        });
});



// ----- FIN DE LA GESTION DES MINIATURES DES PAGES ET DE LEUR UPDATE---


// ----- DEBUT DE LA GESTION DU LOCK DES PAGES PAR LE PROPRIETAIRE ---

function setLock(){

  if (username==owner){

    //On ne peut pas unlock sans avoir lock (inutile)
    $("#unlock").css("opacity","0.5");
    $("#lock").css("cursor","pointer");

    $("#lock").click(function(){
      Utils.sendMessage(ws, "status_page",true,'"page" :'+'"' + currentLeftPage+'"',idalbu);
    });

    $("#unlock").click(function(){
      Utils.sendMessage(ws, "status_page",false,'"page" :'+'"' + currentLeftPage+'"',idalbu);
    });
  }
}
  function lockPages(){
    if (username==owner){
      $("#lock").css("opacity","0.5");
      $("#lock").css("cursor","auto");
      $("#unlock").css("opacity","1");
      $("#unlock").css("cursor","pointer");
    } else {
      $("#unlock").css("opacity","0");
      $("#lock").css("opacity","1");
    }
    $("#pageG").css("pointer-events","none");
    $("#pageD").css("pointer-events","none");
  }

  function unlockPages(){
    if (username==owner){
      $("#unlock").css("opacity","0.5");
      $("#unlock").css("cursor","auto");
      $("#lock").css("opacity","1");
      $("#lock").css("cursor","pointer");
    }else{
      $("#unlock").css("opacity","1");
      $("#lock").css("opacity","0");
    }
    $("#pageG").css("pointer-events","auto");
    $("#pageD").css("pointer-events","auto");
  }


// ----- FIN DE LA GESTION DU LOCK DES PAGES PAR LE PROPRIETAIRE ---



// ------ DEBUT DE LA GESTION DES COULEURS EN MULTIUSERS ----


function ask_update_users_selection(idElem,page, selected){

  Utils.sendMessage(ws,"select","",'"page" : '+page+',"id" : '+idElem+',"selected" : '+' "'+selected+'"',idalbu);
}

//Nous renvoie une couleur aléatoire
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function update_users_selection(){
  //On enlève le surlignage de chaque objet
  for (var i=0;i<2;i++){
    canvasEditPages[i].forEachObject(function(obj) {
      obj.set({stroke : "white", strokeWidth: 0});
    });
  }
  //puis pour chaque page courante, pour chaque utilisateur, si il est sur cette page on surligne l'objet qu'il a sélectionné
  for (var i=0;i<2;i++){
    for (var name = 0; name < lesCollabos.length; name++) {
      if ((lesCollabos[name]["page"]+1)%2==i){
        canvasEditPages[i].forEachObject(function(obj) {
          if (obj.id!=NaN && obj.id == lesCollabos[name]["id"]) {
            obj.set({stroke : lesCollabos[name]["color"], strokeWidth: 0.5});
          }
        });
      }
    }
    canvasEditPages[i].renderAll();
  }
}


// ------ FIN DE LA GESTION DES COULEURS EN MULTIUSERS ---
