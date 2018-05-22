#!/bin/bash
tmpdir="./viewer/public/images/"
topic1="faces"
mkdir $tmpdir
while true
do
 ts=`date +"%s"`
 n_image="${topic1}.image.${ts}.jpg"
 echo "Creando las imagenes... Sonrie!!! "
 imagesnap -w 3 $tmpdir/$n_image
 echo "Done"
 echo "Enviando a Google Cloud Storage ..."
 gsutil cp $tmpdir/$n_image gs://findemortalksentiment
 echo "Esperando para la siguiente subida ..."
 sleep 5
done

