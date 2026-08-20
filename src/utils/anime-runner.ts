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
