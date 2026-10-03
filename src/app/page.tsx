import ExperiencePreview from '@/components/ExperiencePreview';
import Footer from '@/components/Footer';
import HeroBridge from '@/components/HeroBridge';
import HeroSection from '@/components/HeroSection';
import Navbar from '@/components/Navbar';
import ProjectsPreview from '@/components/ProjectsPreview';
import SkillsSection from '@/components/SkillsSection';
import { getProjects } from '@/lib/preview-api';

export default async function Home({
	searchParams,
}: {
	searchParams: Promise<{ hero?: string }>;
}) {
	const { hero } = await searchParams;
	const variant = hero === 'light' ? 'light' : 'dark';
	const projects = await getProjects();
	return (
		<main className='min-h-screen text-foreground selection:bg-primary/30'>
			<Navbar onDarkHero={variant === 'dark'} />
			<HeroSection variant={variant} />
			{variant === 'dark' ? (
				<HeroBridge />
			) : (
				<div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50' />
			)}

			<SkillsSection />

			<div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50' />

			<ExperiencePreview />

			<div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50' />

			<ProjectsPreview projects={projects} />

			<Footer />
		</main>
	);
}
