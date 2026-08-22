'use client';
import { Github, Linkedin } from '@/components/Icons';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
	return (
		<footer className='border-t border-border bg-white/60 px-6 py-12 backdrop-blur-sm'>
			<div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row'>
				{/* Brand */}
				<div className='flex items-center gap-3'>
					<span className='flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary font-display text-xs font-bold text-white'>
						RM
					</span>
					<div>
						<p className='font-display text-sm font-semibold text-foreground'>
							Renato Martinez
						</p>
						<p className='text-xs text-muted'>Estudiante de Informática</p>
					</div>
				</div>

				{/* Links */}
				<nav className='flex items-center gap-6 text-sm text-muted'>
					<Link href='/' className='transition-colors hover:text-primary'>
						Inicio
					</Link>
					<Link
						href='/#skills'
						className='transition-colors hover:text-primary'
					>
						Habilidades
					</Link>
					<Link
						href='/trayectoria'
						className='transition-colors hover:text-primary'
					>
						Trayectoria
					</Link>
					<Link
						href='/proyectos'
						className='transition-colors hover:text-primary'
					>
						Proyectos
					</Link>
				</nav>

				{/* Socials */}
				<div className='flex items-center gap-3'>
					<a
						href='https://github.com/RenatoMart'
						target='_blank'
						rel='noreferrer'
						className='flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition-all hover:border-primary hover:text-primary'
					>
						<Github className='h-4 w-4' />
					</a>
					<a
						href='https://www.linkedin.com/in/renato-alexander-martinez-aguilar-88a391343/'
						target='_blank'
						rel='noreferrer'
						className='flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition-all hover:border-primary hover:text-primary'
					>
						<Linkedin className='h-4 w-4' />
					</a>
					<a
						href='mailto:renato@example.com'
						className='flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition-all hover:border-primary hover:text-primary'
					>
						<Mail className='h-4 w-4' />
					</a>
				</div>
			</div>

			<p className='mt-8 text-center text-xs text-muted'>
				© {new Date().getFullYear()} Renato Alexander Martinez Aguilar · Hecho
				con pasión y código.
			</p>
		</footer>
	);
}
