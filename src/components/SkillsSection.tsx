'use client';
import { animate, stagger } from 'animejs';
import { Code2, Database, Layers, Workflow, Wrench } from 'lucide-react';
import { useEffect, useRef } from 'react';

const categories = [
	{
		title: 'Lenguajes',
		icon: Code2,
		color: 'text-primary bg-primary-light',
		dot: 'bg-primary',
		skills: ['C++', 'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'SQL'],
	},
	{
		title: 'Frameworks & Runtime',
		icon: Layers,
		color: 'text-emerald-600 bg-emerald-50',
		dot: 'bg-emerald-500',
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
		skills: ['Scrum (Agile)', 'RUP', 'PMI / PMBOK'],
	},
	{
		title: 'Herramientas & IDEs',
		icon: Wrench,
		color: 'text-secondary bg-secondary-light',
		dot: 'bg-secondary',
		skills: [
			'VS Code',
			'WebStorm',
			'GoLand',
			'IntelliJ IDEA',
			'CLion',
			'PyCharm',
			'PhpStorm',
			'DataGrip',
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
							Lo que sé hacer<span className='text-secondary'>.</span>
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
						return (
							<div
								key={idx}
								className='skill-card glass-card flex flex-col p-7 opacity-0'
							>
								<div
									className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${cat.color}`}
								>
									<Icon className='h-5 w-5' />
								</div>
								<h3 className='mb-4 font-display text-lg font-semibold text-foreground'>
									{cat.title}
								</h3>
								<ul className='mt-auto space-y-2.5'>
									{cat.skills.map(skill => (
										<li
											key={skill}
											className='flex items-center gap-2.5 text-sm text-muted'
										>
											<span
												className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${cat.dot}`}
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
