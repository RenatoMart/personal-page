import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ProjectsSection from '@/components/ProjectsSection';
import { getProjects } from '@/lib/preview-api';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Proyectos | Renato Martinez',
	description:
		'Portafolio completo de proyectos: desarrollo web, aplicaciones móviles, visión por computadora y voluntariado tecnológico.',
};

export default async function ProyectosPage() {
	const projects = await getProjects();
	return (
		<main className='min-h-screen bg-background text-foreground selection:bg-primary/30'>
			<Navbar />
			<div className='pt-24' />
			<ProjectsSection projects={projects} />
			<Footer />
		</main>
	);
}
