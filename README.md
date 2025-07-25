# Calculadora de Precios Hub Cursos

Este proyecto es una aplicación web para la gestión y cotización de cursos, diseñada para funcionar tanto online como offline (PWA). Incluye un frontend en Next.js y un backend en Node.js con LowDB.

## Tecnologías utilizadas

- **Frontend**
  - [Next.js](https://nextjs.org/): Framework de React para aplicaciones web modernas.
  - **Sass/SCSS**: Preprocesador CSS para estilos globales y modulares.
  - **PWA (Progressive Web App)**: Soporte offline usando [next-pwa](https://github.com/shadowwalker/next-pwa) y Service Worker personalizado.
  - **React**: Librería para la construcción de interfaces de usuario.
- **Backend**
  - [Node.js](https://nodejs.org/): Entorno de ejecución para JavaScript en el servidor.
  - [Express](https://expressjs.com/): Framework para crear APIs REST.
  - [LowDB](https://github.com/typicode/lowdb): Base de datos ligera basada en archivos JSON.
  - **CORS**: Middleware para permitir peticiones entre frontend y backend.
- **Otros**
  - **Workbox**: Utilizado para estrategias de caché en el Service Worker.
  - **SQLite3** (opcional): Incluido en dependencias, pero el almacenamiento principal es LowDB.

## Estructura del proyecto
```bash
calculadora-precios/
├── backend/
│   ├── server.js
│   ├── database.json
│   └── package.json
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── styles/
│   ├── worker.js
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
└── README.md
```

## Requisitos previos

- [Node.js](https://nodejs.org/) (v16 o superior recomendado)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

## Instalación y ejecución local

### 1. Clona el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd calculadora-precios
```

2. Instala dependencias
Backend
```bash
cd backend
npm install
```

Frontend
```bash
cd ../frontend
npm install
```

3. Ejecuta el backend
```bash
cd backend
node server.js
```

El backend estará disponible en http://localhost:3001.

4. Ejecuta el frontend
```bash
# En otra terminal:
cd frontend
npm run dev
```

El frontend estará disponible en http://localhost:3000.

5. Acceso offline (PWA)
Puedes instalar la app como PWA desde el navegador.
Si pierdes conexión, la sección de ventas seguirá disponible offline.
Notas
El backend utiliza un archivo database.json para almacenar los datos.
La contraseña de administrador por defecto es: hub2025.
Para producción, ejecuta npm run build y npm start en el frontend.



## Pasos para Subir con FileZilla Solamente

1. Prepara tus Archivos Localmente

Este paso es crítico porque si no tienes acceso SSH, no podrás instalar dependencias en el servidor.

    Para el Frontend (Next.js PWA):
    Bash

cd frontend
npm install  # Asegúrate de tener todas las dependencias instaladas
npm run build # Esto creará la carpeta .next y actualizará la carpeta public

Después de esto, la carpeta frontend/.next y frontend/public contienen todo lo que necesitas para el frontend.

Para el Backend (Node.js API):
Bash

    cd backend
    npm install # ¡IMPORTANTE! Esto instalará todas las dependencias (express, cors, lowdb) en la carpeta node_modules del backend.

    Dado que no puedes ejecutar npm install en el servidor, DEBES subir la carpeta node_modules del backend. Esto hará que la subida sea más lenta, pero es necesario.

2. Conéctate con FileZilla (usando SFTP)

Asegúrate de usar SFTP (SSH File Transfer Protocol) para una conexión segura.

    Host: sftp://tu_dominio.com o sftp://tu_ip_del_servidor

    Username: Tu nombre de usuario del panel de control o SSH.

    Password: Tu contraseña.

    Port: Generalmente 22 (por defecto para SFTP/SSH).

3. Sube el Frontend (Next.js PWA)

Tu frontend se servirá desde https://pages.elhubdeseguridad.com/calculapp/.

    Navega al directorio raíz de tu sitio web en el servidor. Esto podría ser /var/www/html/, public_html/, o una carpeta similar dependiendo de tu hosting.

    Crea la carpeta calculapp: Dentro de la carpeta raíz de tu sitio, crea un nuevo directorio llamado calculapp.

    Sube los archivos del Frontend:

        Desde tu máquina local, ve a la carpeta frontend/.

        Arrastra el contenido de la carpeta frontend/.next (no la carpeta .next en sí, sino lo que hay dentro de ella, o al menos lo que tu servidor web esperaría, que suele ser el server.js si es un standalone build, y la carpeta static etc.).

        Arrastra la carpeta frontend/public completa (que contiene manifest.json, worker.js, icons, etc.) al directorio /calculapp en el servidor.

        Para el App Router de Next.js, la forma más sencilla es subir el contenido de la carpeta .next/static y public al directorio calculapp que se servirá estáticamente. El resto de los archivos generados por next build (como server.js y APP_BUILD_ID) son para el servidor de Node.js interno de Next.js, que no usarás directamente si solo sirves estáticamente.

        Es crucial que la carpeta public (con el manifest.json y worker.js) esté dentro de calculapp en el servidor.

4. Sube el Backend (Node.js API)

Tu API se servirá desde https://pages.elhubdeseguridad.com/backend/.

    Navega al mismo nivel que tu carpeta calculapp (o donde tu proveedor de hosting te indique que subas tus aplicaciones Node.js).

    Crea la carpeta backend: Crea un nuevo directorio llamado backend.

    Sube los archivos del Backend:

        Desde tu máquina local, ve a la carpeta backend/.

        Arrastra TODO el contenido de esta carpeta backend (incluyendo server.js, database.json, package.json, y ¡la carpeta node_modules COMPLETA!) al directorio /backend en el servidor.

        La carpeta node_modules es grande, así que la subida puede tardar un tiempo considerable.
