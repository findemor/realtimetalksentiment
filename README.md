# realtimetalksentiment

Near Real Time Talks Sentiment using Google Cloud Vision API 


# Prerequisitos

## Configuración

Crear el proyecto en Google Cloud Platform
Habilitar Google Vision API
Crear un segmento (p.ej. findemortalksentiment, Coldline) en el Storage del proyecto


## Instalar [ImageSnap](http://iharder.sourceforge.net/current/macosx/imagesnap/)

Herramienta en linea de comandos para tomar capturas con la webcam.
Descomprimir en /usr/local/bin, por ejemplo

```
> tar -xvzf ImageSnap-v0.2.5.tgz
> mv ImageSnap-v0.2.5/* /usr/local/bin/
```

## Instalar el SDK de [Google Cloud Platmform](https://cloud.google.com/sdk/?hl=es)

Interfaz de linea de comandos para productos y servicios de Google Cloud Platform

```
# ejecutar install.sh y seguir las instrucciones
# iniciar una nueva terminal
> gcloud init
```

Instalar el Google Cloud SDK para storage (gsutil)

```
> curl https://sdk.cloud.google.com | bash
> exec -l $SHELL
# Reiniciar shell
> gcloud init
```



