'use client';
import { run404Animations } from '@/utils/anime-runner';
import { useEffect, useRef } from 'react';

// El "0" del medio es el mismo motivo del anillo de lenguajes que ya
// aparece en las tarjetas de proyecto: acá representa la conexión que
// se cortó (por eso las líneas punteadas que llegan y no logran
// tocarlo). Nada de ilustración genérica — reutiliza el propio
// lenguaje visual del sitio.
export default function Illustration404() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;
		return run404Animations(containerRef.current);
	}, []);

	return (
		<div
			ref={containerRef}
			className='mx-auto w-full max-w-xl transform-gpu will-change-transform'
		>
			<svg
				width='100%'
				viewBox='0 0 640 280'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				aria-hidden='true'
			>
				{/* Líneas punteadas que intentan llegar al anillo y se cortan
				    antes de tocarlo. */}
				<path
					d='M40 140 H150'
					stroke='#D1D5DB'
					strokeWidth='3'
					strokeDasharray='2 10'
					strokeLinecap='round'
				/>
				<path
					d='M490 140 H600'
					stroke='#D1D5DB'
					strokeWidth='3'
					strokeDasharray='2 10'
					strokeLinecap='round'
				/>
				{/* Chispa en el corte de cada línea */}
				<path
					d='M164 140 L172 132 M164 140 L172 148 M164 140 L156 132 M164 140 L156 148'
					stroke='#F97316'
					strokeWidth='3'
					strokeLinecap='round'
				/>
				<path
					d='M476 140 L484 132 M476 140 L484 148 M476 140 L468 132 M476 140 L468 148'
					stroke='#F97316'
					strokeWidth='3'
					strokeLinecap='round'
				/>

				{/* "4" izquierdo */}
				<text
					x='30'
					y='210'
					className='font-display'
					fontSize='190'
					fontWeight='700'
					fill='#1C1B2E'
				>
					4
				</text>

				{/* "0" central: anillo (mismo lenguaje visual que las tarjetas de
				    proyecto), con id="zero" para que el runner lo anime aparte. */}
				<g id='zero'>
					<circle
						cx='320'
						cy='140'
						r='72'
						fill='none'
						stroke='#E5E7EB'
						strokeWidth='26'
					/>
					<circle
						cx='320'
						cy='140'
						r='72'
						fill='none'
						stroke='#6366F1'
						strokeWidth='26'
						strokeDasharray='320 452'
						strokeLinecap='round'
						transform='rotate(-90 320 140)'
					/>
				</g>

				{/* "4" derecho */}
				<text
					x='430'
					y='210'
					className='font-display'
					fontSize='190'
					fontWeight='700'
					fill='#1C1B2E'
				>
					4
				</text>

				{/* Un par de nodos sueltos, como los que flotan en el hero —
				    apenas un guiño, sin repetir la escena completa. */}
				<circle cx='90' cy='60' r='5' fill='#06B6D4' opacity='0.5' />
				<circle cx='560' cy='210' r='4' fill='#8B5CF6' opacity='0.5' />
			</svg>
		</div>
	);
}
