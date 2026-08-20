"use client";
import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { ArrowRight, Code2 } from 'lucide-react';
import { Github, Linkedin } from '@/components/Icons';

// Bubble config: size, position, color, duration — kept subtle but visible
const BUBBLES = [
  { w: 80,  h: 80,  top: '12%',  left: '8%',   color: 'rgba(99,102,241,0.18)',  dur: '7.2s', delay: '0s' },
  { w: 48,  h: 48,  top: '70%',  left: '5%',   color: 'rgba(139,92,246,0.15)',  dur: '9.5s', delay: '1s' },
  { w: 120, h: 120, top: '20%',  left: '88%',  color: 'rgba(99,102,241,0.12)',  dur: '11s',  delay: '2s' },
  { w: 36,  h: 36,  top: '80%',  left: '80%',  color: 'rgba(249,115,22,0.15)',  dur: '8.4s', delay: '0.5s' },
  { w: 64,  h: 64,  top: '50%',  left: '92%',  color: 'rgba(6,182,212,0.14)',   dur: '10.2s', delay: '1.5s' },
  { w: 28,  h: 28,  top: '35%',  left: '3%',   color: 'rgba(139,92,246,0.20)',  dur: '6.8s', delay: '0.2s' },
  { w: 56,  h: 56,  top: '88%',  left: '45%',  color: 'rgba(99,102,241,0.14)',  dur: '12s',  delay: '2.5s' },
  { w: 40,  h: 40,  top: '8%',   left: '55%',  color: 'rgba(249,115,22,0.12)',  dur: '9.0s', delay: '0.8s' },
  { w: 72,  h: 72,  top: '60%',  left: '60%',  color: 'rgba(6,182,212,0.11)',   dur: '8.8s', delay: '1.2s' },
  { w: 32,  h: 32,  top: '42%',  left: '75%',  color: 'rgba(99,102,241,0.16)',  dur: '7.6s', delay: '0.6s' },
];

export default function HeroSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const badgeRef    = useRef<HTMLDivElement>(null);
  const line1Ref    = useRef<HTMLDivElement>(null);
  const line2Ref    = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Content entrance (only runs once on mount)
    const els = [
      badgeRef.current,
      line1Ref.current,
      line2Ref.current,
      subtitleRef.current,
      ctaRef.current,
    ].filter(Boolean);

    animate(els, {
      translateY: [28, 0],
      opacity: [0, 1],
      delay: stagger(110, { start: 300 }),
      duration: 850,
      ease: 'outExpo',
    });
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-24 pb-16"
    >
      {/* === Soft large blobs (background layer, using CSS animate-blob for performance) === */}
      <div
        className="absolute -top-32 -left-16 w-[600px] h-[600px] rounded-full opacity-35 pointer-events-none animate-blob"
        style={{ background: 'radial-gradient(circle, #c7d2fe 0%, #e0e7ff 40%, transparent 70%)', animationDelay: '0s' }}
      />
      <div
        className="absolute -bottom-32 -right-16 w-[560px] h-[560px] rounded-full opacity-30 pointer-events-none animate-blob"
        style={{ background: 'radial-gradient(circle, #fed7aa 0%, #fde68a 40%, transparent 70%)', animationDelay: '2s' }}
      />

      {/* === Floating bubbles (mid layer, CSS animation for better performance) === */}
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none animate-float"
          style={{
            width:  b.w,
            height: b.h,
            top:    b.top,
            left:   b.left,
            backgroundColor: b.color,
            border: `1px solid ${b.color.replace(/,\s*[\d.]+\)$/, ', 0.4)')}`,
            animationDuration: b.dur,
            animationDelay: b.delay,
            willChange: 'transform',
          }}
        />
      ))}

      {/* === Content (top layer) === */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">

        {/* Badge */}
        <div ref={badgeRef} className="opacity-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary/25 text-primary text-sm font-semibold mb-10 shadow-sm">
          <Code2 className="w-3.5 h-3.5" />
          Informática · Desarrollo Web · Voluntariado
        </div>

        {/* Greeting */}
        <div ref={line1Ref} className="opacity-0 mb-3">
          <span className="text-2xl md:text-3xl font-sans font-normal text-muted tracking-wide">
            Hola, soy
          </span>
        </div>

        {/* Name */}
        <div ref={line2Ref} className="opacity-0 mb-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight tracking-tight text-foreground">
            Renato{' '}
            <span className="text-primary">Martinez</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p ref={subtitleRef} className="opacity-0 text-base md:text-lg text-muted max-w-xl mb-10 leading-relaxed">
          Construyo software que funciona bien y se ve mejor. Estudiante de informática con
          experiencia en desarrollo web, gestión de bases de datos y trabajo en equipo ágil.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="opacity-0 flex flex-col sm:flex-row items-center gap-4 mb-10">
          <a
            href="#projects"
            onClick={(e) => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-white shadow-glow-primary hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
          >
            Ver proyectos <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="#experience"
            onClick={(e) => { e.preventDefault(); document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-foreground bg-white border border-border shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200"
          >
            Mi trayectoria
          </a>
        </div>

        {/* Social links */}
        <div className="flex items-center gap-5 text-sm text-muted">
          <a href="https://github.com/RenatoMart" target="_blank" rel="noreferrer"
             className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Github className="w-4 h-4" /> RenatoMart
          </a>
          <span className="w-px h-4 bg-border" />
          <a href="https://www.linkedin.com/in/renato-alexander-martinez-aguilar-88a391343/" target="_blank" rel="noreferrer"
             className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Linkedin className="w-4 h-4" /> LinkedIn
          </a>
        </div>

      </div>
    </section>
  );
}
