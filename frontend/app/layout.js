// frontend/app/layout.js
import ServiceWorkerRegister from '../components/ServiceWorkerRegister'; // Asegura la ruta correcta
import '../styles/globals.scss'; // Tus estilos globales

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CalculApp</title>
        <meta name="description" content="CalculaApp es una simple aplicación con fines de ventas en El Hub de Seguirdad. Esta herramienta nos permite hacer cálculos complejos a partir de una lista de precios con la finalidad de, a mayor número adquisitivo de cursos, mayor será el descuento otorgado al cliente." />
        <link rel="icon" href="/icons/favicon.svg" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegister /> {/* ¡Añade este componente aquí! */}
      </body>
    </html>
  );
}