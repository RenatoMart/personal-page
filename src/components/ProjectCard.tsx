'use client';
import { Github } from '@/components/Icons';
import ProjectImageCarousel from '@/components/ProjectImageCarousel';
import TechConstellation from '@/components/TechConstellation';
import { timeAgo, topLanguages } from '@/lib/lang-colors';
import { hasRealImage, type PreviewProject } from '@/lib/preview-api';
import { cn } from '@/utils/cn';
import { ExternalLink, GitCommitHorizontal, Lock } from 'lucide-react';
import { useRef } from 'react';

// Tarjeta de proyecto con profundidad: acento de color propio, datos reales
// de lenguajes (barra apilada), fecha del último push y, solo con mouse, un
// tilt 3D mínimo + un brillo que sigue el cursor. El tilt va en un
// contenedor interno (no en la raíz) para no pelear con la animación de
// entrada que anime.js aplica a la raíz.
export default function ProjectCard({
	project,
	entranceClass,
}: {
	project: PreviewProject;
	entranceClass: string;
}) {
	const rootRef = useRef<HTMLElement>(null);
	const tiltRef = useRef<HTMLDivElement>(null);
	const langs = topLanguages(project.languages);
	const updated = timeAgo(project.pushedAt);
	const accent = project.accent;
	const spotlight =
		'radial-gradient(380px circle at var(--mx, 50%) var(--my, 0%), ' +
		accent +
		'22, transparent 65%)';
	const edge =
		'linear-gradient(90deg, ' + accent + ', ' + accent + '55 70%, transparent)';

	const onMove = (e: React.PointerEvent<HTMLElement>) => {
		if (e.pointerType !== 'mouse') return;
		const root = rootRef.current;
		const tilt = tiltRef.current;
		if (!root || !tilt) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const r = root.getBoundingClientRect();
		const x = (e.clientX - r.left) / r.width;
		const y = (e.clientY - r.top) / r.height;
		root.style.setProperty('--mx', `${e.clientX - r.left}px`);
		root.style.setProperty('--my', `${e.clientY - r.top}px`);
		const rx = ((0.5 - y) * 5).toFixed(2);
		const ry = ((x - 0.5) * 6).toFixed(2);
		tilt.style.transform =
			'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
	};
	const onLeave = () => {
		if (tiltRef.current) tiltRef.current.style.transform = '';
	};

	return (
		<article
			ref={rootRef}
			onPointerMove={onMove}
			onPointerLeave={onLeave}
			className={cn(
				entranceClass,
				'glass-card group relative flex flex-col overflow-hidden opacity-0',
			)}
		>
			{/* Brillo que sigue al cursor */}
			<div
				aria-hidden='true'
				className='pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100'
				style={{
					background: spotlight,
				}}
			/>
			{/* Filo de color del proyecto */}
			<div
				aria-hidden='true'
				className='absolute inset-x-0 top-0 z-20 h-[3px]'
				style={{
					background: edge,
				}}
			/>

			<div
				ref={tiltRef}
				className='flex flex-1 flex-col transition-transform duration-300 ease-out will-change-transform'
				style={{ transformStyle: 'preserve-3d' }}
			>
				<div className='relative'>
					{hasRealImage(project) ? (
						<ProjectImageCarousel
							images={project.images}
							fallbackUrl={project.previewUrl}
							title={project.title}
						/>
					) : (
						<TechConstellation project={project} />
					)}
					<div
						aria-hidden='true'
						className='pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/50 to-transparent'
					/>
				</div>

				<div className='flex flex-1 flex-col p-7'>
					<div className='mb-4 flex items-center justify-between gap-3'>
						<span
							className='pill border text-xs'
							style={{
								color: accent,
								backgroundColor: `${accent}1a`,
								borderColor: `${accent}40`,
							}}
						>
							{project.category}
						</span>
						{updated && (
							<span className='inline-flex items-center gap-1 font-mono text-[11px] text-muted-fg'>
								<GitCommitHorizontal className='h-3.5 w-3.5' />
								{updated}
							</span>
						)}
					</div>

					<h3 className='mb-3 font-display text-xl font-bold text-foreground transition-colors group-hover:text-primary'>
						{project.liveUrl ? (
							<a
								href={project.liveUrl}
								target='_blank'
								rel='noreferrer'
								className='hover:underline'
							>
								{project.title}
							</a>
						) : (
							project.title
						)}
					</h3>
					<p className='mb-5 flex-1 text-sm leading-relaxed text-muted'>
						{project.description}
					</p>

					{langs.length > 0 && (
						<div className='mb-5'>
							<div
								data-reveal-bar
								className='flex h-1.5 w-full gap-px overflow-hidden rounded-full bg-border'
							>
								{langs.map(l => (
									<span
										key={l.name}
										className='h-full'
										style={{ width: l.pct + '%', backgroundColor: l.color }}
									/>
								))}
							</div>
							<ul className='mt-2.5 flex flex-wrap gap-x-4 gap-y-1'>
								{langs
									.filter(l => l.pct >= 1)
									.slice(0, 3)
									.map(l => (
										<li
											key={l.name}
											className='flex items-center gap-1.5 font-mono text-[11px] text-muted'
										>
											<span
												className='h-2 w-2 rounded-full'
												style={{ backgroundColor: l.color }}
											/>
											{l.name} {Math.round(l.pct)}%
										</li>
									))}
							</ul>
						</div>
					)}

					<div className='mb-5 flex flex-wrap gap-2'>
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
						{project.repoUrl ? (
							<a
								href={project.repoUrl}
								target='_blank'
								rel='noreferrer'
								className='flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary'
							>
								<Github className='h-4 w-4' /> GitHub
							</a>
						) : (
							project.private && (
								<span className='flex items-center gap-1.5 text-sm font-medium text-muted'>
									<Lock className='h-4 w-4' /> Uso interno · capturas con datos
									de demostración
								</span>
							)
						)}
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
		</article>
	);
}
