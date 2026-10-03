'use client';
import ProjectCard from '@/components/ProjectCard';
import type { PreviewProject } from '@/lib/preview-api';
import { animate, stagger } from 'animejs';
import { ArrowRight } from 'lucide-react';
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
						translateY: [28, 0],
						scale: [0.97, 1],
						opacity: [0, 1],
						duration: 700,
						delay: stagger(80),
						ease: 'outQuart',
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
		<section id='projects' ref={sectionRef} className='section-flow px-6 py-28'>
			<div className='mx-auto max-w-6xl'>
				{/* Header */}
				<div data-reveal-group className='mb-12'>
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

				{projects.length === 0 && (
					<p className='rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted'>
						No se pudieron cargar los proyectos en este momento. Recarga la
						página en unos segundos.
					</p>
				)}

				{/* Grid — 2 featured */}
				<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
					{featured.map(project => (
						<ProjectCard
							key={project.slug}
							project={project}
							entranceClass='proj-preview-card'
						/>
					))}
				</div>

				{/* "See more" nudge */}
				<div className='mt-10 text-center'>
					{projects.length > 2 && (
						<p className='mb-4 text-sm text-muted'>
							{projects.length - 2} proyectos más en el portafolio completo
						</p>
					)}
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
