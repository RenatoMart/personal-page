import { privateProjects } from '@/data/private-projects';

export interface PreviewImage {
	url: string;
	alt: string;
}

export interface PreviewProject {
	slug: string;
	title: string;
	category: string;
	description: string;
	tags: string[];
	accent: string;
	repoUrl: string;
	liveUrl: string | null;
	readmeHtml?: string;
	languages?: Record<string, number>;
	pushedAt?: string;
	previewUrl: string;
	previewSource?: 'screenshot' | 'social' | 'readme' | 'card';
	images?: PreviewImage[];
	// Proyecto sin repo ni demo públicos (ver src/data/private-projects.ts).
	private?: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_PREVIEW_API ?? 'http://localhost:8080';

// Imagen real = captura, imagen social o imágenes del README; lo demás es
// la tarjeta generada por el backend.
export const hasRealImage = (p: PreviewProject) =>
	(p.previewSource !== undefined && p.previewSource !== 'card') ||
	(p.images?.length ?? 0) > 0;

// Si el backend no responde (caído, Render despertando del free tier,
// timeout), la página no debe romperse con un 500: se registra el fallo y
// se devuelve una lista vacía; las secciones muestran un aviso en vez de
// tarjetas. Con ISR, mientras haya datos cacheados válidos Next los sigue
// sirviendo; esto cubre el primer render y el desarrollo local.
export async function getProjects(): Promise<PreviewProject[]> {
	try {
		return await fetchProjects();
	} catch (err) {
		// Es un estado esperado (backend dormido o apagado), no un fallo de la
		// página: se avisa con warn para que el overlay de errores de Next en
		// desarrollo no lo muestre como error. Se sigue sirviendo lo local.
		const reason = err instanceof Error ? err.message : String(err);
		// eslint-disable-next-line no-console
		console.warn(
			'[preview-api] backend no disponible, solo proyectos locales:',
			reason,
		);
		return privateProjects;
	}
}

async function fetchProjects(): Promise<PreviewProject[]> {
	const res = await fetch(`${API_BASE}/api/v1/projects`, {
		next: { revalidate: 300 }, // ISR: revalida cada 5 min, no en cada visita
		signal: AbortSignal.timeout(10_000),
	});
	if (!res.ok) {
		throw new Error(`preview API respondió ${res.status}`);
	}

	const projects: PreviewProject[] = await res.json();
	// previewUrl llega relativa ("/api/v1/projects/slug/preview");
	// se completa acá para que el <img> del navegador la resuelva bien.
	const withUrls = projects.map(p => ({
		...p,
		previewUrl: `${API_BASE}${p.previewUrl}`,
	}));

	// Los proyectos con imagen real (captura, imagen social o del README)
	// van primero; los que solo tienen la tarjeta generada, después.
	// Array.prototype.sort es estable: dentro de cada grupo se respeta el
	// orden del catálogo.
	return [...privateProjects, ...withUrls].sort(
		(a, b) => Number(hasRealImage(b)) - Number(hasRealImage(a)),
	);
}
