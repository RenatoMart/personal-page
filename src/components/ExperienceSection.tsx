"use client";
import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { HeartHandshake, GraduationCap, Briefcase, Cpu, Award } from 'lucide-react';
import { Linkedin } from '@/components/Icons';

const experiences = [
  {
    year: "2023",
    title: "Inicio en la Universidad Nacional de Trujillo",
    organization: "UNT — Universidad Nacional de Trujillo",
    description: "Comienzo mi formación en Informática en la UNT, una de las universidades más importantes del norte del Perú. Desde el inicio me involucro activamente en proyectos académicos y actividades extracurriculares.",
    tags: ["Informática", "UNT", "Formación"],
    icon: GraduationCap,
    accent: "text-primary bg-primary-light border-primary/20",
    dot: "from-primary to-indigo-400",
    cert: null,
  },
  {
    year: "2025",
    title: "Área de TI — SEDIPRO UNT (Voluntariado)",
    organization: "SEDIPRO UNT — Sección Estudiantil de Dirección de Proyectos",
    description: "Ingreso al área de Tecnología de la Información de SEDIPRO UNT, una sección estudiantil que trabaja bajo los estándares del PMI y el PMBOK. Participo en proyectos internos aplicando buenas prácticas de gestión de proyectos y enfoques ágiles.",
    tags: ["Voluntariado", "TI", "PMI / PMBOK", "Ágil"],
    icon: HeartHandshake,
    accent: "text-violet-600 bg-violet-50 border-violet-100",
    dot: "from-violet-500 to-purple-400",
    cert: null,
  },
  {
    year: "2025",
    title: "Coordinador TI — SEDITALKS",
    organization: "SEDIPRO UNT",
    description: "Coordinador TI en SEDITALKS, evento de SEDIPRO UNT (basado en estándares PMI/PMBOK). Gestioné la infraestructura tecnológica del evento, aplicando marcos de gestión de proyectos y liderazgo de equipo para asegurar una ejecución impecable.",
    tags: ["Coordinación TI", "PMI / PMBOK", "Liderazgo", "SEDITALKS"],
    icon: Award,
    accent: "text-secondary bg-secondary-light border-secondary/20",
    dot: "from-secondary to-orange-400",
    cert: "https://www.linkedin.com/in/renato-alexander-martinez-aguilar-88a391343/",
  },
  {
    year: "2026",
    title: "Asesor TI — Proyectando Vocaciones 3.0",
    organization: "SEDIPRO UNT",
    description: "Participé como Asesor del área de TI en el proyecto \"Proyectando Vocaciones 3.0\", ayudando a cientos de estudiantes de La Libertad a orientar su futuro profesional y conocer la vida universitaria en la UNT.",
    tags: ["Asesoría TI", "Orientación Vocacional", "Impacto Social"],
    icon: HeartHandshake,
    accent: "text-accent bg-cyan-50 border-cyan-100",
    dot: "from-accent to-cyan-400",
    cert: "https://www.linkedin.com/in/renato-alexander-martinez-aguilar-88a391343/",
  },
  {
    year: "2026",
    title: "Desarrollador Web Freelance — UNT",
    organization: "Universidad Nacional de Trujillo",
    description: "Desarrollo de sitios web para distintas escuelas de la UNT, coordinado a través de la Oficina de Calidad, quien me derivó a cada programa institucional. Construí una plantilla reutilizable donde cada escuela solo edita su perfil sin tocar el código base.",
    tags: ["Freelance", "React", "Vite", "TypeScript", "TailwindCSS"],
    icon: Briefcase,
    accent: "text-primary bg-primary-light border-primary/20",
    dot: "from-primary to-indigo-400",
    cert: null,
  },
  {
    year: "2026",
    title: "Visión por Computadora & Apps Móviles",
    organization: "Proyectos Personales",
    description: "Inicio de proyectos en nuevas áreas: corrector de postura con Python, MediaPipe y ML propio (análisis RULA + modelo entrenado); y desarrollo de apps móviles con React Native y Expo para plataformas iOS y Android.",
    tags: ["Python", "MediaPipe", "ML", "React Native", "Expo"],
    icon: Cpu,
    accent: "text-violet-600 bg-violet-50 border-violet-100",
    dot: "from-violet-500 to-purple-400",
    cert: null,
  },
];

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate('.exp-card', {
            translateX: [-30, 0],
            opacity: [0, 1],
            duration: 750,
            delay: stagger(140),
            ease: 'outExpo',
          });
          animate('.timeline-fill', {
            height: ['0%', '100%'],
            duration: 1800,
            ease: 'inOutCubic',
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="experience" ref={sectionRef} className="py-28 px-6 bg-surface-2/50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="section-eyebrow mb-3">Trayectoria</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              Mi camino hasta aquí<span className="text-primary">.</span>
            </h2>
            <a
              href="https://www.linkedin.com/in/renato-alexander-martinez-aguilar-88a391343/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20 text-sm font-medium hover:bg-[#0A66C2]/20 transition-colors self-start md:self-auto"
            >
              <Linkedin className="w-4 h-4" />
              Ver certificados en LinkedIn
            </a>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative pl-10 md:pl-14">
          {/* Vertical line */}
          <div className="absolute left-3 md:left-5 top-0 bottom-0 w-0.5 bg-border overflow-hidden rounded-full">
            <div className="timeline-fill h-0 w-full bg-gradient-to-b from-primary via-violet-400 via-secondary to-accent origin-top rounded-full" />
          </div>

          <div className="space-y-8">
            {experiences.map((exp, idx) => {
              const Icon = exp.icon;
              return (
                <div key={idx} className="exp-card opacity-0 relative flex gap-6">
                  {/* Node */}
                  <div className={`absolute -left-10 md:-left-14 mt-1 w-8 h-8 rounded-xl border flex items-center justify-center z-10 flex-shrink-0 ${exp.accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Card */}
                  <div className="flex-1 glass-card p-6 group hover:shadow-card-hover">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-foreground/5 border border-border text-xs font-semibold text-muted tracking-wide">
                        {exp.year}
                      </span>
                      {exp.cert && (
                        <a
                          href={exp.cert}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20 text-xs font-medium hover:bg-[#0A66C2]/20 transition-colors"
                        >
                          <Linkedin className="w-3 h-3" />
                          Certificado
                        </a>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-sm font-semibold text-muted mb-3">{exp.organization}</p>
                    <p className="text-sm text-muted leading-relaxed mb-4">{exp.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {exp.tags.map((tag) => (
                        <span key={tag} className={`pill border text-xs ${exp.accent}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
