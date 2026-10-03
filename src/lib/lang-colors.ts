// Colores de lenguaje (los mismos que usa el backend en las tarjetas SVG).
const COLORS: Record<string, string> = {
	Go: '#00ADD8',
	Python: '#3572A5',
	TypeScript: '#3178C6',
	JavaScript: '#F1E05A',
	Java: '#B07219',
	'C++': '#F34B7D',
	C: '#555555',
	HTML: '#E34C26',
	CSS: '#563D7C',
	Dart: '#00B4AB',
	Kotlin: '#A97BFF',
	Swift: '#F05138',
	Dockerfile: '#384D54',
	Makefile: '#427819',
	Shell: '#89E051',
	SCSS: '#C6538C',
	'Jupyter Notebook': '#DA5B0B',
};

export const langColor = (name: string) => COLORS[name] ?? '#94A3B8';

export function topLanguages(langs: Record<string, number> | undefined, n = 4) {
	if (!langs) return [];
	const entries = Object.entries(langs)
		.filter(([, v]) => v > 0)
		.sort((a, b) => b[1] - a[1]);
	const total = entries.reduce((a, [, v]) => a + v, 0) || 1;
	return entries.slice(0, n).map(([name, v]) => ({
		name,
		pct: (v / total) * 100,
		color: langColor(name),
	}));
}

export function timeAgo(iso?: string): string | null {
	if (!iso) return null;
	const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
	if (Number.isNaN(days)) return null;
	if (days < 1) return 'hoy';
	if (days < 7) return `hace ${days} d`;
	if (days < 30) return `hace ${Math.floor(days / 7)} sem`;
	if (days < 365) return `hace ${Math.floor(days / 30)} meses`;
	return `hace ${Math.floor(days / 365)} a`;
}
