import type { LucideIcon } from 'lucide-react';
import {
	Award,
	Briefcase,
	Cpu,
	GraduationCap,
	HeartHandshake,
} from 'lucide-react';

export interface Experience {
	year: string;
	title: string;
	organization: string;
	description: string;
	tags: string[];
	icon: LucideIcon;
	accent: string;
	dot: string;
	cert: string | null;
}

export const experiences: Experience[] = [
	{
		year: '2023',
		title: 'Inicio en la Universidad Nacional de Trujillo',
		organization: 'UNT — Universidad Nacional de Trujillo',
		description:
			'Comienzo mi formación en Informática en la UNT, una de las universidades más importantes del norte del Perú. Desde el inicio me involucro activamente en proyectos académicos y actividades extracurriculares.',
		tags: ['Informática', 'UNT', 'Formación'],
		icon: GraduationCap,
		accent: 'text-primary bg-primary-light border-primary/20',
		dot: 'from-primary to-indigo-400',
		cert: null,
	},
	{
		year: '2025',
		title: 'Área de TI — SEDIPRO UNT (Voluntariado)',
		organization: 'SEDIPRO UNT — Sección Estudiantil de Dirección de Proyectos',
		description:
			'Ingreso al área de Tecnología de la Información de SEDIPRO UNT. Participo en proyectos internos aplicando enfoques ágiles y, por encargo de la presidencia, desarrollé un sistema semiautomático en Python para la generación masiva de certificados.',
		tags: ['Voluntariado', 'Python', 'Automatización', 'PMI / PMBOK'],
		icon: HeartHandshake,
		accent: 'text-violet-600 bg-violet-50 border-violet-100',
		dot: 'from-violet-500 to-purple-400',
		cert: null,
	},
	{
		year: '2025',
		title: 'Coordinador TI — SEDITALKS',
		organization: 'SEDIPRO UNT',
		description:
			'Coordinador TI en SEDITALKS, evento de SEDIPRO UNT. Gestioné la infraestructura tecnológica y colideré el desarrollo de un Sistema de Asistencia con códigos QR en Python y OpenCV, integrado en tiempo real con Google Sheets.',
		tags: ['Coordinación TI', 'Python', 'Computer Vision', 'SEDITALKS'],
		icon: Award,
		accent: 'text-secondary bg-secondary-light border-secondary/20',
		dot: 'from-secondary to-orange-400',
		cert: 'https://www.linkedin.com/in/renato-alexander-martinez-aguilar-88a391343/',
	},
	{
		year: '2026',
		title: 'Asesor TI — Proyectando Vocaciones 3.0',
		organization: 'SEDIPRO UNT',
		description:
			'Participé como Asesor del área de TI en el proyecto "Proyectando Vocaciones 3.0", ayudando a cientos de estudiantes de La Libertad a orientar su futuro profesional y conocer la vida universitaria en la UNT.',
		tags: ['Asesoría TI', 'Orientación Vocacional', 'Impacto Social'],
		icon: HeartHandshake,
		accent: 'text-accent bg-cyan-50 border-cyan-100',
		dot: 'from-accent to-cyan-400',
		cert: 'https://www.linkedin.com/in/renato-alexander-martinez-aguilar-88a391343/',
	},
	{
		year: '2026',
		title: 'Desarrollador Web Freelance — UNT',
		organization: 'Universidad Nacional de Trujillo',
		description:
			'Desarrollo de sitios web para distintas escuelas de la UNT, coordinado a través de la Oficina de Calidad, quien me derivó a cada programa institucional. Construí una plantilla reutilizable donde cada escuela solo edita su perfil sin tocar el código base.',
		tags: ['Freelance', 'React', 'Vite', 'TypeScript', 'TailwindCSS'],
		icon: Briefcase,
		accent: 'text-primary bg-primary-light border-primary/20',
		dot: 'from-primary to-indigo-400',
		cert: null,
	},
	{
		year: '2026',
		title: 'Visión por Computadora & Apps Móviles',
		organization: 'Proyectos Personales',
		description:
			'Inicio de proyectos en nuevas áreas: corrector de postura con Python, MediaPipe y ML propio (análisis RULA + modelo entrenado); y desarrollo de apps móviles con React Native y Expo para plataformas iOS y Android.',
		tags: ['Python', 'MediaPipe', 'ML', 'React Native', 'Expo'],
		icon: Cpu,
		accent: 'text-violet-600 bg-violet-50 border-violet-100',
		dot: 'from-violet-500 to-purple-400',
		cert: null,
	},
];
