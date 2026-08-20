"use client";
import React from 'react';
import { Github, Linkedin } from '@/components/Icons';
import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border bg-white/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-display font-bold text-xs">
            RM
          </span>
          <div>
            <p className="font-display font-semibold text-foreground text-sm">Renato Martinez</p>
            <p className="text-xs text-muted">Estudiante de Informática</p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-6 text-sm text-muted">
          {['about', 'skills', 'experience', 'projects'].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }}
              className="hover:text-primary transition-colors capitalize"
            >
              {id === 'about' ? 'Inicio' : id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
        </nav>

        {/* Socials */}
        <div className="flex items-center gap-3">
          <a href="https://github.com/RenatoMart" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all">
            <Github className="w-4 h-4" />
          </a>
          <a href="https://www.linkedin.com/in/renato-alexander-martinez-aguilar-88a391343/" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all">
            <Linkedin className="w-4 h-4" />
          </a>
          <a href="mailto:renato@example.com" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all">
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>

      <p className="text-center text-xs text-muted mt-8">
        © {new Date().getFullYear()} Renato Alexander Martinez Aguilar · Hecho con pasión y código.
      </p>
    </footer>
  );
}
