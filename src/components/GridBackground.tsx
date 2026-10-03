'use client';
import { useEffect, useRef, useState } from 'react';

// Fondo "plano técnico": cuadrícula fina con un punto en cada cruce y, alrededor
// del cursor (o del dedo), la misma cuadrícula más marcada, con los puntos
// encendidos y un resplandor suave. Nada se dibuja ni se anima detrás del
// texto; el movimiento aparece cuando lo provocas. Sin mouse ni dedo, la luz
// recorre la cuadrícula muy despacio. La capa iluminada es pequeña y se mueve
// con transform; solo su background-position se ajusta para coincidir con la
// base. Con prefers-reduced-motion queda solo la cuadrícula base.
const RGB = '99,102,241';
const c = (a: number) => `rgba(${RGB},${a})`;

type Sizes = { cell: number; spot: number };
const DESKTOP: Sizes = { cell: 44, spot: 600 };
const COMPACT: Sizes = { cell: 32, spot: 380 };

function lines(cell: number, minor: number, major: number) {
	const big = cell * 5;
	return {
		image: [
			`linear-gradient(${c(major)} 1px, transparent 1px)`,
			`linear-gradient(90deg, ${c(major)} 1px, transparent 1px)`,
			`linear-gradient(${c(minor)} 1px, transparent 1px)`,
			`linear-gradient(90deg, ${c(minor)} 1px, transparent 1px)`,
		],
		size: [
			`${big}px ${big}px`,
			`${big}px ${big}px`,
			`${cell}px ${cell}px`,
			`${cell}px ${cell}px`,
		],
	};
}

const dot = (a: number, r: number) =>
	`radial-gradient(circle, ${c(a)} ${r}px, transparent ${r + 0.8}px)`;

export default function GridBackground() {
	const spotRef = useRef<HTMLDivElement>(null);
	const [sz, setSz] = useState<Sizes>(DESKTOP);

	useEffect(() => {
		setSz(window.innerWidth < 700 ? COMPACT : DESKTOP);
	}, []);

	useEffect(() => {
		const spot = spotRef.current;
		if (!spot) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const { cell, spot: S } = sz;
		const h = S / 2;
		const touchOnly = window.matchMedia('(hover: none)').matches;

		let raf = 0;
		let tx = 0;
		let ty = 0;
		let x = 0;
		let y = 0;
		let following = false;
		let driftT = Math.random() * 10;
		let lastDrift = 0;
		let fadeTimer = 0;

		const place = (px: number, py: number) => {
			spot.style.transform = `translate3d(${px - h}px, ${py - h}px, 0)`;
			// Fondo 0: resplandor (fijo). Siguientes: cuadrícula (4), puntos (1).
			const o = `${h - px}px ${h - py}px`;
			const d = `${h - px + cell / 2}px ${h - py + cell / 2}px`;
			spot.style.backgroundPosition = `0 0, ${o}, ${o}, ${o}, ${o}, ${d}`;
		};
		const loop = (now: number) => {
			raf = requestAnimationFrame(loop);
			if (following) {
				x += (tx - x) * 0.2;
				y += (ty - y) * 0.2;
				place(x, y);
				return;
			}
			if (now - lastDrift < 45) return;
			lastDrift = now;
			driftT += 0.0017;
			x = window.innerWidth * (0.5 + 0.4 * Math.sin(driftT * 1.3));
			y = window.innerHeight * (0.45 + 0.32 * Math.sin(driftT * 0.9 + 1));
			place(x, y);
		};
		const start = () => {
			if (!raf) raf = requestAnimationFrame(loop);
		};
		const stop = () => {
			cancelAnimationFrame(raf);
			raf = 0;
		};
		const follow = (px: number, py: number) => {
			window.clearTimeout(fadeTimer);
			if (!following) {
				x = px;
				y = py;
			}
			following = true;
			tx = px;
			ty = py;
			spot.style.opacity = '1';
		};
		const release = () => {
			window.clearTimeout(fadeTimer);
			fadeTimer = window.setTimeout(
				() => {
					following = false;
					if (!touchOnly) spot.style.opacity = '0';
				},
				touchOnly ? 1400 : 0,
			);
		};

		const onPointer = (e: PointerEvent) => {
			if (e.pointerType === 'mouse') follow(e.clientX, e.clientY);
		};
		const onTouch = (e: TouchEvent) => {
			const t = e.touches[0];
			if (t) follow(t.clientX, t.clientY);
		};
		const onVis = () =>
			document.visibilityState === 'visible' ? start() : stop();

		spot.style.opacity = touchOnly ? '0.85' : '0';
		start();
		window.addEventListener('pointermove', onPointer, { passive: true });
		window.addEventListener('touchstart', onTouch, { passive: true });
		window.addEventListener('touchmove', onTouch, { passive: true });
		window.addEventListener('touchend', release, { passive: true });
		window.addEventListener('touchcancel', release, { passive: true });
		document.documentElement.addEventListener('pointerleave', release);
		document.addEventListener('visibilitychange', onVis);
		return () => {
			stop();
			window.clearTimeout(fadeTimer);
			window.removeEventListener('pointermove', onPointer);
			window.removeEventListener('touchstart', onTouch);
			window.removeEventListener('touchmove', onTouch);
			window.removeEventListener('touchend', release);
			window.removeEventListener('touchcancel', release);
			document.documentElement.removeEventListener('pointerleave', release);
			document.removeEventListener('visibilitychange', onVis);
		};
	}, [sz]);

	const { cell, spot: S } = sz;
	const base = lines(cell, 0.055, 0.09);
	const lit = lines(cell, 0.22, 0.34);
	const glow = `radial-gradient(circle, ${c(0.13)}, transparent 68%)`;
	const r = S / 2;
	const mask = `radial-gradient(circle ${r}px at 50% 50%, black 0%, transparent 100%)`;
	const fade =
		'radial-gradient(ellipse 90% 85% at 50% 45%, black 35%, transparent 100%)';

	return (
		<div
			aria-hidden='true'
			className='pointer-events-none fixed inset-0 overflow-hidden'
			style={{ zIndex: -1 }}
		>
			{/* Base: cuadrícula y puntos en los cruces, más tenues hacia los bordes */}
			<div
				className='absolute inset-0'
				style={{
					backgroundImage: [...base.image, dot(0.2, 1.2)].join(','),
					backgroundSize: [...base.size, `${cell}px ${cell}px`].join(','),
					backgroundPosition: `0 0, 0 0, 0 0, 0 0, ${cell / 2}px ${cell / 2}px`,
					WebkitMaskImage: fade,
					maskImage: fade,
				}}
			/>
			{/* Capa iluminada alrededor del cursor / dedo */}
			<div
				ref={spotRef}
				className='absolute left-0 top-0 transition-opacity duration-500'
				style={{
					width: S,
					height: S,
					opacity: 0,
					backgroundImage: [glow, ...lit.image, dot(0.75, 1.8)].join(','),
					backgroundSize: [
						`100% 100%`,
						...lit.size,
						`${cell}px ${cell}px`,
					].join(','),
					WebkitMaskImage: mask,
					maskImage: mask,
					willChange: 'transform',
				}}
			/>
		</div>
	);
}
