'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Un único IntersectionObserver para toda la página: marca con `.is-in`
// cualquier [data-reveal] o [data-reveal-group] cuando
// entra al viewport, y el CSS (globals.css) hace el resto con transiciones
// de transform/opacity. Cero estado de React por elemento.
export default function RevealOnScroll() {
	const pathname = usePathname();

	useEffect(() => {
		const root = document.documentElement;
		const targets = document.querySelectorAll<HTMLElement>(
			'[data-reveal], [data-reveal-group], [data-reveal-bar], [data-reveal-stagger]',
		);
		const observer = new IntersectionObserver(
			entries => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					entry.target.classList.add('is-in');
					observer.unobserve(entry.target);
				}
			},
			{ threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
		);
		targets.forEach(el => observer.observe(el));
		// Recién ahora se oculta lo que falta revelar: sin JS todo queda visible.
		root.classList.add('reveal-ready');
		return () => observer.disconnect();
	}, [pathname]);

	return null;
}
