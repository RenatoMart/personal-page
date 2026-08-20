"use client";
import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { Github, Linkedin } from '@/components/Icons';
import { Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const navLinks = [
  { label: 'Sobre mí',    id: 'about' },
  { label: 'Habilidades', id: 'skills' },
  { label: 'Experiencia', id: 'experience' },
  { label: 'Proyectos',   id: 'projects' },
];

export default function Navbar() {
  const navRef  = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      ref={navRef}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 opacity-0',
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-[0_1px_24px_rgba(99,102,241,0.08)] border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#about" onClick={(e) => scrollTo(e, 'about')} className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-display font-bold text-sm shadow-glow-primary">
            RM
          </span>
          <span className="font-display font-semibold text-foreground hidden sm:block">Renato Martinez</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, id }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => scrollTo(e, id)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-primary-light transition-all"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Social + CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="https://github.com/RenatoMart" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all">
            <Github className="w-4 h-4" />
          </a>
          <a href="https://www.linkedin.com/in/renato-alexander-martinez-aguilar-88a391343/" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all">
            <Linkedin className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg border border-border text-muted">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-border px-6 py-4 space-y-1">
          {navLinks.map(({ label, id }) => (
            <a key={id} href={`#${id}`} onClick={(e) => scrollTo(e, id)} className="block px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-primary-light transition-all">
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
