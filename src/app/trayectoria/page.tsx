import ExperienceSection from '@/components/ExperienceSection';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Trayectoria | Renato Martinez',
	description:
		'Mi recorrido profesional y académico: formación en la UNT, voluntariado en SEDIPRO, coordinación de eventos y desarrollo freelance.',
};

export default function TrayectoriaPage() {
	return (
		<main className='min-h-screen bg-background text-foreground selection:bg-primary/30'>
			<Navbar />
			<div className='pt-24' />
			<ExperienceSection />
			<Footer />
		</main>
	);
}
