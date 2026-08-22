'use client';
import { Github, Linkedin } from '@/components/Icons';
import { animate, stagger } from 'animejs';
import { ArrowRight, Code2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

// Bubble config: size, position, color, duration — kept subtle but visible
const BUBBLES = [
	{
		w: 80,
		h: 80,
		top: '12%',
		left: '8%',
		color: 'rgba(99,102,241,0.18)',
		dur: '7.2s',
		delay: '0s',
	},
	{
		w: 48,
		h: 48,
		top: '70%',
		left: '5%',
		color: 'rgba(139,92,246,0.15)',
		dur: '9.5s',
		delay: '1s',
	},
	{
		w: 120,
		h: 120,
		top: '20%',
		left: '88%',
		color: 'rgba(99,102,241,0.12)',
		dur: '11s',
		delay: '2s',
	},
	{
		w: 36,
		h: 36,
		top: '80%',
		left: '80%',
		color: 'rgba(249,115,22,0.15)',
		dur: '8.4s',
		delay: '0.5s',
	},
	{
		w: 64,
		h: 64,
		top: '50%',
		left: '92%',
		color: 'rgba(6,182,212,0.14)',
		dur: '10.2s',
		delay: '1.5s',
	},
	{
		w: 28,
		h: 28,
		top: '35%',
		left: '3%',
		color: 'rgba(139,92,246,0.20)',
		dur: '6.8s',
		delay: '0.2s',
	},
	{
		w: 56,
		h: 56,
		top: '88%',
		left: '45%',
		color: 'rgba(99,102,241,0.14)',
		dur: '12s',
		delay: '2.5s',
	},
	{
		w: 40,
		h: 40,
		top: '8%',
		left: '55%',
		color: 'rgba(249,115,22,0.12)',
		dur: '9.0s',
		delay: '0.8s',
	},
	{
		w: 72,
		h: 72,
		top: '60%',
		left: '60%',
		color: 'rgba(6,182,212,0.11)',
		dur: '8.8s',
		delay: '1.2s',
	},
	{
		w: 32,
		h: 32,
		top: '42%',
		left: '75%',
		color: 'rgba(99,102,241,0.16)',
		dur: '7.6s',
		delay: '0.6s',
	},
];

export default function HeroSection() {
	const sectionRef = useRef<HTMLElement>(null);
	const badgeRef = useRef<HTMLDivElement>(null);
	const line1Ref = useRef<HTMLDivElement>(null);
	const line2Ref = useRef<HTMLDivElement>(null);
	const subtitleRef = useRef<HTMLParagraphElement>(null);
	const ctaRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Content entrance (only runs once on mount)
		const els = [
			badgeRef.current,
			line1Ref.current,
			line2Ref.current,
			subtitleRef.current,
			ctaRef.current,
		].filter(Boolean);

		animate(els, {
			translateY: [28, 0],
			opacity: [0, 1],
			delay: stagger(60, { start: 100 }),
			duration: 400,
			ease: 'outExpo',
		});
	}, []);

	return (
		<section
			id='about'
			ref={sectionRef}
			className='relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-16 pt-24'
		>
			{/* === Soft large blobs (background layer, using CSS animate-blob for performance) === */}
			<div
				className='pointer-events-none absolute -left-16 -top-32 h-[600px] w-[600px] animate-blob rounded-full opacity-35'
				style={{
					background:
						'radial-gradient(circle, #c7d2fe 0%, #e0e7ff 40%, transparent 70%)',
					animationDelay: '0s',
				}}
			/>
			<div
				className='pointer-events-none absolute -bottom-32 -right-16 h-[560px] w-[560px] animate-blob rounded-full opacity-30'
				style={{
					background:
						'radial-gradient(circle, #fed7aa 0%, #fde68a 40%, transparent 70%)',
					animationDelay: '2s',
				}}
			/>

			{/* === Floating bubbles (mid layer, CSS animation for better performance) === */}
			{BUBBLES.map((b, i) => (
				<div
					key={i}
					className='pointer-events-none absolute animate-float rounded-full'
					style={{
						width: b.w,
						height: b.h,
						top: b.top,
						left: b.left,
						backgroundColor: b.color,
						border: `1px solid ${b.color.replace(/,\s*[\d.]+\)$/, ', 0.4)')}`,
						animationDuration: b.dur,
						animationDelay: b.delay,
						willChange: 'transform',
					}}
				/>
			))}

			{/* === Content (top layer) === */}
			<div className='relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center'>
				{/* Badge */}
				<div
					ref={badgeRef}
					className='mb-10 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white px-4 py-2 text-sm font-semibold text-primary opacity-0 shadow-sm'
				>
					<Code2 className='h-3.5 w-3.5' />
					Informática · Desarrollo Web · Voluntariado
				</div>

				{/* Greeting */}
				<div ref={line1Ref} className='mb-3 opacity-0'>
					<span className='font-sans text-2xl font-normal tracking-wide text-muted md:text-3xl'>
						Hola, soy
					</span>
				</div>

				{/* Name */}
				<div ref={line2Ref} className='mb-8 opacity-0'>
					<h1 className='font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl'>
						Renato <span className='text-primary'>Martinez</span>
					</h1>
				</div>

				{/* Subtitle */}
				<p
					ref={subtitleRef}
					className='mb-10 max-w-xl text-base leading-relaxed text-muted opacity-0 md:text-lg'
				>
					Desarrollador Web y Software enfocado en construir soluciones
					tecnológicas eficientes. Apasionado por el aprendizaje continuo y por
					enfrentar desafíos en entornos dinámicos. Comprometido a trabajar con
					firmeza y dedicación para aportar valor real mediante código limpio y
					trabajo en equipo.
				</p>

				{/* CTAs */}
				<div
					ref={ctaRef}
					className='mb-10 flex flex-col items-center gap-4 opacity-0 sm:flex-row'
				>
					<Link
						href='/proyectos'
						className='group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white shadow-glow-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg'
						style={{
							background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
						}}
					>
						Ver proyectos{' '}
						<ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
					</Link>
					<Link
						href='/trayectoria'
						className='inline-flex items-center gap-2 rounded-full border border-border bg-white px-7 py-3.5 font-semibold text-foreground shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover'
					>
						Mi trayectoria
					</Link>
				</div>

				{/* Social links */}
				<div className='flex items-center gap-5 text-sm text-muted'>
					<a
						href='https://github.com/RenatoMart'
						target='_blank'
						rel='noreferrer'
						className='flex items-center gap-1.5 transition-colors hover:text-primary'
					>
						<Github className='h-4 w-4' /> RenatoMart
					</a>
					<span className='h-4 w-px bg-border' />
					<a
						href='https://www.linkedin.com/in/renato-alexander-martinez-aguilar-88a391343/'
						target='_blank'
						rel='noreferrer'
						className='flex items-center gap-1.5 transition-colors hover:text-primary'
					>
						<Linkedin className='h-4 w-4' /> LinkedIn
					</a>
				</div>
			</div>
		</section>
	);
}
