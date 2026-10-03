'use client';
import { useEffect, useRef } from 'react';

// Puente entre el hero oscuro y el resto de la página: en vez de un
// degradado con transparencia (que sobre fondo claro se ve lechoso), una
// rampa de color opaca de azul-noche a lavanda a blanco, con una nebulosa
// que sigue "bajando": polvo que cae, hilos de datos con un destello que
// viaja hacia abajo y manchas de color a la deriva. Todo transform/opacity;
// las animaciones infinitas se pausan cuando el puente sale de pantalla.
export default function HeroBridge() {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(([entry]) => {
			el.dataset.offscreen = String(!entry.isIntersecting);
		});
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<div ref={ref} aria-hidden='true' className='relative h-56'>
			<div
				className='pointer-events-none absolute inset-x-0 top-0 h-[600px] overflow-hidden'
				style={{
					zIndex: -1,
					background:
						'linear-gradient(in oklab to bottom, #060918 0%, #0f0e2e 10%, #2a2a6a 22%, #6b6fc4 34%, #b9c3f5 44%, #e6eafc 54%, #fafaf8 68%, #fafaf8 100%)',
				}}
			>
				{/* Manchas de nebulosa a la deriva */}
				<div className='bridge-anim absolute -left-24 top-10 h-72 w-72 animate-blob rounded-full bg-indigo-500/25 blur-3xl' />
				<div
					className='bridge-anim absolute right-0 top-24 h-80 w-80 animate-blob rounded-full bg-cyan-400/15 blur-3xl'
					style={{ animationDelay: '-3s' }}
				/>
				<div
					className='bridge-anim absolute left-1/3 top-48 h-64 w-64 animate-blob rounded-full bg-violet-400/20 blur-3xl'
					style={{ animationDelay: '-6s' }}
				/>

				{/* Polvo que cae, en dos capas con velocidades distintas */}
				<div className='bridge-mask absolute inset-0'>
					<div className='bridge-dust bridge-dust-a bridge-anim absolute inset-x-0 top-0' />
					<div className='bridge-dust bridge-dust-b bridge-anim absolute inset-x-0 top-0' />
				</div>

				{/* Hilos de datos: línea tenue + destello que baja */}
				<div className='bridge-mask absolute inset-0'>
					{[12, 31, 52, 70, 88].map((left, i) => (
						<div
							key={left}
							className='absolute top-0 h-full w-px overflow-hidden'
							style={{
								left: left + '%',
								background:
									'linear-gradient(to bottom, rgba(165,180,252,0.28), transparent 85%)',
							}}
						>
							<span
								className='bridge-anim bridge-pulse absolute left-0 h-24 w-px'
								style={{
									animationDuration: 5.5 + (i % 3) * 1.6 + 's',
									animationDelay: -i * 1.7 + 's',
								}}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
