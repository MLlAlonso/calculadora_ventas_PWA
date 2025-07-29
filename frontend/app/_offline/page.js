// frontend/app/_offline/page.js
'use client';

import Link from 'next/link';
import '../../styles/globals.scss'; 
export default function OfflinePage() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Parece que estás sin conexión 😔</h1>
      <p>
        No pudimos cargar la página que solicitaste.
        Puedes intentar ir a la sección de Vendedores si fue instalada para uso offline.
      </p>
      <div style={{ marginTop: '30px' }}>
        <Link href="/sales" className="btn-primary">
          Ir a la Sección de Vendedores (Offline)
        </Link>
        <button onClick={() => window.location.reload()} className="btn-secondary" style={{ marginLeft: '10px' }}>
          Reintentar Conexión
        </button>
      </div>
    </div>
  );
}