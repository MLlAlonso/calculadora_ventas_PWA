'use client';

import Link from 'next/link';
import '../styles/globals.scss';

export default function Home() {
  return (
    <div className="container" style={{ textAlign: 'center' }}> {/*  */}
      <h1>Bienvenido a la Calculadora de Precios</h1>
      <p>Selecciona tu rol para continuar:</p>
      <div className="home-buttons" style={{ marginTop: '30px' }}> {/*  */}
        <Link href="/sales" className="btn-primary"> {/* Usamos className */}
          👨‍💼 Soy Vendedor
        </Link>
        <Link href="/admin" className="btn-secondary"> {/* Usamos className */}
          ⚙️ Soy Administrador
        </Link>
      </div>
    </div>
  );
}