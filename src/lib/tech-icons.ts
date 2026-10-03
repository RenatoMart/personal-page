import type { IconType } from 'react-icons';
import {
	SiCplusplus,
	SiDart,
	SiDocker,
	SiFramer,
	SiGithubactions,
	SiGo,
	SiGooglecloud,
	SiGooglesheets,
	SiJavascript,
	SiJson,
	SiKotlin,
	SiNestjs,
	SiNextdotjs,
	SiNodedotjs,
	SiNumpy,
	SiOpencv,
	SiOpenjdk,
	SiPandas,
	SiPostgresql,
	SiPrisma,
	SiPython,
	SiReact,
	SiRedis,
	SiTailwindcss,
	SiTypescript,
	SiVercel,
	SiVite,
} from 'react-icons/si';

export interface TechIcon {
	key: string;
	Icon: IconType;
	color: string;
}

// Clave en minúsculas, sin versión: "React 18" y "React Native" caen en react.
const ICONS: Record<string, [IconType, string]> = {
	python: [SiPython, '#3572A5'],
	typescript: [SiTypescript, '#3178C6'],
	javascript: [SiJavascript, '#D4B800'],
	go: [SiGo, '#00ADD8'],
	'c++': [SiCplusplus, '#F34B7D'],
	java: [SiOpenjdk, '#B07219'],
	dart: [SiDart, '#00B4AB'],
	kotlin: [SiKotlin, '#A97BFF'],
	react: [SiReact, '#0EA5C9'],
	'react native': [SiReact, '#0EA5C9'],
	'react 18': [SiReact, '#0EA5C9'],
	'next.js': [SiNextdotjs, '#1C1B2E'],
	node: [SiNodedotjs, '#3C873A'],
	nestjs: [SiNestjs, '#E0234E'],
	docker: [SiDocker, '#2496ED'],
	redis: [SiRedis, '#DC382D'],
	postgresql: [SiPostgresql, '#336791'],
	prisma: [SiPrisma, '#2D3748'],
	pandas: [SiPandas, '#150458'],
	numpy: [SiNumpy, '#4D77CF'],
	opencv: [SiOpencv, '#5C3EE8'],
	tailwindcss: [SiTailwindcss, '#06B6D4'],
	tailwind: [SiTailwindcss, '#06B6D4'],
	vite: [SiVite, '#9D6CFF'],
	vercel: [SiVercel, '#1C1B2E'],
	'framer motion': [SiFramer, '#1C1B2E'],
	'google sheets api': [SiGooglesheets, '#0F9D58'],
	'github actions': [SiGithubactions, '#2088FF'],
	'cloud run': [SiGooglecloud, '#4285F4'],
	json: [SiJson, '#64748B'],
};

// Tecnologías de un proyecto con logo real: primero lenguajes del repo
// (por porcentaje), luego tags; sin repetir logo.
export function techIconsFor(
	languages: Record<string, number> | undefined,
	tags: string[],
	max = 5,
): TechIcon[] {
	const names = [
		...Object.entries(languages ?? {})
			.sort((a, b) => b[1] - a[1])
			.map(([n]) => n),
		...tags,
	];
	const seen = new Set<IconType>();
	const out: TechIcon[] = [];
	for (const n of names) {
		const hit = ICONS[n.toLowerCase()];
		if (!hit || seen.has(hit[0])) continue;
		seen.add(hit[0]);
		out.push({ key: n, Icon: hit[0], color: hit[1] });
		if (out.length === max) break;
	}
	return out;
}
