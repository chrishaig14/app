# App para ingresar puntos de interés

# Instalación

1) Instalar Node.js https://nodejs.org/en/
2) Ejecutar `npm install` desde el directorio del repositorio clonado
3) Ejecutar `npm start`. La app se ejecutará en http://localhost:3000.

# Funcionalidad

* Agregar puntos de interés completando el formulario. Las coordenadas pueden ser ingresadas manualmente o haciendo click en el mapa.
* Se listan todos los puntos de interés bajo el formulario. Desde allí se puede "Ir" al lugar (el mapa se centra en ese lugar) o "Borrar" el punto de interés.
* Haciendo click en los puntos marcados en el mapa, se resalta el lugar seleccionado en el mapa y en el listado de la izquierda. Además, se muestra un popup con los datos del punto de inteŕes.
* Se pueden guardar los puntos de interés creados en un archivo con "Guardar", y luego cargarlos con "Cargar archivo".

# 
La app utiliza ReactJS para la UI, y para el mapa usa la API ArcGIS https://developers.arcgis.com/.
Para utilizar la API desde la app se utiliza además `esri-loader` (https://github.com/Esri/esri-loader)
