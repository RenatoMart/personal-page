'use client';
import { animate } from 'animejs';
import { useEffect, useRef } from 'react';

// Una sola línea tipo terminal que se "escribe" una vez al cargar. Se
// actualiza por ref + textContent (cero re-renders de React) y el cursor
// parpadea solo 3 veces antes de quedarse fijo: un caret que parpadea
// para siempre es movimiento decorativo que distrae y cansa.
export default function TerminalLine({
	text,
	delay = 1100,
}: {
	text: string;
	delay?: number;
}) {
	const textRef = useRef<HTMLSpanElement>(null);
	const rootRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		const el = textRef.current;
		if (!el) return;
		const reduce = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;
		const root = rootRef.current;
		if (reduce) {
			el.textContent = text;
			if (root) root.style.opacity = '1';
			return;
		}
		if (root)
			animate(root, { opacity: [0, 1], duration: 300, delay, ease: 'outQuad' });
		const state = { n: 0 };
		const anim = animate(state, {
			n: text.length,
			duration: text.length * 38,
			delay,
			ease: 'linear',
			onUpdate: () => {
				el.textContent = text.slice(0, Math.round(state.n));
			},
		});
		return () => {
			anim.pause();
		};
	}, [text, delay]);

	return (
		<p
			ref={rootRef}
			style={{ opacity: 0 }}
			aria-label={text}
			className='mb-10 flex min-h-6 items-center justify-center gap-2 font-mono text-sm text-muted'
		>
			<span aria-hidden='true' className='text-secondary'>
				~ $
			</span>
			<span aria-hidden='true' ref={textRef} />
			<span
				aria-hidden='true'
				className='inline-block h-4 w-[7px] translate-y-px animate-caret bg-primary'
			/>
		</p>
	);
}
