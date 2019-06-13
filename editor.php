<!DOCTYPE html>
<html lang="en" >

<head>
  <meta charset="UTF-8">
       <title>Edition d'album</title>
       <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/fullPage.js/2.9.2/jquery.fullPage.min.css'>
       <link rel="stylesheet" href="css/editeur.css">
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- Latest compiled and minified CSS -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <!-- jQuery library -->
        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
        <!-- Latest compiled JavaScript -->
        <!-- Notre fichier Javascript -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
        <script src="https://cdn.bootcss.com/html2canvas/0.5.0-beta4/html2canvas.js"></script>
   </meta>
</head>
<body>
  <div id="ConteneurPrimaire" class="d-flex ">
      <script type="text/javascript">
        var idalbu = "<?=$_GET['id'];?>";
      </script>
      <div id="menu" class="d-flex ">
        <a href="dashboard.html"><img src="images/logo-photoweb-responsive.png" class="mr-5" alt="logo" /></a>
        <nav class="mt-5 ml-5 d-flex" id="liste">
          <div class="furniture">
            <img src="images/drop_text.png" draggable="true" id="AjouterTexte"/ width="200" height="50">
          </div>
          <!--<input type="button" class="btn-secondary mx-2 ml-5" id="AjouterTexte" value="Ajout texte" draggable="true"/>-->
          <input type="button" class="btn btn-primary mx-2" value="Recharger" id="reload"/>
          <input type="button" class="btn btn-secondary mx-2" value="Menu d'édition contextuel" disabled/>
          <input type="button" class="btn btn-secondary mx-2" value="Propriétés page" disabled/>

          <div class="listContainer">
            <input id="collabList" type="button" class="btn btn-primary mx-2" value="Liste des collaborateurs"/>
              <span class="showList" id="ShowList">
                <p>La liste des participants</p>
                <div class="nameList" id="nameList">

                </div>
              </span>
            </div>

            <div class="shareContainer">
              <input id="shareList" type="button" class="btn btn-primary mx-2" value="Partager"/>
                <span class="showshare" id="Showshare" >
                  <p>Invitez un utilisateur Photoweb à éditer cet album :</p>
                  <form id="shareform" class="d-flex" enctype="multipart/form-data"  method="post">
                    <label for="logintext" class="m-2" title="login :">login :</label>
                    <input type="text" id="logintext">
                    <input type="submit" name="submit" value="Inviter" class="m-1 btn btn-secondary" />
                  </form>
                </span>
              </div>

          <input type="button" class="btn btn-secondary mx-2" value="Acheter" disabled/>
          <input type="button" id="disconnect" class="btn btn-primary mx-2" value="Déconnexion"/>
        </nav>

      </div>


        <div class="d-flex justify-content-between" id ="premierConteneur">

              <div id="listePages" class="mt-2">
                <div id="pages" class="border border-dark overflow-auto mb-2">




                </div>
                <div class="d-flex" id="boutonsVue">
                  <button type="button" class="btn btn-secondary  mx-1 float-left w-50" disabled>Vue simple</button>
                  <button type="button" class="btn btn-secondary  mx-1 float-right w-50" disabled>Vue étendue</button>
                </div>
              </div>



              <div id="pageAffichée" class="mx-3 mw-100 mt-2">

                <div id="mesDeuxPages" class='d-flex justify-content-between'>
                  <div id="pageG" class="canvas-container border border-dark  float-left mb-2 ml-3" ><canvas></canvas> </div>
                  <img src="images/lock.jpg" id="lock" alt="lock" width="30" height="30">
                  <img src="images/unlock.png" id="unlock" alt="unlock" width="23" height="25">
                  <div id="pageD" class="canvas-container border border-dark  float-right mb-2 mr-3" >   <canvas></canvas> </div>
                </div>
                <input id="Prévisualiser" type="button" class="btn btn-secondary float-left  ml-3" value="Prévisualiser" disabled/>


                <div class="popupContainer">
                  <input id="chat" type="button" class="btn btn-primary mr-3" value="chat"/>
                    <span class="popup" id="Popup">
                      <div id="chat-wrap">
                        <div id="messages-area" class="mb-2 overflow-auto">
                        </div>
                        <form id="message" class="d-flex" enctype="multipart/form-data"  method="post">
                          <label for="posttext" class="m-2" title="Message : ">Message : </label>
                          <input type="text" id="posttext">
                          <input type="submit" name="submit" value="Envoyer" class="m-1 btn btn-secondary" />
                        </form>
                      </div>
                    </span>
                  </div>

              </div>


              <div id="listeimages" class="mt-2">
                <button type="button" class="btn btn-primary float-center w-100" disabled>Menu ressources</button>
                <div class="d-flex">
                  <button type="button" class="btn btn-primary m-1 float-left w-50" disabled>Images album</button>
                  <button type="button" class="btn btn-secondary m-1 float-left w-50" disabled>Mes images</button>
                </div>


                <div id="images" class="d-flex flex-wrap border border-dark overflow-auto mb-2">
                </div>


              <div>
                <form id="data" enctype="multipart/form-data"  method="post">
                    <label for="fichier_a_uploader" title="Recherchez le fichier à uploader !">Importer :</label>
                    <input type="hidden" name="MAX_FILE_SIZE" value="<?php echo MAX_SIZE; ?>" />
                    <input name="fichier" type="file" id="fichier_a_uploader" />
               </form>
              </div>
              <div id="cacheparent" >
                  <input id="cache" type="button" class="btn btn-primary mr-3" value="Choisir une image à importer"/>

              </div>
            </div>
      </div>
    </div>
  </body>

<footer>



</footer>
</html>

<script src='https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/fullPage.js/2.9.2/jquery.fullPage.min.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/fabric.js/1.7.6/fabric.min.js'></script>
<script type="module" src="js/editor.js"></script>


</body>

</html>
