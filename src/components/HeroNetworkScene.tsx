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
const PULSE_COUNT = 9;
const CLOUD_COUNT = 22;

// Empuja un valor en [-1, 1] hacia los bordes, dejando un hueco cerca de
// 0. Se usa para que la red enmarque el texto del hero por los costados
// en vez de cruzar por encima de él.
function pushFromCenter(v: number, gap: number): number {
	const sign = v < 0 ? -1 : 1;
	return sign * (gap + Math.abs(v) * (1 - gap));
}

// Forma del elipsoide de nodos, según el aspecto real del contenedor.
// En un hero ancho (desktop) el texto es una columna angosta en el
// medio: la red se aparta del centro en X y cubre bastante alto/bajo.
// En uno angosto (celular) el texto ocupa casi todo el ancho pero solo
// una franja vertical: la red se achica en X (si no, no entra en el
// frustum) y se aparta del centro en Y, agrupándose arriba/abajo del
// bloque de texto en vez de a los costados.
function shapeForAspect(aspect: number) {
	const isPortrait = aspect < 1;
	return isPortrait
		? {
				gapX: 0.1,
				gapY: 0.05,
				scaleX: 2.0,
				scaleY: 4.2,
				scaleZ: 1.6,
				// En celular el texto ocupa casi toda la columna: sin un hueco
				// limpio donde meter la red, se baja la opacidad y la densidad
				// (menos nodos, menos vecinos por nodo) para que se sienta a
				// atmósfera detrás del texto y no a maraña de líneas encima.
				opacityScale: 0.45,
				nodeCount: 20,
				neighbors: 2,
			}
		: {
				gapX: 0.55,
				gapY: 0.4,
				scaleX: 5.4,
				scaleY: 2.9,
				scaleZ: 2.4,
				opacityScale: 1,
				nodeCount: 34,
				neighbors: 3,
			};
}

// Distribución de Fibonacci sobre una esfera: da una nube de puntos
// pareja (sin huecos ni amontonamientos), a diferencia de posiciones
// aleatorias puras, luego deformada según shapeForAspect.
function fibonacciSpherePoints(
	count: number,
	shape: ReturnType<typeof shapeForAspect>,
): Vector3[] {
	const points: Vector3[] = [];
	const goldenAngle = Math.PI * (3 - Math.sqrt(5));
	for (let i = 0; i < count; i++) {
		const y = 1 - (i / (count - 1)) * 2;
		const radiusAtY = Math.sqrt(1 - y * y);
		const theta = goldenAngle * i;
		const x = pushFromCenter(Math.cos(theta) * radiusAtY, shape.gapX);
		const yShaped = pushFromCenter(y, shape.gapY);
		const z = Math.sin(theta) * radiusAtY;
		points.push(
			new Vector3(x * shape.scaleX, yShaped * shape.scaleY, z * shape.scaleZ),
		);
	}
	return points;
}

// Conecta cada nodo con sus vecinos más cercanos: la red queda como un
// grafo real derivado de las posiciones (no líneas puestas a mano), que
// es la misma idea de "sistemas distribuidos conectados" que atraviesa
// varios de los proyectos reales (WebSockets, APIs, sincronización).
function buildEdges(
	points: Vector3[],
	neighborsPerNode: number,
): [number, number][] {
	const edges: [number, number][] = [];
	const seen = new Set<string>();
	points.forEach((p, i) => {
		const distances = points
			.map((q, j) => ({ j, d: i === j ? Infinity : p.distanceTo(q) }))
			.sort((a, b) => a.d - b.d)
			.slice(0, neighborsPerNode);
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

// Textura de "nube": varios círculos suaves superpuestos en posiciones
// al azar dentro del mismo lienzo, en vez de un único círculo perfecto.
// El contorno irregular resultante es lo que hace que, al agrandar el
// sprite, se lea como humo/niebla y no como un punto de luz más.
function createCloudTexture(): CanvasTexture {
	const size = 256;
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	const puffs = 6;
	for (let i = 0; i < puffs; i++) {
		const cx = size * (0.3 + Math.random() * 0.4);
		const cy = size * (0.3 + Math.random() * 0.4);
		const r = size * (0.22 + Math.random() * 0.16);
		const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
		gradient.addColorStop(0, 'rgba(255,255,255,0.55)');
		gradient.addColorStop(0.5, 'rgba(255,255,255,0.22)');
		gradient.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, size, size);
	}
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

		// La forma de la red se decide una vez, con el tamaño real del
		// contenedor al montar (no con el de la ventana completa, que no
		// coincide con el alto del hero). Si cambia de orientación (celular
		// girado) no se recalcula: es un fondo ambiental, no vale la pena la
		// complejidad de reconstruir toda la geometría en pleno uso.
		const initialRect = container.getBoundingClientRect();
		const shape = shapeForAspect(initialRect.width / (initialRect.height || 1));

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

		const nodeCount = shape.nodeCount;
		const points = fibonacciSpherePoints(nodeCount, shape);
		const edges = buildEdges(points, shape.neighbors);
		const glowTexture = createGlowTexture();

		// Nodos: nada de geometría poligonal (se leía como "cubos"/gemas
		// facetadas) — cada nodo son dos sprites concéntricos (halo suave +
		// núcleo brillante) sobre la misma textura radial, como una neurona
		// vista de lejos. Comparten un único BufferGeometry: dos Points, una
		// sola fuente de posiciones/colores.
		const nodePositions = new Float32Array(nodeCount * 3);
		const nodeColors = new Float32Array(nodeCount * 3);
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

		// Aristas: un solo LineSegments con todos los tramos. Cada arista
		// hereda el color de sus dos neuronas (degradado entre ambas) en vez
		// de un gris plano, y se dibuja con blending aditivo — así se lee
		// como la conexión "encendida" entre neuronas, no como un cable
		// genérico, y brilla más donde varias aristas convergen en un nodo.
		const edgePositions = new Float32Array(edges.length * 6);
		const edgeColors = new Float32Array(edges.length * 6);
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
			tmpColor.set(NODE_COLORS[a % NODE_COLORS.length]);
			edgeColors.set([tmpColor.r, tmpColor.g, tmpColor.b], i * 6);
			tmpColor.set(NODE_COLORS[b % NODE_COLORS.length]);
			edgeColors.set([tmpColor.r, tmpColor.g, tmpColor.b], i * 6 + 3);
		});
		const edgeGeometry = new BufferGeometry();
		edgeGeometry.setAttribute(
			'position',
			new BufferAttribute(edgePositions, 3),
		);
		edgeGeometry.setAttribute('color', new BufferAttribute(edgeColors, 3));
		const edgeMaterial = new LineBasicMaterial({
			vertexColors: true,
			transparent: true,
			opacity: 0.45 * shape.opacityScale,
			blending: AdditiveBlending,
			depthWrite: false,
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

		// Nubes: manchas de humo de color grandes y tenues, detrás de la red,
		// para darle atmósfera de nebulosa sin oscurecer el fondo claro del
		// sitio. Su z es más negativo que el de los nodos (más lejos de la
		// cámara) y cubren todo el ancho, a diferencia de los nodos que se
		// apartan del centro para no tapar el texto: el humo es tan tenue que
		// pasar detrás del texto no afecta la legibilidad. Cada una deriva
		// con su propia fase/frecuencia (no solo el giro rígido del grupo),
		// para que se sientan como niebla real y no como un adorno fijo.
		const cloudTexture = createCloudTexture();
		const cloudBasePositions = new Float32Array(CLOUD_COUNT * 3);
		const cloudPositions = new Float32Array(CLOUD_COUNT * 3);
		const cloudColors = new Float32Array(CLOUD_COUNT * 3);
		const cloudDrift = Array.from({ length: CLOUD_COUNT }, () => ({
			freqX: 0.08 + Math.random() * 0.1,
			freqY: 0.06 + Math.random() * 0.09,
			offX: Math.random() * Math.PI * 2,
			offY: Math.random() * Math.PI * 2,
			ampX: 0.5 + Math.random() * 0.9,
			ampY: 0.4 + Math.random() * 0.7,
		}));
		// Mismo criterio que los nodos: la nube de humo se achica en X y se
		// alarga en Y cuando el hero es angosto, para no quedar recortada
		// fuera del frustum ni amontonada en el medio.
		const cloudRangeX = 7 * (shape.scaleX / 5.4);
		const cloudRangeY = 3.6 * (shape.scaleY / 2.9);
		for (let i = 0; i < CLOUD_COUNT; i++) {
			cloudBasePositions.set(
				[
					(Math.random() * 2 - 1) * cloudRangeX,
					(Math.random() * 2 - 1) * cloudRangeY,
					-3.5 - Math.random() * 3.5,
				],
				i * 3,
			);
			tmpColor.set(NODE_COLORS[i % NODE_COLORS.length]);
			cloudColors.set([tmpColor.r, tmpColor.g, tmpColor.b], i * 3);
		}
		cloudPositions.set(cloudBasePositions);
		const cloudGeometry = new BufferGeometry();
		const cloudPositionAttr = new BufferAttribute(cloudPositions, 3);
		cloudGeometry.setAttribute('position', cloudPositionAttr);
		cloudGeometry.setAttribute('color', new BufferAttribute(cloudColors, 3));
		const cloudMaterial = new PointsMaterial({
			size: 4.8,
			sizeAttenuation: true,
			map: cloudTexture,
			vertexColors: true,
			transparent: true,
			opacity: 0.22,
			depthWrite: false,
		});
		const cloudPoints = new Points(cloudGeometry, cloudMaterial);
		cloudPoints.renderOrder = -1;

		const cloudGroup = new Object3D();
		cloudGroup.add(cloudPoints);
		scene.add(cloudGroup);

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

		const updateClouds = () => {
			for (let i = 0; i < CLOUD_COUNT; i++) {
				const d = cloudDrift[i];
				cloudPositions[i * 3] =
					cloudBasePositions[i * 3] +
					Math.sin(elapsed * d.freqX + d.offX) * d.ampX;
				cloudPositions[i * 3 + 1] =
					cloudBasePositions[i * 3 + 1] +
					Math.cos(elapsed * d.freqY + d.offY) * d.ampY;
			}
			cloudPositionAttr.needsUpdate = true;
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

			// Las nubes giran más lento y reaccionan menos al mouse que la red:
			// al quedar más atrás y moverse con más inercia, se leen como una
			// capa aparte y dan sensación de profundidad (paralaje de capas).
			cloudGroup.rotation.y = autoRotationY * 0.35 + parallaxX * 0.05;
			cloudGroup.rotation.x = parallaxY * 0.04;

			// Respiración lenta y sincronizada: un único seno aplicado al
			// material (no por nodo) para que la red se sienta viva sin
			// necesitar un shader por-vértice.
			const breathe = Math.sin(elapsed * 0.8) * 0.5 + 0.5;
			coreMaterial.opacity = (0.75 + breathe * 0.15) * shape.opacityScale;
			haloMaterial.opacity = (0.24 + breathe * 0.12) * shape.opacityScale;
			cloudMaterial.opacity = 0.19 + Math.sin(elapsed * 0.3 + 2) * 0.04;

			if (!prefersReducedMotion) {
				updatePulses(delta);
				updateClouds();
			}
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
			cloudGeometry.dispose();
			cloudMaterial.dispose();
			cloudTexture.dispose();
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
