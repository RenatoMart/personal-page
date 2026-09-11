'use client';
import { Github, Linkedin } from '@/components/Icons';
import { animate, stagger } from 'animejs';
import { ArrowRight, Code2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

// El chunk de three.js (~150KB) se carga aparte, después del contenido
// principal: la red 3D es puramente ambiental, así que no debe competir
// por ancho de banda ni bloquear el hidratado del texto/CTAs del hero.
const HeroNetworkScene = dynamic(() => import('./HeroNetworkScene'), {
	ssr: false,
});

export default function HeroSection() {
	const sectionRef = useRef<HTMLElement>(null);
	const badgeRef = useRef<HTMLDivElement>(null);
	const line1Ref = useRef<HTMLDivElement>(null);
	const word1Ref = useRef<HTMLSpanElement>(null);
	const word2Ref = useRef<HTMLSpanElement>(null);
	const subtitleRef = useRef<HTMLParagraphElement>(null);
	const ctaRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const introEls = [badgeRef.current, line1Ref.current].filter(
			(el): el is HTMLDivElement => el !== null,
		);
		const nameWords = [word1Ref.current, word2Ref.current].filter(
			(el): el is HTMLSpanElement => el !== null,
		);
		const outroEls = [subtitleRef.current, ctaRef.current].filter(
			(el): el is HTMLParagraphElement | HTMLDivElement => el !== null,
		);

		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;

		if (prefersReducedMotion) {
			// Skip motion entirely: land in the final state instantly.
			[...introEls, ...nameWords, ...outroEls].forEach(el => {
				el.style.opacity = '1';
				el.style.transform = 'none';
			});
			return;
		}

		// Intro: badge + greeting, quiet fade-up.
		animate(introEls, {
			translateY: [24, 0],
			opacity: [0, 1],
			delay: stagger(70, { start: 100 }),
			duration: 420,
			ease: 'outExpo',
		});

		// Signature moment: the name flips up into place word by word, like a
		// split-flap display settling. Only `transform` (perspective + rotateX,
		// GPU-composited) and `opacity` are animated — no layout properties —
		// so this can't trigger a reflow.
		animate(nameWords, {
			rotateX: [78, 0],
			opacity: [0, 1],
			delay: stagger(150, { start: 220 }),
			duration: 700,
			ease: 'outBack',
		});

		// Outro: subtitle + CTAs follow once the name has mostly settled.
		animate(outroEls, {
			translateY: [24, 0],
			opacity: [0, 1],
			delay: stagger(90, { start: 820 }),
			duration: 420,
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

			{/* === Red 3D de nodos (capa media) — ambiental, sin interacción === */}
			<HeroNetworkScene />

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

				{/* Name — each word flips up into place independently (see effect) */}
				<div className='mb-8'>
					<h1 className='font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl'>
						<span
							ref={word1Ref}
							className='inline-block'
							style={{
								transform: 'perspective(700px) rotateX(78deg)',
								transformOrigin: '50% 100%',
								opacity: 0,
							}}
						>
							Renato
						</span>{' '}
						<span
							ref={word2Ref}
							className='inline-block text-primary'
							style={{
								transform: 'perspective(700px) rotateX(78deg)',
								transformOrigin: '50% 100%',
								opacity: 0,
							}}
						>
							Martinez
						</span>
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
