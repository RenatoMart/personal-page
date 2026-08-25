import ExperiencePreview from '@/components/ExperiencePreview';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import Navbar from '@/components/Navbar';
import ProjectsPreview from '@/components/ProjectsPreview';
import SkillsSection from '@/components/SkillsSection';
import { getProjects } from '@/lib/preview-api';

export default async function Home() {
	const projects = await getProjects();
	return (
		<main className='min-h-screen bg-background text-foreground selection:bg-primary/30'>
			<Navbar />
			<HeroSection />

			{/* Spacer/Divider */}
			<div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50' />

			<SkillsSection />

			{/* Spacer/Divider */}
			<div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50' />

			<ExperiencePreview />

			{/* Spacer/Divider */}
			<div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50' />

			<ProjectsPreview projects={projects} />

			<Footer />
		</main>
	);
}
