'use client';
import { animate } from 'animejs';
import { useEffect, useRef } from 'react';

// Línea tipo terminal que escribe, hace una pausa, borra y pasa a la
// siguiente frase, en bucle. Todo por ref + textContent (cero re-renders).
// El cursor queda fijo mientras escribe/borra y parpadea solo en las
// pausas, como uno real. Se detiene si la pestaña está oculta o la línea
// sale de pantalla, y con prefers-reduced-motion muestra una frase fija.
const TYPE_MS = 42;
const ERASE_MS = 22;
const HOLD_MS = 2200;
const GAP_MS = 450;

export default function TerminalLine({
	phrases,
	delay = 1100,
	dark = false,
}: {
	phrases: string[];
	delay?: number;
	dark?: boolean;
}) {
	const rootRef = useRef<HTMLParagraphElement>(null);
	const textRef = useRef<HTMLSpanElement>(null);
	const caretRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const root = rootRef.current;
		const textEl = textRef.current;
		const caret = caretRef.current;
		if (!root || !textEl || !caret) return;

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			textEl.textContent = phrases[0];
			root.style.opacity = '1';
			return;
		}

		animate(root, { opacity: [0, 1], duration: 300, delay, ease: 'outQuad' });

		let timer: ReturnType<typeof setTimeout>;
		let phrase = 0;
		let chars = 0;
		let mode: 'type' | 'hold' | 'erase' | 'gap' = 'type';
		let running = true;
		let inView = true;

		const setTyping = (typing: boolean) => {
			caret.classList.toggle('animate-caret', !typing);
		};

		const tick = () => {
			if (!running || !inView) return;
			const full = phrases[phrase];
			if (mode === 'type') {
				setTyping(true);
				chars += 1;
				textEl.textContent = full.slice(0, chars);
				if (chars >= full.length) {
					mode = 'hold';
					setTyping(false);
					timer = setTimeout(tick, HOLD_MS);
					return;
				}
				timer = setTimeout(tick, TYPE_MS + Math.random() * 35);
			} else if (mode === 'hold') {
				mode = 'erase';
				tick();
			} else if (mode === 'erase') {
				setTyping(true);
				chars -= 1;
				textEl.textContent = full.slice(0, Math.max(chars, 0));
				if (chars <= 0) {
					mode = 'gap';
					setTyping(false);
					phrase = (phrase + 1) % phrases.length;
					timer = setTimeout(tick, GAP_MS);
					return;
				}
				timer = setTimeout(tick, ERASE_MS);
			} else {
				mode = 'type';
				tick();
			}
		};

		const start = () => {
			clearTimeout(timer);
			if (running && inView) timer = setTimeout(tick, 120);
		};

		const first = setTimeout(start, delay);
		const io = new IntersectionObserver(([entry]) => {
			inView = entry.isIntersecting;
			if (inView) start();
			else clearTimeout(timer);
		});
		io.observe(root);
		const onVis = () => {
			running = document.visibilityState === 'visible';
			if (running) start();
			else clearTimeout(timer);
		};
		document.addEventListener('visibilitychange', onVis);

		return () => {
			running = false;
			clearTimeout(first);
			clearTimeout(timer);
			io.disconnect();
			document.removeEventListener('visibilitychange', onVis);
		};
	}, [phrases, delay]);

	return (
		<p
			ref={rootRef}
			style={{ opacity: 0 }}
			aria-label={phrases[0]}
			className={`mb-10 min-h-6 w-full max-w-xs text-center font-mono text-sm leading-relaxed sm:w-[46ch] sm:max-w-none sm:text-left ${dark ? 'text-slate-400' : 'text-muted'}`}
		>
			<span aria-hidden='true' className='mr-2 text-secondary'>
				~ $
			</span>
			<span aria-hidden='true' ref={textRef} />
			<span
				aria-hidden='true'
				ref={caretRef}
				className='ml-1 inline-block h-4 w-[7px] translate-y-[3px] bg-primary'
			/>
		</p>
	);
}
