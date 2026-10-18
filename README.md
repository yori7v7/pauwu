# Un pequeño universo para Pau

Una carta de cumpleaños hecha con HTML, CSS y JavaScript, con una colección de fotos, un video, música y un pequeño deseo al final. Adaptable a teléfonos, tabletas y pantallas grandes.

La entrada «Abrir mi sorpresa» abre la carta e inicia la canción en el mismo gesto. El reproductor permite pausarla y volver a reproducirla. Las fuentes están incluidas en el proyecto para evitar depender de servicios externos durante la visita.

Los recuerdos se presentan como una pila de fotos: avanzan suavemente mientras están a la vista y también se pueden recorrer con flechas, teclado o deslizando en el teléfono. El video de la paleta aparece al final y comienza en silencio; «escuchar este recuerdo» activa su audio y pausa la canción hasta que termina. Se respeta la preferencia de movimiento reducido.

## Ver en tu computadora

Desde esta carpeta, ejecuta `python -m http.server 4173` y visita `http://localhost:4173`.

## Publicación

El workflow `.github/workflows/pages.yml` publica en GitHub Pages con cada cambio en `main`. En la configuración del repositorio, el origen de Pages debe ser **GitHub Actions**.

Las fotografías, el video, el texto de la carta y el audio fueron proporcionados por el autor del regalo. Las fuentes Cormorant Garamond y DM Sans se distribuyen bajo sus licencias OFL incluidas en `assets/fonts/`.
