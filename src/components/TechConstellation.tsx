import type { PreviewProject } from '@/lib/preview-api';
import { techIconsFor } from '@/lib/tech-icons';
import { Code2 } from 'lucide-react';

// Vista para proyectos sin captura ni imagen de README: en vez de una
// tarjeta plana, una "constelación" con las tecnologías reales del repo
// (logos) conectadas a un nodo central — el mismo lenguaje de red del
// hero. Cada nodo flota apenas (transform) y entra escalonado al aparecer.
const SLOTS = [
	{ x: 17, y: 32 },
	{ x: 81, y: 27 },
	{ x: 27, y: 78 },
	{ x: 73, y: 75 },
	{ x: 92, y: 55 },
	{ x: 8, y: 64 },
];

export default function TechConstellation({
	project,
}: {
	project: PreviewProject;
}) {
	const accent = project.accent;
	const icons = techIconsFor(project.languages, project.tags, SLOTS.length);

	const bg =
		'radial-gradient(circle at 50% 50%, ' +
		accent +
		'2e 0%, transparent 55%), linear-gradient(135deg, ' +
		accent +
		'1f 0%, #ffffff 58%, ' +
		accent +
		'14 100%)';

	return (
		<div
			className='relative aspect-[1200/630] w-full overflow-hidden'
			style={{ background: bg }}
		>
			{/* Cuadrícula de puntos, enmascarada hacia los bordes */}
			<div
				aria-hidden='true'
				className='absolute inset-0 opacity-40'
				style={{
					backgroundImage:
						'radial-gradient(' + accent + '55 1px, transparent 1px)',
					backgroundSize: '22px 22px',
					maskImage:
						'radial-gradient(ellipse 70% 80% at 50% 50%, black 30%, transparent 85%)',
					WebkitMaskImage:
						'radial-gradient(ellipse 70% 80% at 50% 50%, black 30%, transparent 85%)',
				}}
			/>

			<div data-reveal-stagger aria-hidden='true' className='absolute inset-0'>
				<svg
					viewBox='0 0 100 100'
					preserveAspectRatio='none'
					className='absolute inset-0 h-full w-full'
					style={{ '--i': 0 } as React.CSSProperties}
				>
					{SLOTS.map((s, i) => (
						<line
							key={i}
							x1={50}
							y1={50}
							x2={s.x}
							y2={s.y}
							stroke={accent}
							strokeOpacity={i < icons.length ? 0.4 : 0.22}
							strokeWidth={1.2}
							strokeDasharray='3 5'
							strokeLinecap='round'
							vectorEffect='non-scaling-stroke'
						/>
					))}
				</svg>

				{/* Nodo central */}
				<div
					className='absolute'
					style={
						{
							left: '50%',
							top: '50%',
							width: 84,
							height: 84,
							margin: '-42px 0 0 -42px',
							'--i': 1,
						} as React.CSSProperties
					}
				>
					<div
						className='flex h-full w-full animate-bob items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white/70'
						style={{
							background:
								'linear-gradient(135deg, ' + accent + ', ' + accent + 'bb)',
							animationDuration: '7s',
						}}
					>
						<Code2 className='h-9 w-9' />
					</div>
				</div>

				{SLOTS.map((s, i) => {
					const tech = icons[i];
					const size = tech ? 56 : 12;
					return (
						<div
							key={i}
							className='absolute'
							style={
								{
									left: s.x + '%',
									top: s.y + '%',
									width: size,
									height: size,
									margin: '-' + size / 2 + 'px 0 0 -' + size / 2 + 'px',
									'--i': i + 2,
								} as React.CSSProperties
							}
						>
							{tech ? (
								<div
									className='flex h-full w-full animate-bob items-center justify-center rounded-full bg-white shadow-card ring-1 ring-black/5'
									style={{
										animationDuration: 5.5 + (i % 3) * 1.2 + 's',
										animationDelay: -i * 0.9 + 's',
									}}
								>
									<tech.Icon
										className='h-6 w-6'
										style={{ color: tech.color }}
									/>
								</div>
							) : (
								<div
									className='h-full w-full animate-bob rounded-full'
									style={{
										backgroundColor: accent + '66',
										animationDuration: 6 + (i % 2) + 's',
										animationDelay: -i * 0.7 + 's',
									}}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
