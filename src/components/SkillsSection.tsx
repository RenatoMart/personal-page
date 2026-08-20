"use client";
import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { Code2, Database, Workflow, Wrench } from 'lucide-react';

const categories = [
  {
    title: "Lenguajes",
    icon: Code2,
    color: "text-primary bg-primary-light",
    dot: "bg-primary",
    skills: ["C++", "Python", "JavaScript", "TypeScript", "Java", "SQL"],
  },
  {
    title: "Bases de Datos",
    icon: Database,
    color: "text-accent bg-cyan-50",
    dot: "bg-accent",
    skills: ["PostgreSQL", "MySQL", "MariaDB"],
  },
  {
    title: "Metodologías",
    icon: Workflow,
    color: "text-violet-600 bg-violet-50",
    dot: "bg-violet-500",
    skills: ["Scrum (Agile)", "RUP", "PMI / PMBOK"],
  },
  {
    title: "Herramientas & IDEs",
    icon: Wrench,
    color: "text-secondary bg-secondary-light",
    dot: "bg-secondary",
    skills: ["VS Code", "WebStorm", "IntelliJ IDEA", "CLion", "PyCharm", "PhpStorm", "DataGrip", "Antigravity"],
  },
];

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate('.skill-card', {
            translateY: [40, 0],
            opacity: [0, 1],
            duration: 700,
            delay: stagger(120),
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

  return (
    <section id="skills" ref={sectionRef} className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow mb-3">Stack técnico</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              Lo que sé hacer<span className="text-secondary">.</span>
            </h2>
          </div>
          <p className="text-muted max-w-sm text-base leading-relaxed">
            Herramientas, lenguajes y metodologías que aplico para construir software sólido.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="skill-card opacity-0 glass-card p-7 flex flex-col"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${cat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-4">{cat.title}</h3>
                <ul className="space-y-2.5 mt-auto">
                  {cat.skills.map((skill) => (
                    <li key={skill} className="flex items-center gap-2.5 text-sm text-muted">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cat.dot}`} />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
