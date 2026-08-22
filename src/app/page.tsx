import ExperiencePreview from '@/components/ExperiencePreview';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import Navbar from '@/components/Navbar';
import ProjectsPreview from '@/components/ProjectsPreview';
import SkillsSection from '@/components/SkillsSection';

export default function Home() {
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

			<ProjectsPreview />

			<Footer />
		</main>
	);
}
