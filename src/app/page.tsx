import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ExperienceSection from '@/components/ExperienceSection';
import SkillsSection from '@/components/SkillsSection';
import ProjectsSection from '@/components/ProjectsSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      <HeroSection />
      
      {/* Spacer/Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      
      <SkillsSection />
      
      {/* Spacer/Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      
      <ExperienceSection />
      
      {/* Spacer/Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
      
      <ProjectsSection />
      
      <Footer />
    </main>
  );
}
