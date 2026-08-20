import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
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

export const metadata: Metadata = {
	title: 'Renato Martinez | Portafolio',
	description: 'Portafolio personal de Renato Martinez, estudiante de informática y desarrollador web apasionado por crear experiencias digitales fluidas.',
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
				className={`${syne.variable} ${dmSans.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
