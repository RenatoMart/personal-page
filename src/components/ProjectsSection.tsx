"use client";
import React, { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { ExternalLink } from 'lucide-react';
import { Github } from '@/components/Icons';
import { cn } from '@/utils/cn';

const projects = [
  {
    id: 1,
    title: "Ing. Agroindustrial — Web Institucional",
    category: "Trabajos Web",
    description: "Sitio web institucional reutilizable para escuelas universitarias de la UNT (coordinado por la Oficina de Calidad). Arquitectura de plantilla: código compartido + perfil por escuela. Cada escuela clona el repo y edita solo su contenido sin tocar el código base.",
    tags: ["React 18", "TypeScript", "Vite", "TailwindCSS", "Framer Motion", "Vercel"],
    accent: "text-secondary bg-secondary-light",
    link: "https://ingagroindustrial.vercel.app/",
    github: "https://github.com/RenatoMart/ing-agroindustrial",
  },
  {
    id: 2,
    title: 'Cámara ProAng — App Móvil',
    category: 'Proyectos Personales',
    description:
      'Cámara inteligente que procesa la imagen frame a frame usando un modelo entrenado para autoseleccionar la mejor guía de composición visual. Además, incorpora un "Modo Fantasma" para alinear tomas exactas o crear fusiones de doble exposición usando Skia. (Actualmente en desarrollo).',
    tags: ['React Native', 'Machine Learning', 'Expo', 'Skia', 'VisionCamera'],
    accent: 'text-primary bg-primary-light',
    link: '#',
    github: 'https://github.com/RenatoMart/camara-pro-ang',
  },
  {
    id: 3,
    title: "Sistema de Asistencia — Esperanza Baja",
    category: "Trabajos Web",
    description: "Plataforma web de gestión de asistencia para una comunidad. Desarrollada con Next.js y TypeScript, desplegada en Vercel como herramienta de seguimiento para voluntarios.",
    tags: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
    accent: "text-secondary bg-secondary-light",
    link: "https://asistencia-esperanza-baja.vercel.app",
    github: "https://github.com/RenatoMart/asistencia-esperanza-baja",
  },
  {
    id: 4,
    title: "Sistema de Almacén",
    category: "Proyectos Personales",
    description: "Aplicación de escritorio (GUI) en Python para gestión de inventario. Registra entradas y salidas en archivos JSON, calcula el inventario dinámicamente y genera reportes.",
    tags: ["Python", "GUI", "JSON", "Inventario"],
    accent: "text-accent bg-cyan-50",
    link: "#",
    github: "https://github.com/RenatoMart/SistemaAlmacen",
  },
  {
    id: 5,
    title: "Posture Corrector — IA Postural",
    category: "Proyectos Personales",
    description: "Sistema de corrección postural en tiempo real con Python y MediaPipe. Combina análisis RULA con un modelo de ML entrenado con 6 sesiones para detectar encorvamiento sostenido y disparar alertas de postura.",
    tags: ["Python", "MediaPipe", "ML", "Computer Vision"],
    accent: "text-secondary bg-secondary-light",
    link: "#",
    github: "https://github.com/RenatoMart/posture-corrector",
  },
];

const categories = ["Todos", "Trabajos Web", "Proyectos Personales", "Voluntariado"];

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState("Todos");

  const filtered = active === "Todos" ? projects : projects.filter((p) => p.category === active);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate('.proj-card', {
            translateY: [40, 0],
            opacity: [0, 1],
            duration: 700,
            delay: stagger(100),
            ease: 'outExpo',
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    animate('.proj-card', {
      scale: [0.96, 1],
      opacity: [0.3, 1],
      duration: 400,
      delay: stagger(60),
      ease: 'outSine',
    });
  }, [active]);

  return (
    <section id="projects" ref={sectionRef} className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="section-eyebrow mb-3">Portafolio</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              Trabajos &amp; proyectos<span className="text-secondary">.</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                    active === cat
                      ? "bg-primary text-white border-primary shadow-glow-primary"
                      : "bg-white text-muted border-border hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((project) => (
            <div key={project.id} className="proj-card opacity-0 glass-card overflow-hidden flex flex-col group">
              <div className="h-1.5 w-full opacity-70 group-hover:opacity-100 transition-opacity"
                   style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #F97316 100%)' }} />
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className={`pill border text-xs ${project.accent}`}>{project.category}</span>
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-6 flex-1">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag) => (
                    <span key={tag} className="pill bg-surface border border-border text-muted text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <a href={project.github} target="_blank" rel="noreferrer"
                     className="flex items-center gap-1.5 text-sm text-muted hover:text-primary font-medium transition-colors">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                  {project.link !== '#' && (
                    <a href={project.link} target="_blank" rel="noreferrer"
                       className="flex items-center gap-1.5 text-sm text-muted hover:text-primary font-medium transition-colors">
                      <ExternalLink className="w-4 h-4" /> Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
