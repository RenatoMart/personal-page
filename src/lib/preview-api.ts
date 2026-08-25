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
}

const API_BASE = process.env.NEXT_PUBLIC_PREVIEW_API ?? 'http://localhost:8080';

export async function getProjects(): Promise<PreviewProject[]> {
	const res = await fetch(`${API_BASE}/api/v1/projects`, {
		next: { revalidate: 300 }, // ISR: revalida cada 5 min, no en cada visita
	});
	if (!res.ok) {
		throw new Error(`preview API respondió ${res.status}`);
	}

	const projects: PreviewProject[] = await res.json();
	// previewUrl llega relativa ("/api/v1/projects/slug/preview");
	// se completa acá para que el <img> del navegador la resuelva bien.
	return projects.map(p => ({
		...p,
		previewUrl: `${API_BASE}${p.previewUrl}`,
	}));
}
