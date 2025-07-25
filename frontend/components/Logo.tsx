import Image from 'next/image';

export default function Logo() {
	return (
		<div>
			<Image
			src="/img/logo.png"
			alt="Logo"
			className='logo'
			width={189}
			height={32}
			priority
			/>
		</div>
	);
}