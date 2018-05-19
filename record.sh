#!/bin/bash
tmpdir="./images/"
mkdir $tmpdir
while true
do
 ts=`date +"%s"`
 n_image="$1.image.${ts}.jpeg"
 echo "Creando las imagenes... Sonrie!!! "
 imagesnap -w 3 $tmpdir/$n_image
 echo "Done"
 echo "Enviando a Google Cloud Storage ..."
 gsutil cp $tmpdir/$n_image gs://findemortalksentiment
 echo "Esperando para la siguiente subida ..."
 sleep 5
done

