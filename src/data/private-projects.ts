import type { PreviewProject } from '@/lib/preview-api';

// Proyectos que no viven en un repo público de GitHub, así que el backend
// (repo-preview-service) no los conoce. Se muestran con capturas ya
// enmascaradas (nombre de empresa, RUC, proveedores y montos son de
// demostración) guardadas en public/. Sin repoUrl ni liveUrl a propósito:
// es una herramienta de uso interno con datos sensibles.
export const privateProjects: PreviewProject[] = [
	{
		slug: 'contaflow',
		title: 'ContaFlow — Gestión contable multi-empresa',
		category: 'Trabajos Web',
		description:
			'Herramienta interna para un estudio que lleva la contabilidad de varias empresas de transporte. Carga el registro de compras de SUNAT, clasifica cada comprobante con un semáforo de revisión, convierte monedas y genera reportes por categoría; incluye consultas en lenguaje natural con Gemini.',
		tags: [
			'Next.js 16',
			'TypeScript',
			'Go',
			'PostgreSQL (Neon)',
			'Drizzle ORM',
			'Gemini API',
			'Tailwind CSS',
		],
		accent: '#14507a',
		repoUrl: '',
		liveUrl: null,
		previewUrl: '/contaflow/resumen.png',
		previewSource: 'screenshot',
		private: true,
		images: [
			{
				url: '/contaflow/resumen.png',
				alt: 'ContaFlow: resumen de gasto por categoría',
			},
			{
				url: '/contaflow/bandeja.png',
				alt: 'ContaFlow: bandeja de comprobantes pendientes',
			},
			{
				url: '/contaflow/proveedores.png',
				alt: 'ContaFlow: proveedores y categorías',
			},
			{ url: '/contaflow/consultar.png', alt: 'ContaFlow: consulta con IA' },
		],
	},
];
