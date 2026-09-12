'use client';
import { useEffect, useRef } from 'react';
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	Clock,
	Color,
	LineBasicMaterial,
	LineSegments,
	Object3D,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	Vector3,
	WebGLRenderer,
} from 'three';

// Paleta de marca: los mismos tonos que ya usan las burbujas/blobs del
// resto del sitio, para que el 3D se sienta parte del mismo sistema y no
// un elemento importado de otro lado.
const NODE_COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#F97316'];
const NODE_COUNT = 34;
const NEIGHBORS_PER_NODE = 3;
const PULSE_COUNT = 9;

// Empuja un valor en [-1, 1] hacia los bordes, dejando un hueco cerca de
// 0. Se usa para que la red enmarque el texto del hero por los costados
// en vez de cruzar por encima de él.
function pushFromCenter(v: number, gap: number): number {
	const sign = v < 0 ? -1 : 1;
	return sign * (gap + Math.abs(v) * (1 - gap));
}

// Distribución de Fibonacci sobre una esfera: da una nube de puntos
// pareja (sin huecos ni amontonamientos), a diferencia de posiciones
// aleatorias puras. Se aparta del centro en X/Y (donde vive el texto) y
// se escala a un elipsoide ancho y bajo para encajar en el hero.
function fibonacciSpherePoints(count: number): Vector3[] {
	const points: Vector3[] = [];
	const goldenAngle = Math.PI * (3 - Math.sqrt(5));
	for (let i = 0; i < count; i++) {
		const y = 1 - (i / (count - 1)) * 2;
		const radiusAtY = Math.sqrt(1 - y * y);
		const theta = goldenAngle * i;
		const x = pushFromCenter(Math.cos(theta) * radiusAtY, 0.55);
		const yShaped = pushFromCenter(y, 0.4);
		const z = Math.sin(theta) * radiusAtY;
		points.push(new Vector3(x * 5.4, yShaped * 2.9, z * 2.4));
	}
	return points;
}

// Conecta cada nodo con sus vecinos más cercanos: la red queda como un
// grafo real derivado de las posiciones (no líneas puestas a mano), que
// es la misma idea de "sistemas distribuidos conectados" que atraviesa
// varios de los proyectos reales (WebSockets, APIs, sincronización).
function buildEdges(points: Vector3[]): [number, number][] {
	const edges: [number, number][] = [];
	const seen = new Set<string>();
	points.forEach((p, i) => {
		const distances = points
			.map((q, j) => ({ j, d: i === j ? Infinity : p.distanceTo(q) }))
			.sort((a, b) => a.d - b.d)
			.slice(0, NEIGHBORS_PER_NODE);
		distances.forEach(({ j }) => {
			const key = i < j ? `${i}-${j}` : `${j}-${i}`;
			if (!seen.has(key)) {
				seen.add(key);
				edges.push([i, j]);
			}
		});
	});
	return edges;
}

// Textura de un punto suave (blanco opaco al centro, transparente en el
// borde) generada en un <canvas>, sin depender de un asset externo. Se
// reutiliza para halos, núcleos y pulsos: solo cambian tamaño/color/
// opacidad de cada capa de Points que la usa.
function createGlowTexture(): CanvasTexture {
	const size = 128;
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	const gradient = ctx.createRadialGradient(
		size / 2,
		size / 2,
		0,
		size / 2,
		size / 2,
		size / 2,
	);
	gradient.addColorStop(0, 'rgba(255,255,255,1)');
	gradient.addColorStop(0.35, 'rgba(255,255,255,0.75)');
	gradient.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, size, size);
	const texture = new CanvasTexture(canvas);
	texture.needsUpdate = true;
	return texture;
}

type Pulse = { edge: number; progress: number; speed: number; delay: number };

function spawnPulse(edgeCount: number): Pulse {
	return {
		edge: Math.floor(Math.random() * edgeCount),
		progress: 0,
		speed: 0.28 + Math.random() * 0.3,
		delay: 0.3 + Math.random() * 2.2,
	};
}

export default function HeroNetworkScene() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// La red está compuesta y encuadrada para un hero ancho. En pantallas
		// angostas el frustum de la cámara queda mucho más recortado en
		// horizontal y los nodos (pensados para enmarcar el texto por los
		// costados) caen fuera de cuadro: se pagaría el costo de WebGL sin
		// mostrar nada. Los blobs de fondo ya dan ambiente propio ahí, así que
		// directamente no se monta.
		if (!window.matchMedia('(min-width: 768px)').matches) return;

		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)',
		).matches;

		let renderer: WebGLRenderer;
		try {
			renderer = new WebGLRenderer({ antialias: true, alpha: true });
		} catch {
			// Sin soporte de WebGL: no monta nada, el gradiente/blobs de fondo
			// del hero siguen ahí solos, sin hueco roto.
			return;
		}

		const scene = new Scene();
		const camera = new PerspectiveCamera(50, 1, 0.1, 100);
		camera.position.set(0, 0, 9);

		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		container.appendChild(renderer.domElement);

		const points = fibonacciSpherePoints(NODE_COUNT);
		const edges = buildEdges(points);
		const glowTexture = createGlowTexture();

		// Nodos: nada de geometría poligonal (se leía como "cubos"/gemas
		// facetadas) — cada nodo son dos sprites concéntricos (halo suave +
		// núcleo brillante) sobre la misma textura radial, como una neurona
		// vista de lejos. Comparten un único BufferGeometry: dos Points, una
		// sola fuente de posiciones/colores.
		const nodePositions = new Float32Array(NODE_COUNT * 3);
		const nodeColors = new Float32Array(NODE_COUNT * 3);
		const tmpColor = new Color();
		points.forEach((p, i) => {
			nodePositions.set([p.x, p.y, p.z], i * 3);
			tmpColor.set(NODE_COLORS[i % NODE_COLORS.length]);
			nodeColors.set([tmpColor.r, tmpColor.g, tmpColor.b], i * 3);
		});
		const nodeGeometry = new BufferGeometry();
		nodeGeometry.setAttribute(
			'position',
			new BufferAttribute(nodePositions, 3),
		);
		nodeGeometry.setAttribute('color', new BufferAttribute(nodeColors, 3));

		const haloMaterial = new PointsMaterial({
			size: 0.85,
			sizeAttenuation: true,
			map: glowTexture,
			vertexColors: true,
			transparent: true,
			opacity: 0.3,
			depthWrite: false,
		});
		const coreMaterial = new PointsMaterial({
			size: 0.3,
			sizeAttenuation: true,
			map: glowTexture,
			vertexColors: true,
			transparent: true,
			opacity: 0.85,
			depthWrite: false,
		});
		const nodeHalos = new Points(nodeGeometry, haloMaterial);
		const nodeCores = new Points(nodeGeometry, coreMaterial);

		// Aristas: un solo LineSegments con todos los tramos, coloreadas
		// suaves para que los nodos sean el foco.
		const edgePositions = new Float32Array(edges.length * 6);
		edges.forEach(([a, b], i) => {
			edgePositions.set(
				[
					points[a].x,
					points[a].y,
					points[a].z,
					points[b].x,
					points[b].y,
					points[b].z,
				],
				i * 6,
			);
		});
		const edgeGeometry = new BufferGeometry();
		edgeGeometry.setAttribute(
			'position',
			new BufferAttribute(edgePositions, 3),
		);
		const edgeMaterial = new LineBasicMaterial({
			color: '#94a3b8',
			transparent: true,
			opacity: 0.22,
		});
		const edgeLines = new LineSegments(edgeGeometry, edgeMaterial);

		// Pulsos: pequeñas "señales" que recorren aristas al azar, una a la
		// vez por slot, con su propia demora antes de partir — como impulsos
		// nerviosos disparándose de forma asíncrona por la red. Una sola capa
		// de Points cuyas posiciones se reescriben cada frame (barato: 9
		// vértices).
		const pulses: Pulse[] = Array.from({ length: PULSE_COUNT }, () =>
			spawnPulse(edges.length),
		);
		const pulsePositions = new Float32Array(PULSE_COUNT * 3);
		const pulseGeometry = new BufferGeometry();
		const pulsePositionAttr = new BufferAttribute(pulsePositions, 3);
		pulseGeometry.setAttribute('position', pulsePositionAttr);
		const pulseMaterial = new PointsMaterial({
			size: 0.26,
			sizeAttenuation: true,
			map: glowTexture,
			color: '#ffffff',
			transparent: true,
			opacity: 0.95,
			depthWrite: false,
			blending: AdditiveBlending,
		});
		const pulsePoints = new Points(pulseGeometry, pulseMaterial);

		const group = new Object3D();
		group.add(edgeLines, nodeHalos, nodeCores, pulsePoints);
		group.rotation.x = 0.15;
		scene.add(group);

		// --- Resize: el canvas llena su contenedor, no la ventana -----------
		const resize = () => {
			const { width, height } = container.getBoundingClientRect();
			if (width === 0 || height === 0) return;
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		};
		resize();
		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(container);

		// --- Paralaje suave con el mouse (barato: dos lerps por frame) ------
		const pointerTarget = { x: 0, y: 0 };
		const onPointerMove = (e: PointerEvent) => {
			pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
			pointerTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
		};
		if (!prefersReducedMotion) {
			window.addEventListener('pointermove', onPointerMove, { passive: true });
		}

		// --- Render loop, con pausa cuando no aporta nada --------------------
		// Se detiene por completo (sin requestAnimationFrame en vuelo) cuando
		// la pestaña está oculta o el hero salió del viewport, y con
		// prefers-reduced-motion solo dibuja un frame estático.
		const clock = new Clock();
		let frameId: number | null = null;
		let isVisible = true;
		let elapsed = 0;
		let autoRotationY = 0;
		let parallaxX = 0;
		let parallaxY = 0;

		const updatePulses = (delta: number) => {
			for (let i = 0; i < pulses.length; i++) {
				const pulse = pulses[i];
				const [a, b] = edges[pulse.edge];
				const pa = points[a];
				const pb = points[b];
				if (pulse.delay > 0) {
					pulse.delay -= delta;
					pulsePositions.set([pa.x, pa.y, pa.z], i * 3);
					continue;
				}
				pulse.progress += delta * pulse.speed;
				if (pulse.progress >= 1) {
					pulses[i] = spawnPulse(edges.length);
					continue;
				}
				pulsePositions.set(
					[
						pa.x + (pb.x - pa.x) * pulse.progress,
						pa.y + (pb.y - pa.y) * pulse.progress,
						pa.z + (pb.z - pa.z) * pulse.progress,
					],
					i * 3,
				);
			}
			pulsePositionAttr.needsUpdate = true;
		};

		const renderFrame = () => {
			const delta = Math.min(clock.getDelta(), 0.1);
			elapsed += delta;
			autoRotationY += delta * 0.05;
			// Paralaje suavizado (lerp) hacia el target del mouse, en vez de
			// escribir la rotación directo: así no salta cuando el mouse se
			// mueve rápido.
			parallaxX += (pointerTarget.x - parallaxX) * 0.04;
			parallaxY += (pointerTarget.y - parallaxY) * 0.04;
			group.rotation.y = autoRotationY + parallaxX * 0.15;
			group.rotation.x = 0.15 + parallaxY * 0.12;

			// Respiración lenta y sincronizada: un único seno aplicado al
			// material (no por nodo) para que la red se sienta viva sin
			// necesitar un shader por-vértice.
			const breathe = Math.sin(elapsed * 0.8) * 0.5 + 0.5;
			coreMaterial.opacity = 0.75 + breathe * 0.15;
			haloMaterial.opacity = 0.24 + breathe * 0.12;

			if (!prefersReducedMotion) updatePulses(delta);
			renderer.render(scene, camera);
		};

		const loop = () => {
			renderFrame();
			frameId = requestAnimationFrame(loop);
		};

		const startLoop = () => {
			if (frameId !== null || prefersReducedMotion) return;
			clock.getDelta(); // descarta el tiempo acumulado mientras estuvo en pausa
			frameId = requestAnimationFrame(loop);
		};
		const stopLoop = () => {
			if (frameId === null) return;
			cancelAnimationFrame(frameId);
			frameId = null;
		};

		if (prefersReducedMotion) {
			renderFrame(); // un solo frame estático, sin animar ni escuchar nada más
		} else {
			startLoop();
		}

		const intersectionObserver = new IntersectionObserver(
			([entry]) => {
				isVisible = entry.isIntersecting;
				if (isVisible && document.visibilityState === 'visible') startLoop();
				else stopLoop();
			},
			{ threshold: 0 },
		);
		intersectionObserver.observe(container);

		const onVisibilityChange = () => {
			if (document.visibilityState === 'visible' && isVisible) startLoop();
			else stopLoop();
		};
		document.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			stopLoop();
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
			document.removeEventListener('visibilitychange', onVisibilityChange);
			window.removeEventListener('pointermove', onPointerMove);
			nodeGeometry.dispose();
			haloMaterial.dispose();
			coreMaterial.dispose();
			edgeGeometry.dispose();
			edgeMaterial.dispose();
			pulseGeometry.dispose();
			pulseMaterial.dispose();
			glowTexture.dispose();
			renderer.dispose();
			container.removeChild(renderer.domElement);
		};
	}, []);

	return (
		<div
			ref={containerRef}
			aria-hidden='true'
			className='pointer-events-none absolute inset-0'
		/>
	);
}
