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

// Bubbles at these indices also burst on their own, on a randomized timer —
// the rest only pop when clicked. All ten stay clickable either way.
const AUTO_POP_INDICES = new Set([1, 3, 5, 7, 9]);

export default function HeroSection() {
	const sectionRef = useRef<HTMLElement>(null);
	const badgeRef = useRef<HTMLDivElement>(null);
	const line1Ref = useRef<HTMLDivElement>(null);
	const word1Ref = useRef<HTMLSpanElement>(null);
	const word2Ref = useRef<HTMLSpanElement>(null);
	const subtitleRef = useRef<HTMLParagraphElement>(null);
	const ctaRef = useRef<HTMLDivElement>(null);
	const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);

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
		const bubbles = bubbleRefs.current.filter(
			(el): el is HTMLDivElement => el !== null,
		);

		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;

		if (prefersReducedMotion) {
			// Skip motion entirely: land in the final state instantly, and
			// don't wire up the pop timers/handlers below.
			[...introEls, ...nameWords, ...outroEls].forEach(el => {
				el.style.opacity = '1';
				el.style.transform = 'none';
			});
			bubbles.forEach(el => {
				el.style.opacity = '1';
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

		// Ambient bubbles fade in (opacity only — they already run an infinite
		// CSS transform loop via animate-float, and a CSS animation always wins
		// over an inline transform on the same property, so animating
		// transform/scale here would fight that loop every frame and stutter).
		animate(bubbles, {
			opacity: [0, 1],
			delay: stagger(45, { start: 250 }),
			duration: 900,
			ease: 'outSine',
			onComplete: () => {
				bubbles.forEach((el, i) => {
					el.style.willChange = 'transform';
					if (AUTO_POP_INDICES.has(i)) scheduleAutoPop(el, i);
				});
			},
		});

		// Pending respawn/auto-pop timers, cleared on unmount so a route change
		// mid-cycle never calls animate() on a detached node.
		return () => {
			timeoutsRef.current.forEach(clearTimeout);
			timeoutsRef.current = [];
		};
		// scheduleAutoPop is intentionally omitted: it only closes over
		// poppingRef/timeoutsRef (stable refs), never stale state, so it's
		// safe to call without being a dependency — and adding it here would
		// turn this into a "re-run every render" effect instead of mount-once.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// --- Bubble pop system -------------------------------------------------
	// No React state: popping is a purely visual, non-essential flourish, so
	// it's driven straight through refs + anime.js one-shot tweens. That
	// keeps it at zero re-render cost no matter how often bubbles pop.
	// timeoutsRef (not a plain array) so every render's popBubble/
	// scheduleAutoPop closures push into the same list the effect cleans up.
	const poppingRef = useRef<Record<number, boolean>>({});
	const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

	const popBubble = (el: HTMLDivElement, index: number) => {
		if (poppingRef.current[index]) return;
		poppingRef.current[index] = true;

		// Hand transform over to anime.js for the duration of the pop: the
		// CSS float loop and a JS-driven scale would otherwise both write to
		// `transform` on the same element every frame and fight each other.
		el.classList.remove('animate-float');

		animate(el, {
			scale: [1, 1.7],
			opacity: [1, 0],
			duration: 380,
			ease: 'outQuad',
			onComplete: () => {
				const respawnDelay = 2200 + Math.random() * 2600;
				const t = setTimeout(() => {
					animate(el, {
						scale: [0.3, 1],
						opacity: [0, 1],
						duration: 600,
						ease: 'outBack',
						onComplete: () => {
							el.classList.add('animate-float');
							poppingRef.current[index] = false;
							if (AUTO_POP_INDICES.has(index)) scheduleAutoPop(el, index);
						},
					});
				}, respawnDelay);
				timeoutsRef.current.push(t);
			},
		});
	};

	const scheduleAutoPop = (el: HTMLDivElement, index: number) => {
		const delay = 4500 + Math.random() * 7000;
		const t = setTimeout(() => {
			if (!poppingRef.current[index]) popBubble(el, index);
		}, delay);
		timeoutsRef.current.push(t);
	};

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

			{/* === Floating bubbles (mid layer) — click to pop, some also burst on their own === */}
			{BUBBLES.map((b, i) => (
				<div
					key={i}
					ref={el => {
						bubbleRefs.current[i] = el;
					}}
					onClick={() => {
						const el = bubbleRefs.current[i];
						if (el) popBubble(el, i);
					}}
					aria-hidden='true'
					className='hero-bubble absolute animate-float cursor-pointer rounded-full'
					style={{
						width: b.w,
						height: b.h,
						top: b.top,
						left: b.left,
						backgroundColor: b.color,
						border: `1px solid ${b.color.replace(/,\s*[\d.]+\)$/, ', 0.4)')}`,
						animationDuration: b.dur,
						animationDelay: b.delay,
						opacity: 0,
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
