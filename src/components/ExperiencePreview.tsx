'use client';
import { Linkedin } from '@/components/Icons';
import { experiences } from '@/data/experiences';
import { animate, stagger } from 'animejs';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

// Show the 3 most recent milestones
const preview = experiences.slice(-3).reverse();

export default function ExperiencePreview() {
	const sectionRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting) {
					animate('.exp-preview-card', {
						translateX: [-30, 0],
						opacity: [0, 1],
						duration: 400,
						delay: stagger(60),
						ease: 'outExpo',
					});
					animate('.timeline-preview-fill', {
						height: ['0%', '100%'],
						duration: 600,
						ease: 'inOutCubic',
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
		<section
			id='experience'
			ref={sectionRef}
			className='bg-surface-2/50 px-6 py-28'
		>
			<div className='mx-auto max-w-5xl'>
				{/* Header */}
				<div className='mb-16'>
					<p className='section-eyebrow mb-3'>Trayectoria</p>
					<div className='flex flex-col justify-between gap-4 md:flex-row md:items-end'>
						<h2 className='font-display text-3xl font-bold text-foreground md:text-5xl'>
							Mi camino hasta aquí<span className='text-primary'>.</span>
						</h2>
						<Link
							href='/trayectoria'
							className='group inline-flex items-center gap-2 self-start rounded-full border border-primary/25 bg-primary-light px-5 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white md:self-auto'
						>
							Ver trayectoria completa
							<ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
						</Link>
					</div>
				</div>

				{/* Timeline (compact) */}
				<div className='relative pl-10 md:pl-14'>
					{/* Vertical line */}
					<div className='absolute bottom-0 left-3 top-0 w-0.5 overflow-hidden rounded-full bg-border md:left-5'>
						<div className='timeline-preview-fill h-0 w-full origin-top rounded-full bg-gradient-to-b from-primary via-secondary via-violet-400 to-accent' />
					</div>

					<div className='space-y-8'>
						{preview.map((exp, idx) => {
							const Icon = exp.icon;
							return (
								<div
									key={idx}
									className='exp-preview-card relative flex gap-6 opacity-0'
								>
									{/* Node */}
									<div
										className={`absolute -left-10 z-10 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border md:-left-14 ${exp.accent}`}
									>
										<Icon className='h-4 w-4' />
									</div>

									{/* Card */}
									<div className='glass-card group flex-1 p-6 hover:shadow-card-hover'>
										<div className='mb-2 flex flex-wrap items-center gap-2'>
											<span className='inline-flex items-center gap-1 rounded-full border border-border bg-foreground/5 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-muted'>
												{exp.year}
											</span>
											{exp.cert && (
												<a
													href={exp.cert}
													target='_blank'
													rel='noreferrer'
													className='inline-flex items-center gap-1 rounded-full border border-[#0A66C2]/20 bg-[#0A66C2]/10 px-2.5 py-0.5 text-xs font-medium text-[#0A66C2] transition-colors hover:bg-[#0A66C2]/20'
												>
													<Linkedin className='h-3 w-3' />
													Certificado
												</a>
											)}
										</div>

										<h3 className='mb-1 font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary'>
											{exp.title}
										</h3>
										<p className='mb-3 text-sm font-semibold text-muted'>
											{exp.organization}
										</p>
										<p className='mb-4 text-sm leading-relaxed text-muted'>
											{exp.description}
										</p>

										<div className='flex flex-wrap gap-2'>
											{exp.tags.map(tag => (
												<span
													key={tag}
													className={`pill border text-xs ${exp.accent}`}
												>
													{tag}
												</span>
											))}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* "See more" nudge */}
				<div className='mt-10 text-center'>
					<p className='mb-4 text-sm text-muted'>
						{experiences.length - 3} hitos más en la trayectoria completa
					</p>
					<Link
						href='/trayectoria'
						className='group inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline'
					>
						Ver todo el recorrido
						<ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5' />
					</Link>
				</div>
			</div>
		</section>
	);
}
