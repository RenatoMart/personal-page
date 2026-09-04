# Conectar personal-page a repo-preview-service

Instrucciones para configurar tu portafolio en Next.js (`personal-page`) y
que consuma la API de este servicio. Cópialas dentro de ese repo, no van
en este.

## 1. Variable de entorno

En `personal-page`, crear `.env.local` (no se commitea, ya debería estar
en su `.gitignore`):

```bash
NEXT_PUBLIC_PREVIEW_API=http://localhost:8080
```

Cuando despliegues `repo-preview-service` (Cloud Run u otro), cambias
esto por la URL pública en las variables de entorno de Vercel — nada más
cambia.

## 2. Cliente de la API

Crear `src/lib/preview-api.ts`:

```ts
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
  previewSource?: "screenshot" | "social" | "readme" | "card";
}

const API_BASE = process.env.NEXT_PUBLIC_PREVIEW_API ?? "http://localhost:8080";

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
  return projects.map((p) => ({ ...p, previewUrl: `${API_BASE}${p.previewUrl}` }));
}
```

`previewUrl` es la única URL que necesitas para pintar la imagen — no
importa si detrás es una captura real, una tarjeta generada, etc.
`previewSource` te sirve si quieres, por ejemplo, mostrar un pequeño
badge de "captura en vivo" solo cuando sea `"screenshot"`.

## 3. Reemplazar `src/data/projects.ts`

Ese archivo deja de ser la fuente de verdad — ahora vive en
`configs/projects.yaml` dentro de `repo-preview-service` (mismos datos:
título, categoría, tags, descripción, accent). Donde antes importabas
`projects` de `src/data/projects.ts`, ahora llamas a `getProjects()`.

Como tu proyecto usa App Router, hazlo en un Server Component — no hace
falta `useEffect` ni estado de carga:

```tsx
// src/app/proyectos/page.tsx
import { getProjects } from "@/lib/preview-api";
import ProjectsSection from "@/components/ProjectsSection";

export default async function ProyectosPage() {
  const projects = await getProjects();
  return <ProjectsSection projects={projects} />;
}
```

Si `ProjectsPreview.tsx` (la vista resumida en la home) también recorre
`projects`, misma idea ahí.

Ajusta las props de `ProjectsSection` / `ProjectsPreview` al nuevo tipo
`PreviewProject` (ya no tienen `id`, `link` pasó a llamarse `liveUrl`,
`github` pasó a `repoUrl`).

## 4. Pintar la imagen: `<img>`, no `next/image`

Importante: la cascada del servicio puede devolver **SVG o PNG** según
el proyecto (la tarjeta generada es SVG; una captura real es PNG). El
componente `next/image` bloquea SVGs por defecto (por seguridad) y exige
declarar cada dominio remoto — con contenido mixto y variable como este,
un `<img>` normal es más simple y evita esa fricción:

```tsx
<img
  src={project.previewUrl}
  alt={project.title}
  loading="lazy"
  className="w-full aspect-[1200/630] object-cover rounded-lg bg-neutral-900"
/>
```

El `aspect-[1200/630]` mantiene la proporción de la tarjeta generada
(1200×630) sin importar si la imagen real que llega es de otro tamaño.

## 5. Probar todo junto

```bash
# terminal 1
cd repo-preview-service
make run

# terminal 2
cd personal-page
npm run dev
```

Abrir `http://localhost:3000/proyectos`. Los 5 proyectos sin web
desplegada deberían mostrar la tarjeta generada (título, tags, barra de
lenguajes); `ing-agroindustrial` y `asistencia-esperanza-baja` también,
hasta que corras `cmd/shooter` y subas la primera captura real.

Si no carga nada, revisar la consola del navegador: si es un error de
CORS, confirma que `CORS_ALLOWED_ORIGINS` en el `.env` de
`repo-preview-service` incluye `http://localhost:3000` (ya viene así por
defecto).

## 6. Producción

Cuando despliegues `repo-preview-service`:

1. En Vercel (proyecto `personal-page`) → Settings → Environment
   Variables → `NEXT_PUBLIC_PREVIEW_API` = la URL pública del servicio.
2. En el servicio Go, `CORS_ALLOWED_ORIGINS` ya incluye por defecto
   `https://renato-martinez-rose.vercel.app` — no hace falta tocarlo
   salvo que cambies de dominio.
