'use client';
import { Linkedin } from '@/components/Icons';
import { experiences } from '@/data/experiences';
import { cn } from '@/utils/cn';
import { animate, createTimeline } from 'animejs';
import { useEffect, useRef } from 'react';

export default function ExperienceSection() {
	const sectionRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (!entries[0].isIntersecting) return;
				observer.disconnect();

				const n = experiences.length;
				const prefersReducedMotion = window.matchMedia(
					'(prefers-reduced-motion: reduce)',
				).matches;

				if (prefersReducedMotion) {
					animate('.timeline-fill', { height: '100%', duration: 0 });
					animate('.exp-node, .exp-card', {
						opacity: 1,
						scale: 1,
						translateX: 0,
						duration: 0,
					});
					return;
				}

				// El camino se traza igual que la trayectoria: la línea avanza y,
				// justo cuando llega a la altura de cada hito, ese nodo "se
				// activa" (rebote + ping) y su tarjeta aparece — en vez de un
				// fade genérico desacoplado del dibujo de la línea.
				const fillDuration = Math.max(1200, n * 260);
				const timeline = createTimeline();
				timeline.add(
					'.timeline-fill',
					{
						height: ['0%', '100%'],
						duration: fillDuration,
						ease: 'inOutCubic',
					},
					0,
				);
				experiences.forEach((_, i) => {
					const t = n > 1 ? (i / (n - 1)) * fillDuration : 0;
					timeline.add(
						`.exp-node-${i}`,
						{ scale: [0, 1], duration: 380, ease: 'outBack' },
						t,
					);
					timeline.add(
						`.exp-ping-${i}`,
						{
							scale: [1, 2.2],
							opacity: [0.5, 0],
							duration: 650,
							ease: 'outSine',
						},
						t,
					);
					timeline.add(
						`.exp-card-${i}`,
						{
							translateX: [-24, 0],
							opacity: [0, 1],
							duration: 420,
							ease: 'outExpo',
						},
						t,
					);
				});
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
						<a
							href='https://www.linkedin.com/in/renato-alexander-martinez-aguilar-88a391343/'
							target='_blank'
							rel='noreferrer'
							className='inline-flex items-center gap-2 self-start rounded-full border border-[#0A66C2]/20 bg-[#0A66C2]/10 px-4 py-2 text-sm font-medium text-[#0A66C2] transition-colors hover:bg-[#0A66C2]/20 md:self-auto'
						>
							<Linkedin className='h-4 w-4' />
							Ver certificados en LinkedIn
						</a>
					</div>
				</div>

				{/* Timeline */}
				<div className='relative pl-10 md:pl-14'>
					{/* Vertical line */}
					<div className='absolute bottom-0 left-3 top-0 w-0.5 overflow-hidden rounded-full bg-border md:left-5'>
						<div className='timeline-fill h-0 w-full origin-top rounded-full bg-gradient-to-b from-primary via-secondary via-violet-400 to-accent' />
					</div>

					<div className='space-y-8'>
						{experiences.map((exp, idx) => {
							const Icon = exp.icon;
							return (
								<div key={idx} className='relative flex gap-6'>
									{/* Ping: expanding ring, fired once the traveling line reaches this node */}
									<div
										aria-hidden='true'
										className={cn(
											`exp-ping-${idx}`,
											'pointer-events-none absolute -left-10 z-0 mt-1 h-8 w-8 rounded-xl border-2 opacity-0 md:-left-14',
											exp.accent,
										)}
									/>

									{/* Node */}
									<div
										className={cn(
											'exp-node',
											`exp-node-${idx}`,
											'absolute -left-10 z-10 mt-1 flex h-8 w-8 flex-shrink-0 scale-0 items-center justify-center rounded-xl border md:-left-14',
											exp.accent,
										)}
									>
										<Icon className='h-4 w-4' />
									</div>

									{/* Card */}
									<div
										className={cn(
											'exp-card',
											`exp-card-${idx}`,
											'glass-card group flex-1 p-6 opacity-0 hover:shadow-card-hover',
										)}
									>
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
			</div>
		</section>
	);
}
