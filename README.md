# Calculadora de Precios

Este proyecto es una aplicación web para la gestión y cotización de productos, diseñada para funcionar tanto online como offline (PWA). Incluye un frontend en Next.js y un backend en Node.js con LowDB.

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
