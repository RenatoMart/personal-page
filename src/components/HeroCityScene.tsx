'use client';
import {
	CYCLE,
	LAYOUT_TALL,
	LAYOUT_WIDE,
	SQ,
	generateCity,
	rng,
} from '@/lib/city/generate';
import {
	BEAM_FS,
	BEAM_VS,
	CORE_FS,
	CORE_VS,
	EDGE_FS,
	EDGE_VS,
	FACE_FS,
	FACE_VS,
	GRID_FS,
	GRID_VS,
	PACKET_FS,
	PACKET_VS,
} from '@/lib/city/shaders';
import { useEffect, useRef } from 'react';
import {
	AdditiveBlending,
	BoxGeometry,
	BufferAttribute,
	BufferGeometry,
	CylinderGeometry,
	DoubleSide,
	EdgesGeometry,
	Group,
	LineBasicMaterial,
	LineSegments,
	Mesh,
	MeshBasicMaterial,
	NormalBlending,
	OrthographicCamera,
	Points,
	Scene,
	ShaderMaterial,
	Vector2,
	Vector4,
	WebGLRenderer,
} from 'three';

// Ciudad isométrica de "plano de arquitecto" que se construye y se deshace
// en bucle mientras el hero está en pantalla.
//
// Ciclo (CYCLE s), todo en función de un único reloj `uCycle`:
//   0 – 6.5   construcción: la ola baja de arriba/lejos hacia abajo/cerca
//   5.2 – 6.8 plataformas, haces y cubos de datos aparecen
//   6.5–12.5  ciudad viva: paquetes de luz en las calles y pulso vertical
//   12.5–13.6 los cubos se retiran
//   13.5–17.8 deshacer: la ola sube de abajo hacia arriba
//   17.8 – 20 respiro: solo calles tenues
// Cada edificio crece como un andamio (esqueleto, pisos, piel) y se deshace
// al revés. El reloj solo avanza mientras la escena corre: al salir de
// pantalla se congela y al volver continúa en el mismo fotograma.

const win = (c: number, a: number, b: number) =>
	Math.min(1, Math.max(0, (c - a) / (b - a)));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

type CubeSpec = { sx: number; sy: number; size: number; float: number };

// Posiciones de los cubos en coordenadas de pantalla isométrica (sx: derecha,
// sy: profundidad, mayor = más abajo). Se convierten a x/z del suelo.
// Dos cubos flotando en el cielo de los costados, entre los héroes; ningún
// haz cruza el bloque de texto.
const CUBES_WIDE: CubeSpec[] = [
	{ sx: -13.6, sy: 1.2, size: 3.4, float: 11 },
	{ sx: 13.8, sy: 2.2, size: 2.9, float: 9.8 },
];
// En celular el texto ocupa casi toda la pantalla: los cubos van abajo, a
// los lados de los botones, y no detrás del encabezado.
const CUBES_TALL: CubeSpec[] = [
	{ sx: 6.8, sy: 23, size: 2.0, float: 5.5 },
	{ sx: -6.3, sy: 23.5, size: 1.8, float: 5 },
];

interface Uniforms {
	uCycle: { value: number };
	uClock: { value: number };
	uPx: { value: number };
	uOpacity: { value: number };
	uRes: { value: Vector2 };
	uMaskR: { value: Vector2 };
	uMaskMin: { value: number };
	uFaceDim: { value: number };
	uHz: { value: Vector4 };
}

interface World {
	group: Group;
	dispose: () => void;
	cubes: { cube: Group; beam: Mesh; plat: LineSegments; spec: CubeSpec }[];
}

function buildWorld(portrait: boolean, u: Uniforms): World {
	const rand = rng(portrait ? 7 : 11);
	const group = new Group();
	const disposables: { dispose: () => void }[] = [];
	const specs = portrait ? CUBES_TALL : CUBES_WIDE;
	const platforms = specs.map(s => ({
		x: (s.sx + s.sy) * SQ,
		z: (s.sy - s.sx) * SQ,
		s,
	}));

	const city = generateCity(portrait, platforms);

	// --- Edificios: caras opacas (ocluyen) + aristas aditivas con depth test ---
	const faceGeo = new BufferGeometry();
	faceGeo.setAttribute('position', new BufferAttribute(city.fPos, 3));
	faceGeo.setAttribute('a0', new BufferAttribute(city.fA0, 4));
	faceGeo.setAttribute('a1', new BufferAttribute(city.fA1, 4));
	const faceMat = new ShaderMaterial({
		vertexShader: FACE_VS,
		fragmentShader: FACE_FS,
		uniforms: {
			uCycle: u.uCycle,
			uClock: u.uClock,
			uFaceDim: u.uFaceDim,
			uRes: u.uRes,
			uMaskR: u.uMaskR,
		},
		transparent: false,
		depthWrite: true,
		depthTest: true,
		blending: NormalBlending,
		side: DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	});
	const faces = new Mesh(faceGeo, faceMat);
	faces.frustumCulled = false;
	faces.renderOrder = 1;
	group.add(faces);

	const edgeGeo = new BufferGeometry();
	edgeGeo.setAttribute('position', new BufferAttribute(city.ePos, 3));
	edgeGeo.setAttribute('a0', new BufferAttribute(city.eA0, 4));
	edgeGeo.setAttribute('a1', new BufferAttribute(city.eA1, 4));
	const edgeMat = new ShaderMaterial({
		vertexShader: EDGE_VS,
		fragmentShader: EDGE_FS,
		uniforms: {
			uCycle: u.uCycle,
			uClock: u.uClock,
			uOpacity: u.uOpacity,
			uRes: u.uRes,
			uMaskR: u.uMaskR,
			uMaskMin: u.uMaskMin,
		},
		transparent: true,
		depthWrite: false,
		depthTest: true,
		blending: AdditiveBlending,
	});
	const edges = new LineSegments(edgeGeo, edgeMat);
	edges.frustumCulled = false;
	edges.renderOrder = 2;
	group.add(edges);
	disposables.push(faceGeo, faceMat, edgeGeo, edgeMat);

	// --- Suelo: calles, avenidas y plazas ---
	const gridGeo = new BufferGeometry();
	gridGeo.setAttribute('position', new BufferAttribute(city.gPos, 3));
	gridGeo.setAttribute('aS', new BufferAttribute(city.gS, 1));
	gridGeo.setAttribute('aK', new BufferAttribute(city.gK, 1));
	const gridMat = new ShaderMaterial({
		vertexShader: GRID_VS,
		fragmentShader: GRID_FS,
		uniforms: { uCycle: u.uCycle, uOpacity: u.uOpacity, uHz: u.uHz },
		transparent: true,
		depthWrite: false,
		depthTest: true,
		blending: AdditiveBlending,
	});
	const grid = new LineSegments(gridGeo, gridMat);
	grid.frustumCulled = false;
	grid.renderOrder = 0;
	group.add(grid);
	disposables.push(gridGeo, gridMat);

	// --- Paquetes de luz que recorren calles y avenidas ---
	// pocos paquetes, sobre todo por avenidas: acento, no ruido
	const count = portrait ? 14 : 28;
	const N = count * 3;
	const pPos = new Float32Array(N * 3);
	const pLane = new Float32Array(N);
	const pAxis = new Float32Array(N);
	const pSpeed = new Float32Array(N);
	const pOff = new Float32Array(N);
	const pSeed = new Float32Array(N);
	const pTrail = new Float32Array(N);
	const avenues = city.lanes.filter(l => l.avenue);
	for (let i = 0; i < count; i++) {
		const pool = rand() < 0.75 && avenues.length ? avenues : city.lanes;
		const lane = pool[Math.floor(rand() * pool.length)].c;
		const axis = rand() < 0.5 ? 0 : 1;
		const speed = (rand() < 0.5 ? -1 : 1) * (1.6 + rand() * 2.2);
		const off = rand();
		const seed = rand();
		for (let k = 0; k < 3; k++) {
			const j = i * 3 + k;
			pLane[j] = lane;
			pAxis[j] = axis;
			pSpeed[j] = speed;
			pOff[j] = off;
			pSeed[j] = seed;
			pTrail[j] = k;
		}
	}
	const packetGeo = new BufferGeometry();
	packetGeo.setAttribute('position', new BufferAttribute(pPos, 3));
	packetGeo.setAttribute('aLane', new BufferAttribute(pLane, 1));
	packetGeo.setAttribute('aAxis', new BufferAttribute(pAxis, 1));
	packetGeo.setAttribute('aSpeed', new BufferAttribute(pSpeed, 1));
	packetGeo.setAttribute('aOff', new BufferAttribute(pOff, 1));
	packetGeo.setAttribute('aSeed', new BufferAttribute(pSeed, 1));
	packetGeo.setAttribute('aTrail', new BufferAttribute(pTrail, 1));
	const packetMat = new ShaderMaterial({
		vertexShader: PACKET_VS,
		fragmentShader: PACKET_FS,
		uniforms: {
			uClock: u.uClock,
			uCycle: u.uCycle,
			uPx: u.uPx,
			uOpacity: u.uOpacity,
			uHz: u.uHz,
		},
		transparent: true,
		depthWrite: false,
		depthTest: true,
		blending: AdditiveBlending,
	});
	const packets = new Points(packetGeo, packetMat);
	packets.frustumCulled = false;
	packets.renderOrder = 3;
	group.add(packets);
	disposables.push(packetGeo, packetMat);

	// --- Cubos de datos con haz de luz y plataforma ---
	const cubes: World['cubes'] = [];
	for (const pl of platforms) {
		const { s } = pl;
		const holder = new Group();
		holder.position.set(pl.x, 0, pl.z);
		group.add(holder);

		const sq = (r: number) => [
			-r,
			0.04,
			-r,
			r,
			0.04,
			-r,
			r,
			0.04,
			-r,
			r,
			0.04,
			r,
			r,
			0.04,
			r,
			-r,
			0.04,
			r,
			-r,
			0.04,
			r,
			-r,
			0.04,
			-r,
		];
		const platGeo = new BufferGeometry();
		platGeo.setAttribute(
			'position',
			new BufferAttribute(
				new Float32Array([...sq(1.5), ...sq(1.05), ...sq(0.6)]),
				3,
			),
		);
		const platMat = new LineBasicMaterial({
			color: 0x9aa5ff,
			transparent: true,
			opacity: 0,
			blending: AdditiveBlending,
			depthWrite: false,
		});
		const plat = new LineSegments(platGeo, platMat);
		plat.renderOrder = 4;
		holder.add(plat);

		const beamH = s.float - s.size / 2;
		const beamR = s.size * 0.9 * SQ;
		const beamGeo = new CylinderGeometry(
			beamR * 0.85,
			beamR * 1.05,
			beamH,
			4,
			1,
			true,
		);
		beamGeo.rotateY(Math.PI / 4);
		beamGeo.translate(0, beamH / 2, 0);
		const beamMat = new ShaderMaterial({
			vertexShader: BEAM_VS,
			fragmentShader: BEAM_FS,
			uniforms: { uH: { value: beamH } },
			transparent: true,
			depthWrite: false,
			blending: AdditiveBlending,
			side: DoubleSide,
		});
		const beam = new Mesh(beamGeo, beamMat);
		beam.renderOrder = 4;
		holder.add(beam);

		const cube = new Group();
		cube.position.y = s.float;
		holder.add(cube);
		const boxGeo = new BoxGeometry(s.size, s.size, s.size);
		const outerEdges = new EdgesGeometry(boxGeo);
		const outerMat = new LineBasicMaterial({
			color: 0xa5b0ff,
			transparent: true,
			opacity: 0.85,
			blending: AdditiveBlending,
			depthWrite: false,
		});
		const fillMat = new MeshBasicMaterial({
			color: 0x6670ff,
			transparent: true,
			opacity: 0.07,
			blending: AdditiveBlending,
			depthWrite: false,
			side: DoubleSide,
		});
		const innerGeo = new EdgesGeometry(
			new BoxGeometry(s.size * 0.5, s.size * 0.5, s.size * 0.5),
		);
		const innerMat = new LineBasicMaterial({
			color: 0x67e8f9,
			transparent: true,
			opacity: 0.8,
			blending: AdditiveBlending,
			depthWrite: false,
		});
		const inner = new LineSegments(innerGeo, innerMat);
		inner.name = 'inner';
		const outer = new LineSegments(outerEdges, outerMat);
		const fill = new Mesh(boxGeo, fillMat);
		outer.renderOrder = fill.renderOrder = inner.renderOrder = 4;
		cube.add(outer, fill, inner);

		const nCore = portrait ? 44 : 70;
		const cPos = new Float32Array(nCore * 3);
		const cSeed = new Float32Array(nCore);
		for (let i = 0; i < nCore; i++) {
			cPos[i * 3] = (rand() - 0.5) * s.size * 0.8;
			cPos[i * 3 + 1] = (rand() - 0.5) * s.size * 0.8;
			cPos[i * 3 + 2] = (rand() - 0.5) * s.size * 0.8;
			cSeed[i] = rand();
		}
		const coreGeo = new BufferGeometry();
		coreGeo.setAttribute('position', new BufferAttribute(cPos, 3));
		coreGeo.setAttribute('aSeed', new BufferAttribute(cSeed, 1));
		const coreMat = new ShaderMaterial({
			vertexShader: CORE_VS,
			fragmentShader: CORE_FS,
			uniforms: { uClock: u.uClock, uPx: u.uPx },
			transparent: true,
			depthWrite: false,
			blending: AdditiveBlending,
		});
		const core = new Points(coreGeo, coreMat);
		core.frustumCulled = false;
		core.renderOrder = 4;
		cube.add(core);

		disposables.push(
			platGeo,
			platMat,
			beamGeo,
			beamMat,
			boxGeo,
			outerEdges,
			innerGeo,
			coreGeo,
			coreMat,
			outerMat,
			fillMat,
			innerMat,
		);
		cubes.push({ cube, beam, plat, spec: s });
	}

	return { group, cubes, dispose: () => disposables.forEach(d => d.dispose()) };
}

export default function HeroCityScene() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const reduced = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;

		let renderer: WebGLRenderer;
		try {
			renderer = new WebGLRenderer({
				alpha: true,
				antialias: window.devicePixelRatio < 2,
				powerPreference: 'high-performance',
			});
		} catch {
			return; // sin WebGL: queda el degradado de fondo
		}
		renderer.setClearColor(0x000000, 0);
		let pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
		renderer.setPixelRatio(pixelRatio);
		const canvas = renderer.domElement;
		canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
		container.appendChild(canvas);

		const uniforms: Uniforms = {
			uCycle: { value: 0 },
			uClock: { value: 0 },
			uPx: { value: pixelRatio },
			uOpacity: { value: 1 },
			uRes: { value: new Vector2(1, 1) },
			uMaskR: { value: new Vector2(0.3, 0.3) },
			uMaskMin: { value: 0.5 },
			uFaceDim: { value: 1 },
			uHz: { value: new Vector4() },
		};
		const scene = new Scene();
		const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
		const D = 60;

		let portrait = container.clientHeight > container.clientWidth;
		let world = buildWorld(portrait, uniforms);
		scene.add(world.group);

		// Reloj de la animación: solo avanza mientras la escena corre.
		let clock = 0;

		const syncRes = () => {
			renderer.getDrawingBufferSize(uniforms.uRes.value);
		};
		const fit = () => {
			const w = Math.max(1, container.clientWidth);
			const h = Math.max(1, container.clientHeight);
			const aspect = w / h;
			const nowPortrait = h > w;
			// vista más ancha en celular: se ve la ciudad, no un solo edificio
			const halfH = nowPortrait ? Math.max(12, 10.5 / aspect) : 11.5;
			camera.left = -halfH * aspect;
			camera.right = halfH * aspect;
			camera.top = halfH;
			camera.bottom = -halfH;
			// en celular la mirada sube: la ciudad se asienta en la parte baja
			const ty = nowPortrait ? 9.5 : 4.5;
			camera.position.set(D, D + ty, D);
			camera.lookAt(0, ty, 0);
			camera.updateProjectionMatrix();
			renderer.setSize(w, h, false);
			syncRes();
			uniforms.uOpacity.value = nowPortrait ? 0.85 : 1;
			// el texto manda: la zona detrás del bloque de texto se aclara menos
			uniforms.uMaskR.value.set(
				nowPortrait ? 0.55 : 0.3,
				nowPortrait ? 0.35 : 0.3,
			);
			uniforms.uMaskMin.value = nowPortrait ? 0.55 : 0.5;
			uniforms.uFaceDim.value = nowPortrait ? 0.85 : 1;
			const L = nowPortrait ? LAYOUT_TALL : LAYOUT_WIDE;
			uniforms.uHz.value.set(L.s0, L.s1, L.a, L.b);
			if (nowPortrait !== portrait) {
				portrait = nowPortrait;
				scene.remove(world.group);
				world.dispose();
				world = buildWorld(portrait, uniforms);
				scene.add(world.group);
			}
		};

		const apply = () => {
			const c = clock % CYCLE;
			uniforms.uCycle.value = c;
			uniforms.uClock.value = clock;
			world.cubes.forEach((cb, i) => {
				const oIn = i * 0.25;
				const oOut = i * 0.12;
				const kPlat =
					easeOut(win(c, 5.2 + oIn, 5.7 + oIn)) *
					(1 - easeOut(win(c, 13.3 + oOut, 13.6 + oOut)));
				const kBeam =
					easeOut(win(c, 5.6 + oIn, 6.2 + oIn)) *
					(1 - easeOut(win(c, 12.9 + oOut, 13.4 + oOut)));
				const kCube =
					easeOut(win(c, 6.0 + oIn, 6.8 + oIn)) *
					(1 - easeOut(win(c, 12.5 + oOut, 13.0 + oOut)));
				cb.cube.visible = kCube > 0.001;
				cb.cube.scale.setScalar(Math.max(kCube, 0.0001));
				cb.beam.visible = kBeam > 0.001;
				cb.beam.scale.y = Math.max(kBeam, 0.0001);
				(cb.plat.material as LineBasicMaterial).opacity = kPlat * 0.9;
				cb.plat.visible = kPlat > 0.001;
				cb.cube.position.y =
					cb.spec.float + Math.sin(clock * 0.8 + i * 2.1) * 0.22 * kCube;
				const inner = cb.cube.getObjectByName('inner');
				if (inner) {
					inner.rotation.y = -clock * 0.5;
					inner.rotation.x = clock * 0.3;
				}
			});
		};

		fit();

		let raf = 0;
		let last = 0;
		let running = false;
		let visible = true;
		let acc = 0;
		let frames = 0;

		const frame = (now: number) => {
			raf = requestAnimationFrame(frame);
			const dt = Math.min(0.25, (now - last) / 1000);
			last = now;
			clock += dt;
			apply();
			renderer.render(scene, camera);

			// Gobernador de calidad: si los frames se alargan, baja la
			// resolución interna en vez de dejar que la página se trabe.
			acc += dt;
			frames++;
			if (acc >= 1.2) {
				if (acc / frames > 0.026 && pixelRatio > 1.25) {
					pixelRatio = Math.max(1.25, pixelRatio - 0.25);
					renderer.setPixelRatio(pixelRatio);
					renderer.setSize(
						container.clientWidth,
						container.clientHeight,
						false,
					);
					uniforms.uPx.value = pixelRatio;
					syncRes();
				}
				acc = 0;
				frames = 0;
			}
		};
		const start = () => {
			if (running || reduced) return;
			running = true;
			last = performance.now();
			raf = requestAnimationFrame(frame);
		};
		const stop = () => {
			running = false;
			cancelAnimationFrame(raf);
		};
		// Fuera de pantalla o con la pestaña oculta no se dibuja nada: ni
		// CPU ni GPU. Al volver continúa exactamente donde se quedó.
		const sync = () => (visible && !document.hidden ? start() : stop());

		const still = () => {
			clock = 9; // ciudad completa, cubos desplegados
			apply();
			renderer.render(scene, camera);
		};
		const ro = new ResizeObserver(() => {
			fit();
			if (reduced) still();
		});
		ro.observe(container);
		const io = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			sync();
		});
		io.observe(container);
		document.addEventListener('visibilitychange', sync);

		if (reduced) still();
		else sync();

		return () => {
			stop();
			ro.disconnect();
			io.disconnect();
			document.removeEventListener('visibilitychange', sync);
			scene.remove(world.group);
			world.dispose();
			renderer.dispose();
			canvas.remove();
		};
	}, []);

	return (
		<div
			ref={containerRef}
			aria-hidden='true'
			className='hero-scroll-bg pointer-events-none absolute inset-0'
		/>
	);
}
