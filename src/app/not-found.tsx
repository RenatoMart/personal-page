import Footer from '@/components/Footer';
import Illustration404 from '@/components/Illustration404';
import Navbar from '@/components/Navbar';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
	return (
		<main className='min-h-screen bg-background text-foreground selection:bg-primary/30'>
			<Navbar />
			<div className='flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center'>
				<Illustration404 />

				<p className='section-eyebrow mb-3 mt-10'>Error 404</p>
				<h1 className='font-display text-3xl font-bold text-foreground md:text-5xl'>
					Esta ruta se desconectó<span className='text-secondary'>.</span>
				</h1>
				<p className='mt-4 max-w-md text-base leading-relaxed text-muted'>
					El enlace que seguiste puede estar roto, o la página se movió de
					lugar. Volvé al inicio para seguir explorando.
				</p>

				<div className='mt-10 flex flex-col items-center gap-4 sm:flex-row'>
					<Link
						href='/'
						className='group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white shadow-glow-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg'
						style={{
							background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
						}}
					>
						Volver al inicio{' '}
						<ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
					</Link>
					<Link
						href='/proyectos'
						className='inline-flex items-center gap-2 rounded-full border border-border bg-white px-7 py-3.5 font-semibold text-foreground shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover'
					>
						Ver proyectos
					</Link>
				</div>
			</div>
			<Footer />
		</main>
	);
}
