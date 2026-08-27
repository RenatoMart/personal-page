'use client';
import { Github } from '@/components/Icons';
import ProjectImageCarousel from '@/components/ProjectImageCarousel';
import type { PreviewProject } from '@/lib/preview-api';
import { animate, stagger } from 'animejs';
import { ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function ProjectsPreview({
	projects,
}: {
	projects: PreviewProject[];
}) {
	const sectionRef = useRef<HTMLElement>(null);
	const featured = projects.slice(0, 2);

	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting) {
					animate('.proj-preview-card', {
						translateY: [40, 0],
						opacity: [0, 1],
						duration: 400,
						delay: stagger(60),
						ease: 'outExpo',
					});
					observer.disconnect();
				}
			},
			{ threshold: 0.1 },
		);
		if (sectionRef.current) observer.observe(sectionRef.current);
		return () => observer.disconnect();
	}, []);

	return (
		<section id='projects' ref={sectionRef} className='px-6 py-28'>
			<div className='mx-auto max-w-6xl'>
				{/* Header */}
				<div className='mb-12'>
					<p className='section-eyebrow mb-3'>Portafolio</p>
					<div className='flex flex-col justify-between gap-6 md:flex-row md:items-end'>
						<h2 className='font-display text-3xl font-bold text-foreground md:text-5xl'>
							Trabajos &amp; proyectos<span className='text-secondary'>.</span>
						</h2>
						<Link
							href='/proyectos'
							className='group inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary-light px-5 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white'
						>
							Ver todos los proyectos
							<ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
						</Link>
					</div>
				</div>

				{/* Grid — 2 featured */}
				<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
					{featured.map(project => (
						<div
							key={project.slug}
							className='proj-preview-card glass-card group flex flex-col overflow-hidden opacity-0'
						>
							<ProjectImageCarousel
								images={project.images}
								fallbackUrl={project.previewUrl}
								title={project.title}
							/>
							<div className='flex flex-1 flex-col p-8'>
								<div className='mb-4 flex items-center justify-between'>
									<span
										className='pill border text-xs'
										style={{
											color: project.accent,
											backgroundColor: `${project.accent}1a`,
											borderColor: `${project.accent}40`,
										}}
									>
										{project.category}
									</span>
								</div>
								<h3 className='mb-3 font-display text-xl font-bold text-foreground transition-colors group-hover:text-primary'>
									{project.title}
								</h3>
								<p className='mb-6 flex-1 text-sm leading-relaxed text-muted'>
									{project.description}
								</p>
								<div className='mb-6 flex flex-wrap gap-2'>
									{project.tags.map(tag => (
										<span
											key={tag}
											className='pill border border-border bg-surface text-xs text-muted'
										>
											{tag}
										</span>
									))}
								</div>
								<div className='flex items-center gap-4 border-t border-border pt-4'>
									<a
										href={project.repoUrl}
										target='_blank'
										rel='noreferrer'
										className='flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary'
									>
										<Github className='h-4 w-4' /> GitHub
									</a>
									{project.liveUrl && (
										<a
											href={project.liveUrl}
											target='_blank'
											rel='noreferrer'
											className='flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary'
										>
											<ExternalLink className='h-4 w-4' /> Demo
										</a>
									)}
								</div>
							</div>
						</div>
					))}
				</div>

				{/* "See more" nudge */}
				<div className='mt-10 text-center'>
					<p className='mb-4 text-sm text-muted'>
						{projects.length - 2} proyectos más en el portafolio completo
					</p>
					<Link
						href='/proyectos'
						className='group inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline'
					>
						Explorar todos
						<ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5' />
					</Link>
				</div>
			</div>
		</section>
	);
}
