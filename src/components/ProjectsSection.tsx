'use client';
import ProjectCard from '@/components/ProjectCard';
import type { PreviewProject } from '@/lib/preview-api';
import { cn } from '@/utils/cn';
import { animate, stagger } from 'animejs';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function ProjectsSection({
	projects,
}: {
	projects: PreviewProject[];
}) {
	const sectionRef = useRef<HTMLElement>(null);
	const [active, setActive] = useState('Todos');

	const categories = useMemo(
		() => ['Todos', ...Array.from(new Set(projects.map(p => p.category)))],
		[projects],
	);

	const filtered =
		active === 'Todos' ? projects : projects.filter(p => p.category === active);

	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting) {
					animate('.proj-card', {
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

	useEffect(() => {
		animate('.proj-card', {
			scale: [0.96, 1],
			opacity: [0.3, 1],
			duration: 250,
			delay: stagger(30),
			ease: 'outSine',
		});
	}, [active]);

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
						<div className='flex flex-wrap gap-2'>
							{categories.map(cat => (
								<button
									key={cat}
									onClick={() => setActive(cat)}
									className={cn(
										'rounded-full border px-4 py-2 text-sm font-medium transition-all',
										active === cat
											? 'border-primary bg-primary text-white shadow-glow-primary'
											: 'border-border bg-white text-muted hover:border-primary/40 hover:text-primary',
									)}
								>
									{cat}
								</button>
							))}
						</div>
					</div>
				</div>

				{projects.length === 0 && (
					<p className='rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted'>
						No se pudieron cargar los proyectos en este momento. Recarga la
						página en unos segundos.
					</p>
				)}

				{/* Grid */}
				<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
					{filtered.map(project => (
						<ProjectCard
							key={project.slug}
							project={project}
							entranceClass='proj-card'
						/>
					))}
				</div>
			</div>
		</section>
	);
}
