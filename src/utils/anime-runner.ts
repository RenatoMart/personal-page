// src/utils/anime-runner.ts
import { animate } from 'animejs';

export const runEntranceAnimation = (
	targetRef?: HTMLElement | null,
	delay = 0,
) => {
	if (!targetRef) return;
	animate(targetRef, {
		y: [50, 0],
		opacity: [0, 1],
		duration: 800,
		delay,
		ease: 'outExpo',
	});
};

export const runLoopAnimation = (targetRef?: HTMLElement | null) => {
	if (!targetRef) return;
	animate(targetRef, {
		rotate: [0, 10, 0],
		duration: 1500,
		ease: 'inOutQuad',
		loop: true,
	});
};

export const runHoverAnimation = (
	targetRef: HTMLElement | null,
	isEntering: boolean,
) => {
	if (!targetRef) return;
	animate(targetRef, {
		scale: isEntering ? 1.05 : 1,
		boxShadow: isEntering
			? '0 8px 24px rgba(0,0,0,0.15)'
			: '0 2px 12px rgba(0,0,0,0.08)',
		duration: 300,
		ease: 'outQuad',
	});
};

// Anima la ilustración de la página 404: el SVG completo flota despacio,
// y el aro que hace de "0" (id="zero") gira y respira por su cuenta —
// la misma idea del anillo de lenguajes de las tarjetas de proyecto,
// pero acá referenciando una "conexión" que se cortó. Solo transform
// (translate/scale/rotate), nunca layout, para no perder cuadros.
export function run404Animations(container: HTMLElement): () => void {
	const svgEl = container.querySelector<SVGSVGElement>('svg');
	const zeroEl = container.querySelector<SVGElement>('#zero');

	if (!svgEl) return () => {};

	const prefersReducedMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)',
	).matches;
	if (prefersReducedMotion) return () => {};

	const floatAnim = animate(svgEl, {
		y: [0, 10],
		loop: true,
		ease: 'inOutSine',
		direction: 'alternate',
		duration: 1300,
	});

	const zeroAnim = zeroEl
		? animate(zeroEl, {
				rotate: [0, 8, -8, 0],
				scale: [1, 1.08, 1],
				loop: true,
				ease: 'inOutSine',
				duration: 2200,
			})
		: null;

	return () => {
		floatAnim.pause();
		zeroAnim?.pause();
	};
}
