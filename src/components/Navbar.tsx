'use client';
import { Github, Linkedin } from '@/components/Icons';
import { cn } from '@/utils/cn';
import { animate } from 'animejs';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

const navLinks = [
	{ label: 'Sobre mí', href: '/#about' },
	{ label: 'Habilidades', href: '/#skills' },
	{ label: 'Trayectoria', href: '/trayectoria' },
	{ label: 'Proyectos', href: '/proyectos' },
];

export default function Navbar() {
	const navRef = useRef<HTMLElement>(null);
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		if (navRef.current) {
			animate(navRef.current, {
				translateY: [-60, 0],
				opacity: [0, 1],
				duration: 900,
				ease: 'outExpo',
				delay: 300,
			});
		}
		const onScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const handleClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
		href: string,
	) => {
		setOpen(false);

		// Hash links on the current page — smooth scroll
		if (href.startsWith('/#')) {
			const id = href.slice(2);
			if (pathname === '/') {
				e.preventDefault();
				document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
			}
			// If not on /, let Next.js navigate to /#id naturally
		}
		// Page routes like /proyectos — let Next.js handle navigation
	};

	return (
		<nav
			ref={navRef}
			className={cn(
				'fixed left-0 right-0 top-0 z-50 opacity-0 transition-all duration-300',
				scrolled
					? 'border-b border-border bg-white/90 shadow-[0_1px_24px_rgba(99,102,241,0.08)] backdrop-blur-md'
					: 'bg-transparent',
			)}
		>
			<div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-10'>
				{/* Logo */}
				<Link href='/' className='flex items-center gap-2.5'>
					<span className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary font-display text-sm font-bold text-white shadow-glow-primary'>
						RM
					</span>
					<span className='hidden font-display font-semibold text-foreground sm:block'>
						Renato Martinez
					</span>
				</Link>

				{/* Desktop links */}
				<ul className='hidden items-center gap-1 md:flex'>
					{navLinks.map(({ label, href }) => {
						const isActive =
							href === '/proyectos'
								? pathname === '/proyectos'
								: href === '/trayectoria'
									? pathname === '/trayectoria'
									: false;

						return (
							<li key={href}>
								<Link
									href={href}
									onClick={e => handleClick(e, href)}
									className={cn(
										'rounded-lg px-4 py-2 text-sm font-medium transition-all',
										isActive
											? 'bg-primary-light text-primary'
											: 'text-muted hover:bg-primary-light hover:text-foreground',
									)}
								>
									{label}
								</Link>
							</li>
						);
					})}
				</ul>

				{/* Social + CTA */}
				<div className='hidden items-center gap-3 md:flex'>
					<a
						href='https://github.com/RenatoMart'
						target='_blank'
						rel='noreferrer'
						className='flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-all hover:border-primary hover:text-primary'
					>
						<Github className='h-4 w-4' />
					</a>
					<a
						href='https://www.linkedin.com/in/renato-alexander-martinez-aguilar-88a391343/'
						target='_blank'
						rel='noreferrer'
						className='flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-all hover:border-primary hover:text-primary'
					>
						<Linkedin className='h-4 w-4' />
					</a>
				</div>

				{/* Mobile menu button */}
				<button
					onClick={() => setOpen(!open)}
					className='rounded-lg border border-border p-2 text-muted md:hidden'
				>
					{open ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
				</button>
			</div>

			{/* Mobile dropdown */}
			{open && (
				<div className='space-y-1 border-t border-border bg-white/95 px-6 py-4 backdrop-blur-md md:hidden'>
					{navLinks.map(({ label, href }) => (
						<Link
							key={href}
							href={href}
							onClick={e => handleClick(e, href)}
							className='block rounded-xl px-4 py-3 text-sm font-medium text-muted transition-all hover:bg-primary-light hover:text-foreground'
						>
							{label}
						</Link>
					))}
				</div>
			)}
		</nav>
	);
}
