import GridBackground from '@/components/GridBackground';
import RevealOnScroll from '@/components/RevealOnScroll';
import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono, Syne } from 'next/font/google';
import './globals.css';

const syne = Syne({
	variable: '--font-syne',
	subsets: ['latin'],
	weight: ['400', '500', '600', '700', '800'],
});

const dmSans = DM_Sans({
	variable: '--font-dm-sans',
	subsets: ['latin'],
	weight: ['300', '400', '500', '600'],
});

const jetbrainsMono = JetBrains_Mono({
	variable: '--font-mono',
	subsets: ['latin'],
	weight: ['400', '500'],
});

export const metadata: Metadata = {
	title: 'Renato Martinez | Portafolio',
	description:
		'Portafolio personal de Renato Martinez, estudiante de informática y desarrollador web apasionado por crear experiencias digitales fluidas.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='es'>
			<body
				suppressHydrationWarning
				className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} relative antialiased`}
			>
				<div aria-hidden='true' className='scroll-progress' />
				<GridBackground />
				<RevealOnScroll />
				{children}
			</body>
		</html>
	);
}
