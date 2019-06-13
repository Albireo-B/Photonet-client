<?php
// Constantes
define('TARGET', 'imported_images/');    // Repertoire cible
define('MAX_SIZE', 10000000000);    // Taille max en octets du fichier
define('WIDTH_MAX', 8000);    // Largeur max de l'image en pixels
define('HEIGHT_MAX', 8000);    // Hauteur max de l'image en pixels

// Tableaux de donnees
$tabExt = array('jpg','png','jpeg');    // Extensions autorisees
$infosImg = array();

// Variables
$extension = '';
$message = '';
$nomImage = '';

/************************************************************
 * Creation du repertoire cible si inexistant
 *************************************************************/
if( !is_dir(TARGET) ) {
  if( !mkdir(TARGET, 0755) ) {
    exit('Erreur : le répertoire cible ne peut-être créé ! Vérifiez que vous diposiez des droits suffisants pour le faire ou créez le manuellement !');
  }
}

/************************************************************
 * Script d'upload
 *************************************************************/
if(!empty($_POST))
{
  // On verifie si le champ est rempli
  if( !empty($_FILES['fichier']['name']) )
  {
    // Recuperation de l'extension du fichier
    $extension  = pathinfo($_FILES['fichier']['name'], PATHINFO_EXTENSION);
    // On verifie l'extension du fichier
    if(in_array(strtolower($extension),$tabExt))
    {
      // On recupere les dimensions du fichier
      $infosImg = getimagesize($_FILES['fichier']['tmp_name']);

      // On verifie le type de l'image
      if($infosImg[2] >= 1 && $infosImg[2] <= 14)
      {
        // On verifie les dimensions et taille de l'image
        if(($infosImg[0] <= WIDTH_MAX) && ($infosImg[1] <= HEIGHT_MAX) && (filesize($_FILES['fichier']['tmp_name']) <= MAX_SIZE))
        {
          // Parcours du tableau d'erreurs
          if(isset($_FILES['fichier']['error'])
            && UPLOAD_ERR_OK === $_FILES['fichier']['error'])
          {
            $directory = '/var/www/images';
            $files = scandir($directory);
            $num_files = count($files)-2;
            // On renomme le fichier
            $nomImage = $num_files .'.'. 'jpg';
            // Si c'est OK, on teste l'upload
            if(move_uploaded_file($_FILES['fichier']['tmp_name'], TARGET.$nomImage))
            {
              echo $num_files;
            }
            else
            {
              // Sinon on affiche une erreur systeme
              echo 'Problème lors de l\'upload !';
            }
          }
          else
          {
           echo 'Une erreur interne a empêché l\'uplaod de l\'image';
          }
        }
        else
        {
          // Sinon erreur sur les dimensions et taille de l'image
         echo 'Erreur dans les dimensions de l\'image !';
        }
      }
      else
      {
        // Sinon erreur sur le type de l'image
        echo 'Le fichier à uploader n\'est pas une image !';
      }
    }
    else
    {
      // Sinon on affiche une erreur pour l'extension
      echo 'L\'extension du fichier est incorrecte !';
    }
  }
  else
  {
    // Sinon on affiche une erreur pour le champ vide
    echo 'Veuillez remplir le formulaire svp !';
  }
}
else{
  echo 'Methode post empty!';
}
?>
