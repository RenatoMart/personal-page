'use client';
import { cn } from '@/utils/cn';
import { animate, stagger } from 'animejs';
import { Code2, Database, Layers, Workflow, Wrench } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { IconType } from 'react-icons';
import {
	SiClaudecode,
	SiCplusplus,
	SiDocker,
	SiGo,
	SiJavascript,
	SiJetbrains,
	SiMariadb,
	SiMysql,
	SiNestjs,
	SiNextdotjs,
	SiNodedotjs,
	SiOpenjdk,
	SiPostgresql,
	SiPrisma,
	SiPython,
	SiReact,
	SiRedis,
	SiSocketdotio,
	SiTypescript,
} from 'react-icons/si';

// Posiciones de las 4 marcas flotantes dentro de la tarjeta: al lado
// derecho, donde la lista de habilidades deja espacio vacío. Se
// reutilizan tal cual entre tarjetas; el tamaño/duración de cada una ya
// las desincroniza lo suficiente como para no verse como una cuadrícula.
const LOGO_SLOTS = [
	{ top: '6%', right: '8%', size: 34, duration: '7.5s', delay: '0s' },
	{ top: '34%', right: '20%', size: 44, duration: '9.2s', delay: '0.8s' },
	{ top: '60%', right: '6%', size: 30, duration: '6.8s', delay: '1.6s' },
	{ top: '84%', right: '22%', size: 26, duration: '8.4s', delay: '0.4s' },
];

const categories = [
	{
		title: 'Lenguajes',
		icon: Code2,
		color: 'text-primary bg-primary-light',
		dot: 'bg-primary',
		logoColor: 'text-primary',
		logos: [SiPython, SiTypescript, SiGo, SiJavascript, SiCplusplus, SiOpenjdk],
		skills: ['C++', 'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'SQL'],
	},
	{
		title: 'Frameworks & Runtime',
		icon: Layers,
		color: 'text-emerald-600 bg-emerald-50',
		dot: 'bg-emerald-500',
		logoColor: 'text-emerald-600',
		logos: [
			SiNextdotjs,
			SiNodedotjs,
			SiNestjs,
			SiReact,
			SiSocketdotio,
			SiPrisma,
		],
		skills: [
			'Next.js',
			'React Native',
			'NestJS',
			'Node.js',
			'WebSockets (Socket.io)',
			'Prisma ORM',
		],
	},
	{
		title: 'Bases de Datos',
		icon: Database,
		color: 'text-accent bg-cyan-50',
		dot: 'bg-accent',
		logoColor: 'text-accent',
		logos: [SiPostgresql, SiMysql, SiRedis, SiMariadb],
		skills: [
			'PostgreSQL',
			'MySQL',
			'MariaDB',
			'Redis',
			'NoSQL',
			'BD Multimedia',
		],
	},
	{
		title: 'Metodologías',
		icon: Workflow,
		color: 'text-violet-600 bg-violet-50',
		dot: 'bg-violet-500',
		logoColor: 'text-violet-600',
		logos: [] as IconType[],
		skills: ['Scrum (Agile)', 'RUP', 'PMI / PMBOK'],
	},
	{
		title: 'Herramientas & IDEs',
		icon: Wrench,
		color: 'text-secondary bg-secondary-light',
		dot: 'bg-secondary',
		logoColor: 'text-secondary',
		logos: [SiJetbrains, SiDocker, SiClaudecode],
		skills: [
			'VS Code',
			'JetBrains IDEs',
			'Docker',
			'Antigravity',
			'Claude Code',
		],
	},
];

export default function SkillsSection() {
	const sectionRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting) {
					animate('.skill-card', {
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
		<section id='skills' ref={sectionRef} className='px-6 py-28'>
			<div className='mx-auto max-w-6xl'>
				{/* Header */}
				<div className='mb-16 flex flex-col justify-between gap-4 md:flex-row md:items-end'>
					<div>
						<p className='section-eyebrow mb-3'>Stack técnico</p>
						<h2 className='font-display text-3xl font-bold text-foreground md:text-5xl'>
							Mi caja de herramientas<span className='text-secondary'>.</span>
						</h2>
					</div>
					<p className='max-w-sm text-base leading-relaxed text-muted'>
						Herramientas, lenguajes y metodologías que aplico para construir
						software sólido.
					</p>
				</div>

				{/* Cards */}
				<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
					{categories.map((cat, idx) => {
						const Icon = cat.icon;
						const logos = cat.logos.slice(0, LOGO_SLOTS.length);
						return (
							<div
								key={idx}
								className='skill-card glass-card relative flex flex-col overflow-hidden p-7 opacity-0'
							>
								{/* Marcas flotando de fondo: rellenan el espacio vacío a la
								    derecha de la lista sin competir con el texto (opacidad
								    baja, detrás de todo, no interactivas). */}
								{logos.length > 0 && (
									<div
										aria-hidden='true'
										className='pointer-events-none absolute inset-0'
									>
										{logos.map((Logo, i) => {
											const slot = LOGO_SLOTS[i];
											return (
												<Logo
													key={i}
													className={cn(
														'absolute animate-drift opacity-[0.12]',
														cat.logoColor,
													)}
													style={{
														top: slot.top,
														right: slot.right,
														width: slot.size,
														height: slot.size,
														animationDuration: slot.duration,
														animationDelay: slot.delay,
													}}
												/>
											);
										})}
									</div>
								)}

								<div
									className={cn(
										'relative mb-5 flex h-11 w-11 items-center justify-center rounded-xl',
										cat.color,
									)}
								>
									<Icon className='h-5 w-5' />
								</div>
								<h3 className='relative mb-4 font-display text-lg font-semibold text-foreground'>
									{cat.title}
								</h3>
								<ul className='relative mt-auto space-y-2.5'>
									{cat.skills.map(skill => (
										<li
											key={skill}
											className='flex items-center gap-2.5 text-sm text-muted'
										>
											<span
												className={cn(
													'h-1.5 w-1.5 flex-shrink-0 rounded-full',
													cat.dot,
												)}
											/>
											{skill}
										</li>
									))}
								</ul>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
