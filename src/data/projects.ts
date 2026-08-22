export interface Project {
	id: number;
	title: string;
	category: string;
	description: string;
	tags: string[];
	accent: string;
	link: string;
	github: string;
}

export const projects: Project[] = [
	{
		id: 1,
		title: 'Ing. Agroindustrial — Web Institucional',
		category: 'Trabajos Web',
		description:
			'Sitio web institucional reutilizable para escuelas universitarias de la UNT (coordinado por la Oficina de Calidad). Arquitectura de plantilla: código compartido + perfil por escuela. Cada escuela clona el repo y edita solo su contenido sin tocar el código base.',
		tags: [
			'React 18',
			'TypeScript',
			'Vite',
			'TailwindCSS',
			'Framer Motion',
			'Vercel',
		],
		accent: 'text-secondary bg-secondary-light',
		link: 'https://ingagroindustrial.vercel.app/',
		github: 'https://github.com/RenatoMart/ing-agroindustrial',
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
		title: 'Sistema de Asistencia — Esperanza Baja',
		category: 'Trabajos Web',
		description:
			'Plataforma web de gestión de asistencia para una comunidad. Desarrollada con Next.js y TypeScript, desplegada en Vercel como herramienta de seguimiento para voluntarios.',
		tags: ['Next.js', 'TypeScript', 'Tailwind', 'Vercel'],
		accent: 'text-secondary bg-secondary-light',
		link: 'https://asistencia-esperanza-baja.vercel.app',
		github: 'https://github.com/RenatoMart/asistencia-esperanza-baja',
	},
	{
		id: 4,
		title: 'Sistema de Almacén',
		category: 'Proyectos Personales',
		description:
			'Aplicación de escritorio (GUI) en Python para gestión de inventario. Registra entradas y salidas en archivos JSON, calcula el inventario dinámicamente y genera reportes.',
		tags: ['Python', 'GUI', 'JSON', 'Inventario'],
		accent: 'text-accent bg-cyan-50',
		link: '#',
		github: 'https://github.com/RenatoMart/SistemaAlmacen',
	},
	{
		id: 5,
		title: 'Posture Corrector — IA Postural',
		category: 'Proyectos Personales',
		description:
			'Sistema de corrección postural en tiempo real con Python y MediaPipe. Combina análisis RULA con un modelo de ML entrenado con 6 sesiones para detectar encorvamiento sostenido y disparar alertas de postura.',
		tags: ['Python', 'MediaPipe', 'ML', 'Computer Vision'],
		accent: 'text-secondary bg-secondary-light',
		link: '#',
		github: 'https://github.com/RenatoMart/posture-corrector',
	},
	{
		id: 6,
		title: 'Sistema de Asistencia QR — SEDITALKS',
		category: 'Voluntariado',
		description:
			'Sistema de control de asistencia mediante códigos QR desarrollado para eventos de SEDIPRO. Cuenta con integración a Google Sheets en tiempo real, modo automático de escaneo, y registro manual. Construido con Python y OpenCV.',
		tags: ['Python', 'OpenCV', 'Tkinter', 'Google Sheets API'],
		accent: 'text-secondary bg-secondary-light',
		link: '#',
		github: 'https://github.com/RenatoMart/Seditalks',
	},
	{
		id: 7,
		title: 'Generador de Certificados Semiautomático',
		category: 'Voluntariado',
		description:
			'Sistema de escritorio para generar certificados automáticamente a partir de archivos Excel. Cuenta con interfaz gráfica para carga de datos, previsualización de diseños y exportación por lotes. Desarrollado por encargo de la presidencia de SEDIPRO 2025.',
		tags: ['Python', 'Tkinter', 'Pandas', 'Pillow'],
		accent: 'text-primary bg-primary-light',
		link: '#',
		github: 'https://github.com/RenatoMart/certificados-semiautomaticos',
	},
];

export const categories = [
	'Todos',
	'Trabajos Web',
	'Proyectos Personales',
	'Voluntariado',
];
