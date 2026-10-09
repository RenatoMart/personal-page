// Generador de la ciudad isométrica del hero. Solo produce arrays tipados
// (sin three.js): la escena los envuelve en BufferGeometry.
//
// Cada edificio es una lista de "partes" (prismas con polígono convexo en
// planta) más "agujas" (segmentos verticales). De cada parte se emiten solo
// las aristas estructurales que la cámara isométrica ve (silueta, esquina
// frontal, anillo superior, base visible), las caras visibles y, tenues,
// las líneas de piso y los parteluces. Las caras traseras no se emiten:
// no se ven y las caras opacas taparían sus aristas.

export const P = 2.2; // paso de la retícula
export const SQ = Math.SQRT1_2;
export const S_MAX = 24;
export const S_SPAN = 48;
export const CYCLE = 20;
const FH = 0.42; // altura de un piso

type V2 = [number, number];

// Roles de arista (el shader decide brillo y fase de construcción por rol).
const KEY = 0;
const SIL = 1;
const BASE = 2;
const FLOOR = 3;
const FLOOR5 = 4;
const MULL = 5;
const TOP = 6;

interface Part {
	poly: V2[];
	top?: V2[]; // tronco de pirámide: polígono superior distinto
	y0: number;
	y1: number;
	floors?: boolean;
	mull?: boolean;
	// remate de neón: 1 = cian, 2 = cálido (aristas superiores)
	neon?: number;
}
interface Spike {
	x: number;
	z: number;
	y0: number;
	y1: number;
	cross?: boolean;
	beacon?: boolean;
}
interface Bld {
	parts: Part[];
	spikes: Spike[];
}

interface Ctx {
	H: number;
	start: number;
	dur: number;
	undo: number;
	durU: number;
	seed: number;
	floorStep: number;
	mull: boolean;
	// 1 = héroe (aristas plenas, ventanas, remates); 0 = ciudad de fondo
	tier: number;
	rand: () => number;
}

class Buf {
	ePos: number[] = [];
	eA0: number[] = [];
	eA1: number[] = [];
	fPos: number[] = [];
	fA0: number[] = [];
	fA1: number[] = [];
}

export interface CityData {
	ePos: Float32Array;
	eA0: Float32Array;
	eA1: Float32Array;
	fPos: Float32Array;
	fA0: Float32Array;
	fA1: Float32Array;
	gPos: Float32Array;
	gS: Float32Array;
	gK: Float32Array;
	lanes: { c: number; avenue: boolean }[];
}

export function rng(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export const depthOf = (x: number, z: number) => (x + z) * SQ;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const rect = (cx: number, cz: number, w: number, d: number): V2[] => [
	[cx - w / 2, cz - d / 2],
	[cx + w / 2, cz - d / 2],
	[cx + w / 2, cz + d / 2],
	[cx - w / 2, cz + d / 2],
];
// Cuadrado con la esquina frontal (+x,+z) recortada en diagonal.
const chamfer = (cx: number, cz: number, s: number, c: number): V2[] => {
	const h = s / 2;
	return [
		[cx - h, cz - h],
		[cx + h, cz - h],
		[cx + h, cz + h - c],
		[cx + h - c, cz + h],
		[cx - h, cz + h],
	];
};
const poly8 = (cx: number, cz: number, r: number): V2[] =>
	Array.from({ length: 8 }, (_, i) => {
		const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
		return [cx + Math.cos(a) * r, cz + Math.sin(a) * r] as V2;
	});

// ---------------------------------------------------------------- emisión

function vtx(
	m: Buf,
	kind: 'e' | 'f',
	c: Ctx,
	x: number,
	y: number,
	z: number,
	roleOrFace: number,
	seed = c.seed,
	w = 0,
) {
	const pos = kind === 'e' ? m.ePos : m.fPos;
	const a0 = kind === 'e' ? m.eA0 : m.fA0;
	const a1 = kind === 'e' ? m.eA1 : m.fA1;
	pos.push(x, y, z);
	a0.push(y / c.H, c.start, c.dur, c.undo);
	a1.push(c.durU, roleOrFace + c.tier * 10, seed, w);
}
function seg(
	m: Buf,
	c: Ctx,
	a: [number, number, number],
	b: [number, number, number],
	role: number,
	seed = c.seed,
	w = 0,
) {
	vtx(m, 'e', c, a[0], a[1], a[2], role, seed, w);
	vtx(m, 'e', c, b[0], b[1], b[2], role, seed, w);
}

function emitPart(m: Buf, c: Ctx, p: Part) {
	const poly = p.poly;
	const top = p.top ?? p.poly;
	const n = poly.length;
	const cx = poly.reduce((s, v) => s + v[0], 0) / n;
	const cz = poly.reduce((s, v) => s + v[1], 0) / n;
	const normal = (i: number): V2 => {
		const [ax, az] = poly[i];
		const [bx, bz] = poly[(i + 1) % n];
		let nx = bz - az;
		let nz = -(bx - ax);
		const l = Math.hypot(nx, nz) || 1;
		nx /= l;
		nz /= l;
		if (nx * ((ax + bx) / 2 - cx) + nz * ((az + bz) / 2 - cz) < 0) {
			nx = -nx;
			nz = -nz;
		}
		return [nx, nz];
	};
	const norms = poly.map((_, i) => normal(i));
	const vis = norms.map(([nx, nz]) => (nx + nz) * SQ > 0.05);
	const h = p.y1 - p.y0;

	// caras visibles
	norms.forEach(([nx, nz], i) => {
		if (!vis[i]) return;
		const j = (i + 1) % n;
		const face = Math.abs(nx) > Math.abs(nz) + 0.2 ? 0 : 1;
		const q: [V2, number, number][] = [
			[poly[i], p.y0, 0],
			[poly[j], p.y0, 1],
			[top[j], p.y1, 1],
			[top[i], p.y1, 0],
		];
		for (const k of [0, 1, 2, 0, 2, 3]) {
			vtx(m, 'f', c, q[k][0][0], q[k][1], q[k][0][1], face, c.seed, q[k][2]);
		}
	});
	for (let i = 1; i < n - 1; i++) {
		for (const k of [0, i, i + 1])
			vtx(m, 'f', c, top[k][0], p.y1, top[k][1], 2);
	}

	// anillo superior completo
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n;
		const tp: [number, number, number] = [top[i][0], p.y1, top[i][1]];
		const tq: [number, number, number] = [top[j][0], p.y1, top[j][1]];
		seg(m, c, tp, tq, TOP, c.seed, p.neon ?? 0);
	}
	// base solo en los lados visibles
	for (let i = 0; i < n; i++) {
		if (!vis[i]) continue;
		const j = (i + 1) % n;
		seg(
			m,
			c,
			[poly[i][0], p.y0, poly[i][1]],
			[poly[j][0], p.y0, poly[j][1]],
			BASE,
		);
	}
	// verticales: silueta (una cara visible y otra no) y UNA esquina frontal
	let keyIdx = -1;
	let keyScore = -Infinity;
	for (let i = 0; i < n; i++) {
		const v1 = vis[(i - 1 + n) % n];
		const v2 = vis[i];
		if (v1 !== v2) {
			seg(
				m,
				c,
				[poly[i][0], p.y0, poly[i][1]],
				[top[i][0], p.y1, top[i][1]],
				SIL,
			);
		} else if (v1 && v2 && poly[i][0] + poly[i][1] > keyScore) {
			keyScore = poly[i][0] + poly[i][1];
			keyIdx = i;
		}
	}
	if (keyIdx >= 0) {
		const i = keyIdx;
		seg(
			m,
			c,
			[poly[i][0], p.y0, poly[i][1]],
			[top[i][0], p.y1, top[i][1]],
			KEY,
		);
	}

	if (p.top) return; // los troncos no llevan pisos ni parteluces

	// líneas de piso (tenues), desplazadas un pelo sobre la cara para no
	// pelear en profundidad con ella
	if (p.floors && h >= 1) {
		norms.forEach(([nx, nz], i) => {
			if (!vis[i]) return;
			const j = (i + 1) % n;
			const [ax, az] = poly[i];
			const [bx, bz] = poly[j];
			const len = Math.hypot(bx - ax, bz - az);
			if (len < 0.3) return;
			const dx = (bx - ax) / len;
			const dz = (bz - az) / len;
			let k = 0;
			for (let y = p.y0 + 0.6; y < p.y1 - 0.15; y += c.floorStep, k++) {
				const role = k % 5 === 4 ? FLOOR5 : FLOOR;
				seg(
					m,
					c,
					[ax + dx * 0.03 + nx * 0.008, y, az + dz * 0.03 + nz * 0.008],
					[bx - dx * 0.03 + nx * 0.008, y, bz - dz * 0.03 + nz * 0.008],
					role,
				);
			}
		});
	}
	// parteluces verticales, solo en algunos cuerpos
	if (p.mull && c.mull && h >= 1.5) {
		let used = 0;
		norms.forEach(([nx, nz], i) => {
			if (!vis[i] || used >= 1) return;
			const j = (i + 1) % n;
			const [ax, az] = poly[i];
			const [bx, bz] = poly[j];
			const len = Math.hypot(bx - ax, bz - az);
			if (len < 0.9) return;
			used++;
			const dx = (bx - ax) / len;
			const dz = (bz - az) / len;
			for (let t = 0.2; t < len - 0.1; t += 0.4) {
				const x = ax + dx * t + nx * 0.008;
				const z = az + dz * t + nz * 0.008;
				seg(m, c, [x, p.y0 + 0.6, z], [x, p.y1 - 0.05, z], MULL);
			}
		});
	}
}

function emitSpike(m: Buf, c: Ctx, s: Spike) {
	const bodyTop = s.beacon ? s.y1 - 0.3 : s.y1;
	seg(m, c, [s.x, s.y0, s.z], [s.x, bodyTop, s.z], KEY);
	if (s.beacon) seg(m, c, [s.x, bodyTop, s.z], [s.x, s.y1, s.z], KEY, 2);
	if (s.cross) {
		const y = s.y0 + (s.y1 - s.y0) * 0.7;
		seg(m, c, [s.x - 0.15, y, s.z], [s.x + 0.15, y, s.z], KEY);
	}
}

// ------------------------------------------------------------ arquetipos

type R = () => number;
const roofBox = (parts: Part[], cx: number, cz: number, y: number, r: R) => {
	const w = 0.5 * (0.8 + r() * 0.4);
	parts.push({
		poly: rect(cx + (r() - 0.5) * 0.4, cz + (r() - 0.5) * 0.4, w, 0.4),
		y0: y,
		y1: y + 0.35,
	});
};
const parapet = (
	parts: Part[],
	cx: number,
	cz: number,
	w: number,
	d: number,
	y: number,
) => parts.push({ poly: rect(cx, cz, w - 0.12, d - 0.12), y0: y, y1: y + 0.1 });

// Cornisa: placa fina que sobresale un poco justo bajo la azotea.
const cornice = (
	parts: Part[],
	cx: number,
	cz: number,
	w: number,
	d: number,
	y1: number,
) =>
	parts.push({
		poly: rect(cx, cz, w + 0.1, d + 0.1),
		y0: y1 - 0.16,
		y1: y1 - 0.06,
	});

function archA(cx: number, cz: number, r: R, hs: number): Bld {
	const parts: Part[] = [];
	const H = (9 + r() * 5) * hs;
	let s = 1.8 + r() * 0.2;
	let y = 0;
	for (const f of [0.45, 0.25, 0.18, 0.12]) {
		const sw = s * (0.92 + r() * 0.08);
		const sd = s * (0.92 + r() * 0.08);
		parts.push({
			poly: rect(cx, cz, sw, sd),
			y0: y,
			y1: y + H * f,
			floors: true,
			mull: true,
		});
		cornice(parts, cx, cz, sw, sd, y + H * f);
		y += H * f;
		s -= 2 * (0.18 + r() * 0.07);
	}
	roofBox(parts, cx, cz, y, r);
	return { parts, spikes: [] };
}
function archB(cx: number, cz: number, r: R, hs: number, hero = false): Bld {
	const neon = hero ? 2 : 0;
	const w = 0.9 + r() * 0.2;
	const H = (10 + r() * 4) * hs;
	const parts: Part[] = [
		{ poly: rect(cx, cz, w, w), y0: 0, y1: H, floors: true, mull: true },
		{ poly: rect(cx, cz, w * 0.75, w * 0.75), y0: H, y1: H + 0.6, neon },
		{ poly: rect(cx, cz, w * 0.5, w * 0.5), y0: H + 0.6, y1: H + 1.0, neon },
	];
	const len = 2 + r();
	return {
		parts,
		spikes: [
			{
				x: cx,
				z: cz,
				y0: H + 1.0,
				y1: H + 1.0 + len,
				cross: true,
				beacon: hero,
			},
		],
	};
}
function archC(
	cx: number,
	cz: number,
	lotW: number,
	lotD: number,
	r: R,
	hs: number,
	podiumOnly: boolean,
): Bld {
	const pw = Math.min(3.8, lotW - 0.4);
	const pd = Math.min(lotD - 0.3, lotD > 3 ? 3.8 : 1.9);
	const ph = 1.6 + r() * 0.6;
	const parts: Part[] = [
		{ poly: rect(cx, cz, pw, pd), y0: 0, y1: ph, floors: true },
	];
	parapet(parts, cx, cz, pw, pd, ph);
	if (podiumOnly) {
		roofBox(parts, cx, cz, ph + 0.1, r);
		return { parts, spikes: [] };
	}
	const tw = Math.min(1.3 + r() * 0.3, pd - 0.3);
	const tx = cx - (pw / 2 - tw / 2 - 0.2);
	const tz = cz - (pd / 2 - tw / 2 - 0.2);
	const H = (8 + r() * 4) * hs;
	parts.push({
		poly: rect(tx, tz, tw, tw),
		y0: ph,
		y1: H,
		floors: true,
		mull: true,
	});
	cornice(parts, tx, tz, tw, tw, H);
	roofBox(parts, tx, tz, H, r);
	return { parts, spikes: [] };
}
function archD(
	cx: number,
	cz: number,
	lotW: number,
	lotD: number,
	r: R,
	hm = 1,
): Bld {
	const w = Math.min(lotW - 0.2, 1.4 + r() * 0.6);
	const d = Math.min(lotD - 0.2, 1.2 + r() * 0.8);
	const H = (1.2 + r() * 1.8) * hm;
	const parts: Part[] = [
		{ poly: rect(cx, cz, w, d), y0: 0, y1: H, floors: true },
	];
	parapet(parts, cx, cz, w, d, H);
	roofBox(parts, cx, cz, H + 0.1, r);
	if (r() < 0.3) roofBox(parts, cx, cz, H + 0.1, r);
	return { parts, spikes: [] };
}
function archE(cx: number, cz: number, r: R, hs: number, low: boolean): Bld {
	const parts: Part[] = [];
	if (r() < 0.5) {
		const s = 1.6 + r() * 0.3;
		const H = low ? 1.5 + r() * 1.5 : (5 + r() * 4) * hs;
		const h1 = H * 0.7;
		parts.push({
			poly: chamfer(cx, cz, s, s * 0.35),
			y0: 0,
			y1: h1,
			floors: true,
			mull: true,
		});
		parts.push({
			poly: chamfer(cx, cz, s - 0.3, (s - 0.3) * 0.35),
			y0: h1,
			y1: H,
			floors: true,
			mull: true,
		});
		roofBox(parts, cx, cz, H, r);
	} else {
		const w = 1.7 + r() * 0.2;
		const d = 1.7 + r() * 0.2;
		const H = low ? 1.5 + r() * 1.5 : (4 + r() * 4) * hs;
		parts.push({
			poly: rect(cx, cz - d / 4, w, d / 2),
			y0: 0,
			y1: H,
			floors: true,
		});
		parts.push({
			poly: rect(cx - w / 4, cz, w / 2, d),
			y0: 0,
			y1: H * 0.7,
			floors: true,
		});
		parapet(parts, cx, cz - d / 4, w, d / 2, H);
	}
	return { parts, spikes: [] };
}
function archF(cx: number, cz: number, r: R, hs: number): Bld {
	const w = 1.4 + r() * 0.4;
	const H = (3 + r() * 3) * hs;
	const parts: Part[] = [
		{ poly: rect(cx, cz, w, w), y0: 0, y1: H, floors: true },
	];
	parapet(parts, cx, cz, w, w, H);
	const tr = 0.3 + r() * 0.1;
	const y = H + 0.1;
	// cuatro patas, cilindro y tapa cónica
	const spikes: Spike[] = [];
	for (const [ox, oz] of [
		[-1, -1],
		[1, -1],
		[1, 1],
		[-1, 1],
	]) {
		spikes.push({
			x: cx + ox * tr * 0.7,
			z: cz + oz * tr * 0.7,
			y0: y,
			y1: y + 0.4,
		});
	}
	parts.push({ poly: poly8(cx, cz, tr), y0: y + 0.4, y1: y + 0.9 });
	parts.push({
		poly: poly8(cx, cz, tr),
		top: poly8(cx, cz, 0.02),
		y0: y + 0.9,
		y1: y + 1.05,
	});
	return { parts, spikes };
}
function archG(cx: number, cz: number, r: R, hs: number, hero = false): Bld {
	const neon = hero ? 1 : 0;
	const w = 1.4 + r() * 0.4;
	const H = (7 + r() * 4) * hs;
	const parts: Part[] = [
		{ poly: rect(cx, cz, w, w), y0: 0, y1: H, floors: true, mull: true },
	];
	cornice(parts, cx, cz, w, w, H);
	let y = H;
	let s = w;
	for (let k = 0; k < 3; k++) {
		s -= 0.3;
		parts.push({ poly: rect(cx, cz, s, s), y0: y, y1: y + 0.3, neon });
		y += 0.3;
	}
	parts.push({
		poly: rect(cx, cz, s, s),
		top: rect(cx, cz, w * 0.35, w * 0.35),
		y0: y,
		y1: y + 1.2,
	});
	y += 1.2;
	return { parts, spikes: [{ x: cx, z: cz, y0: y, y1: y + 0.6 }] };
}
function archH(cx: number, cz: number, r: R, hs: number, hero = false): Bld {
	const H = (8 + r() * 3) * hs;
	const parts: Part[] = [
		{ poly: poly8(cx, cz, 0.8), y0: 0, y1: H, floors: true },
		{ poly: poly8(cx, cz, 0.65), y0: H, y1: H + 0.3 },
		{ poly: poly8(cx, cz, 0.35), y0: H + 0.3, y1: H + 0.55 },
	];
	return {
		parts,
		spikes: [{ x: cx, z: cz, y0: H + 0.55, y1: H + 1.75, beacon: hero }],
	};
}

// ------------------------------------------------------------- composición

// La ciudad no es una alfombra: es un horizonte en "U" que sube desde abajo
// y por los costados, y deja el centro (detrás del texto) casi vacío y el
// cielo libre. Todo se mide en coordenadas de pantalla isométrica:
// sx = derecha, sy = profundidad (mayor = más cerca = más abajo).
export interface Layout {
	half: number; // semirretícula en celdas
	s0: number; // sy mínimo en el centro (solo una franja baja)
	s1: number; // cuánto sube el horizonte hacia los costados
	a: number; // |sx| donde empieza a subir
	b: number; // |sx| donde ya está arriba del todo
	syMax: number; // más cerca que esto no se ve: no se genera
	zA: number; // rango |sx| de la escala de alturas (centro bajo,
	zB: number; // costados altos)
}
export const LAYOUT_WIDE: Layout = {
	half: 9,
	s0: 9.5,
	s1: 18.5,
	a: 4,
	b: 13,
	syMax: 17,
	zA: 5,
	zB: 15,
};
export const LAYOUT_TALL: Layout = {
	half: 7,
	s0: 5.6,
	s1: 13.8,
	a: 3,
	b: 7.5,
	syMax: 24,
	zA: 2.5,
	zB: 9,
};
const smooth = (a: number, b: number, x: number) => {
	const t = clamp01((x - a) / (b - a));
	return t * t * (3 - 2 * t);
};
export const horizonSy = (L: Layout, sx: number) =>
	L.s0 - L.s1 * smooth(L.a, L.b, Math.abs(sx));

interface Hero {
	sx: number;
	sy: number;
	t: 'A' | 'B' | 'G' | 'H';
	hs: number;
}
// Pocos rascacielos, bien dibujados, que enmarcan el texto sin tocarlo.
const HEROES_WIDE: Hero[] = [
	{ sx: -9.8, sy: 3.2, t: 'A', hs: 1.15 },
	{ sx: -17, sy: -0.5, t: 'B', hs: 0.95 },
	{ sx: 10, sy: 3.8, t: 'G', hs: 1.1 },
	{ sx: 16.6, sy: 0.5, t: 'H', hs: 1.05 },
];
const HEROES_TALL: Hero[] = [
	{ sx: -8.9, sy: 4.5, t: 'A', hs: 1.2 },
	{ sx: 8.7, sy: 7, t: 'G', hs: 1.25 },
];

export function generateCity(
	portrait: boolean,
	platforms: { x: number; z: number }[],
): CityData {
	const rand = rng(portrait ? 17 : 23);
	const L = portrait ? LAYOUT_TALL : LAYOUT_WIDE;
	const HALF = L.half;
	const m = new Buf();
	const isAvenue = (i: number) => i % 4 === 0;
	const used = new Set<string>();
	const key = (ix: number, iz: number) => `${ix},${iz}`;
	const freeCell = (ix: number, iz: number) =>
		Math.abs(ix) <= HALF &&
		Math.abs(iz) <= HALF &&
		!isAvenue(ix) &&
		!isAvenue(iz) &&
		!used.has(key(ix, iz)) &&
		!platforms.some(p => Math.hypot(ix * P - p.x, iz * P - p.z) < 3.4);
	// celda libre y dentro de la franja visible de la ciudad
	const inBand = (ix: number, iz: number) => {
		if (!freeCell(ix, iz)) return false;
		const sx = (ix - iz) * P * SQ;
		const sy = depthOf(ix * P, iz * P);
		return sy >= horizonSy(L, sx) && sy <= L.syMax;
	};

	const toXZ = (sx: number, sy: number): V2 => [(sx + sy) * SQ, (sy - sx) * SQ];
	const plazas: { x: number; z: number }[] = [];

	const place = (
		ix: number,
		iz: number,
		spanX: number,
		spanZ: number,
		forced?: Hero,
	) => {
		const cx = (ix + (spanX - 1) / 2) * P;
		const cz = (iz + (spanZ - 1) / 2) * P;
		const lotW = spanX * P - 0.4;
		const lotD = spanZ * P - 0.4;
		const sx = (cx - cz) * SQ;
		// 0 en el centro, 1 en los costados
		const z = smooth(L.zA, L.zB, Math.abs(sx));
		const big = spanX * spanZ > 1;
		let bld: Bld;

		if (forced) {
			const hs = forced.hs;
			bld =
				forced.t === 'A'
					? archA(cx, cz, rand, hs)
					: forced.t === 'B'
						? archB(cx, cz, rand, hs, true)
						: forced.t === 'G'
							? archG(cx, cz, rand, hs, true)
							: archH(cx, cz, rand, hs, true);
		} else if (z < 0.3) {
			// centro: solo volúmenes bajos, casi planos
			bld =
				rand() < 0.85
					? archD(cx, cz, lotW, lotD, rand, 0.6)
					: archF(cx, cz, rand, 0.35);
		} else if (z < 0.75) {
			const hs = 0.45 + 0.3 * z;
			const q = rand();
			if (q < 0.35) bld = archD(cx, cz, lotW, lotD, rand);
			else if (q < 0.6) bld = archE(cx, cz, rand, hs, z < 0.5);
			else if (q < 0.75 && big) bld = archC(cx, cz, lotW, lotD, rand, hs, true);
			else if (q < 0.9) bld = archF(cx, cz, rand, hs);
			else bld = archD(cx, cz, lotW, lotD, rand);
		} else {
			// costados: el telón de torres, más bajo que los héroes
			const hs = 0.45 + 0.35 * z;
			const q = rand();
			if (q < 0.22 && big) bld = archC(cx, cz, lotW, lotD, rand, hs, false);
			else if (q < 0.27) bld = archA(cx, cz, rand, hs);
			else if (q < 0.37) bld = archG(cx, cz, rand, hs);
			else if (q < 0.42) bld = archB(cx, cz, rand, hs);
			else if (q < 0.6) bld = archE(cx, cz, rand, hs, false);
			else if (q < 0.75) bld = archF(cx, cz, rand, hs);
			else bld = archD(cx, cz, lotW, lotD, rand);
		}

		let H = 0;
		for (const p of bld.parts) H = Math.max(H, p.y1);
		for (const s of bld.spikes) H = Math.max(H, s.y1);
		const u = clamp01((S_MAX - depthOf(cx, cz)) / S_SPAN);
		const dur = 1.2 + 0.07 * H;
		// pisos finos solo en los héroes; el fondo, cada tres pisos o nada
		const bgStep = portrait ? 99 : FH * 3;
		const c: Ctx = {
			H,
			start: (1 - u) * 3.8 + rand() * 0.3,
			dur,
			undo: 13.5 + u * 3.0 + rand() * 0.2,
			durU: dur * 0.7,
			seed: rand(),
			floorStep: forced ? (portrait ? FH * 2 : FH) : bgStep,
			mull: !!forced,
			tier: forced ? 1 : 0,
			rand,
		};
		for (const p of bld.parts) emitPart(m, c, p);
		for (const s of bld.spikes) emitSpike(m, c, s);
	};

	// héroes: rascacielos que enmarcan el texto a los costados
	for (const h of portrait ? HEROES_TALL : HEROES_WIDE) {
		const [x, z] = toXZ(h.sx, h.sy);
		let ix = Math.round(x / P);
		let iz = Math.round(z / P);
		if (isAvenue(ix)) ix += 1;
		if (isAvenue(iz)) iz += 1;
		if (!freeCell(ix, iz)) continue;
		used.add(key(ix, iz));
		place(ix, iz, 1, 1, h);
	}

	// el resto: lotes dispersos de 1×1, 2×1 y 2×2, con mucho hueco
	const cells: V2[] = [];
	for (let ix = -HALF; ix <= HALF; ix++)
		for (let iz = -HALF; iz <= HALF; iz++) cells.push([ix, iz]);
	for (let i = cells.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[cells[i], cells[j]] = [cells[j], cells[i]];
	}
	for (const [ix, iz] of cells) {
		if (!inBand(ix, iz)) continue;
		const sx = (ix - iz) * P * SQ;
		const z = smooth(L.zA, L.zB, Math.abs(sx));
		// lotes vacíos: 45 % en el centro, 32 % en los costados
		if (rand() < 0.45 - 0.13 * z) continue;
		if (rand() < 0.12) {
			used.add(key(ix, iz));
			plazas.push({ x: ix * P, z: iz * P });
			continue;
		}
		let spanX = 1;
		let spanZ = 1;
		const q = rand();
		if (q > 0.6) {
			const horizontal = rand() < 0.5;
			if (
				q > 0.88 &&
				inBand(ix + 1, iz) &&
				inBand(ix, iz + 1) &&
				inBand(ix + 1, iz + 1)
			) {
				spanX = 2;
				spanZ = 2;
			} else if (horizontal && inBand(ix + 1, iz)) spanX = 2;
			else if (!horizontal && inBand(ix, iz + 1)) spanZ = 2;
		}
		for (let a = 0; a < spanX; a++)
			for (let b = 0; b < spanZ; b++) used.add(key(ix + a, iz + b));
		place(ix, iz, spanX, spanZ);
	}

	// suelo: avenidas (cada 4 celdas), calles menores y plazas
	const G: number[] = [];
	const GS: number[] = [];
	const GK: number[] = [];
	const R = 22;
	const lanes: CityData['lanes'] = [];
	const line = (ax: number, az: number, bx: number, bz: number, k: number) => {
		G.push(ax, 0, az, bx, 0, bz);
		GS.push(depthOf(ax, az), depthOf(bx, bz));
		GK.push(k, k);
	};
	for (let i = -HALF - 1; i <= HALF; i++) {
		const c = (i + 0.5) * P;
		lanes.push({ c, avenue: false });
		line(-R, c, R, c, 0.05);
		line(c, -R, c, R, 0.05);
	}
	for (let i = -HALF; i <= HALF; i++) {
		if (!isAvenue(i)) continue;
		const c = i * P;
		lanes.push({ c, avenue: true });
		line(-R, c, R, c, 0.13);
		line(c, -R, c, R, 0.13);
	}
	for (const pz of plazas) {
		const h = 0.8;
		line(pz.x - h, pz.z - h, pz.x + h, pz.z - h, 0.07);
		line(pz.x + h, pz.z - h, pz.x + h, pz.z + h, 0.07);
		line(pz.x + h, pz.z + h, pz.x - h, pz.z + h, 0.07);
		line(pz.x - h, pz.z + h, pz.x - h, pz.z - h, 0.07);
	}

	const f = (a: number[]) => new Float32Array(a);
	return {
		ePos: f(m.ePos),
		eA0: f(m.eA0),
		eA1: f(m.eA1),
		fPos: f(m.fPos),
		fA0: f(m.fA0),
		fA1: f(m.fA1),
		gPos: f(G),
		gS: f(GS),
		gK: f(GK),
		lanes,
	};
}
