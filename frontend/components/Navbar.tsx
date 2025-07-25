import Image from 'next/image';
import Link from 'next/link';

export default function Logo() {
    return (
        <div className="navbar">
            <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Link href="/">
                    <Image src="/img/logo.png" alt="Logo" className='logo' width={189} height={32} priority />
                </Link>
                <div className="--links">
                    <Link href="/sales">Calculadora</Link>
                    <Link href="/admin">Administrador</Link>
                </div>
            </div>
        </div>
    );
}