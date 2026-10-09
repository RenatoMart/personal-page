// Shaders de la ciudad del hero. Todo el ciclo (construir, vivir, deshacer)
// es una función pura de `uCycle` ∈ [0, CYCLE): la CPU solo escribe ese
// uniforme por frame, y por eso pausar/reanudar nunca produce saltos.

// Crecimiento "andamio": primero el esqueleto (aristas clave), luego los
// pisos y por último la piel (caras y remates). El deshacer es la inversa.
const GROW = /* glsl */ `
	attribute vec4 a0; // yn, start, dur, undo
	attribute vec4 a1; // durU, role|face, seed, -
	uniform float uCycle;
	varying float vYn;
	varying float vP;
	varying float vDepth;
	varying float vWy;
	varying float vA1y;
	varying float vSeed;
	varying float vU;
	void grow() {
		float bp = clamp((uCycle - a0.y) / a0.z, 0.0, 1.0);
		float up = clamp((uCycle - a0.w) / a1.x, 0.0, 1.0);
		vP = bp * (1.0 - up);
		vYn = a0.x;
		vA1y = a1.y;
		vSeed = a1.z;
		vU = a1.w;
		vDepth = (position.x + position.z) * 0.70710678;
		vWy = position.y;
	}
`;

const FRONTS = /* glsl */ `
	varying float vP;
	float ease3(float x) { return 1.0 - pow(1.0 - clamp(x, 0.0, 1.0), 3.0); }
	float fV() { return ease3(vP / 0.55) * 1.02; }
	float fF() { return ease3((vP - 0.20) / 0.60) * 1.02; }
	float fS() { return ease3((vP - 0.35) / 0.65) * 1.02; }
`;

// Misma "U" que generate.ts (horizonSy): fuera de la franja de la ciudad,
// calles y paquetes se apagan para dejar el cielo limpio.
const BAND = /* glsl */ `
	uniform vec4 uHz; // s0, s1, a, b
	float band(vec2 xz) {
		float sx = (xz.x - xz.y) * 0.70710678;
		float sy = (xz.x + xz.y) * 0.70710678;
		float hz = uHz.x - uHz.y * smoothstep(uHz.z, uHz.w, abs(sx));
		return smoothstep(hz - 1.5, hz + 1.0, sy);
	}
`;

export const EDGE_VS = /* glsl */ `
	${GROW}
	void main() {
		grow();
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

export const EDGE_FS = /* glsl */ `
	${FRONTS}
	uniform float uCycle;
	uniform float uClock;
	uniform float uOpacity;
	uniform vec2 uRes;
	uniform vec2 uMaskR;
	uniform float uMaskMin;
	varying float vYn;
	varying float vDepth;
	varying float vWy;
	varying float vA1y;
	varying float vSeed;
	varying float vU;
	void main() {
		if (vP <= 0.0001) discard;
		// rol + 10 × jerarquía (1 = héroe)
		float hero = step(9.5, vA1y);
		float r = vA1y - hero * 10.0;
		float front = r < 2.5 ? fV() : (r < 5.5 ? fF() : fS());
		if (vYn > front + 0.002) discard;

		vec3 key = vec3(0.894, 0.906, 1.0);
		vec3 sil = vec3(0.682, 0.706, 0.969);
		vec3 flo = vec3(0.557, 0.584, 0.910);
		vec3 cian = vec3(0.133, 0.827, 0.933);
		vec3 calido = vec3(0.984, 0.573, 0.235);
		vec3 col = sil;
		float a;
		if (r < 0.5) { a = 0.85; col = key; }
		else if (r < 1.5) { a = 0.60; }
		else if (r < 2.5) { a = 0.22; }
		else if (r < 3.5) { a = 0.10; col = flo; }
		else if (r < 4.5) { a = 0.15; col = flo; }
		else if (r < 5.5) { a = 0.07; col = flo; }
		else {
			a = 0.45;
			if (vU > 1.5) { col = calido; a = 0.70; }
			else if (vU > 0.5) { col = cian; a = 0.80; }
		}
		// la ciudad de fondo atenúa: el foco son los héroes y los cubos
		a *= mix(0.6, 1.0, hero);
		if (vSeed > 1.5) {
			col = calido;
			a = 0.9 * (0.35 + 0.65 * step(0.5, fract(uClock * 0.6 + vSeed * 7.0)));
		}

		// lo lejano se funde hacia la bruma violeta, lo cercano gana contraste
		float far = 1.0 - smoothstep(-22.0, 4.0, vDepth);
		col = mix(col, vec3(0.55, 0.48, 0.85), far * 0.45);
		a *= mix(1.0, 0.6, far);
		// aclara menos detrás del bloque de texto
		vec2 q = (gl_FragCoord.xy / uRes - vec2(0.5, 0.55)) / uMaskR;
		a *= mix(uMaskMin, 1.0, smoothstep(0.7, 1.2, length(q)));

		// borde de construcción encendido mientras el edificio sube/baja
		float building = step(0.001, vP) * (1.0 - step(0.999, vP));
		float glow = exp(-pow((vYn - fV()) / 0.025, 2.0)) * building;
		a += 0.8 * glow;
		col = mix(col, key, glow);

		// con la ciudad viva, un pulso de luz sube despacio por los edificios
		float aliveIn = smoothstep(6.5, 7.5, uCycle);
		float alive = aliveIn * (1.0 - smoothstep(11.5, 12.5, uCycle));
		float ph = mod(uCycle * 2.4, 22.0) - 3.0;
		a += exp(-pow((vWy - ph) / 1.3, 2.0)) * 0.15 * alive;

		gl_FragColor = vec4(col, a * uOpacity);
	}
`;

export const FACE_VS = /* glsl */ `
	${GROW}
	void main() {
		grow();
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

// Caras opacas: tapan las aristas traseras. Esa oclusión es lo que da
// lectura de "volumen" en vez de una pila de cristales transparentes.
export const FACE_FS = /* glsl */ `
	${FRONTS}
	uniform float uClock;
	uniform float uFaceDim;
	uniform vec2 uRes;
	uniform vec2 uMaskR;
	varying float vYn;
	varying float vDepth;
	varying float vA1y;
	varying float vWy;
	varying float vSeed;
	varying float vU;
	void main() {
		if (vP <= 0.0001) discard;
		if (vYn > fS() + 0.002) discard;
		float far = 1.0 - smoothstep(-22.0, 4.0, vDepth);
		float hero = step(9.5, vA1y);
		float fc = vA1y - hero * 10.0; // 0 derecha, 1 izquierda, 2 tapa

		// luz direccional: cara derecha iluminada, izquierda en sombra, tapa clara
		vec3 c;
		if (fc < 0.5) c = vec3(0.180, 0.165, 0.431);
		else if (fc < 1.5) c = vec3(0.098, 0.102, 0.278);
		else c = vec3(0.290, 0.247, 0.561);
		// base fría y oscura, cima algo más cálida
		c = mix(vec3(0.039, 0.055, 0.149), c, smoothstep(0.0, 0.85, vYn));
		float topGlow = smoothstep(0.75, 1.0, vYn) * step(fc, 0.5);
		c += vec3(0.984, 0.573, 0.235) * 0.05 * topGlow;
		// luz de borde en las verticales de las fachadas
		float rim = fc < 1.5 ? pow(1.0 - min(vU, 1.0 - vU) * 2.0, 6.0) : 0.0;
		c += vec3(0.682, 0.706, 0.969) * 0.10 * rim;
		// lo cercano más contrastado; lo lejano, hacia la bruma
		c *= mix(1.08, 1.0, far) * mix(1.0, 1.1, hero);
		c = mix(c, vec3(0.169, 0.129, 0.376), far * 0.55);

		// ventanas encendidas: solo en héroes, pocas, lentas y tenues
		if (hero > 0.5 && fc < 1.5 && vYn > 0.1) {
			float fl = floor(vWy / 0.42);
			float co = floor(vU * 5.0);
			vec3 hv = vec3(fl, co, vSeed * 91.0);
			float h = fract(sin(dot(hv, vec3(12.9, 78.2, 37.7))) * 43758.5);
			vec2 cell = vec2(fract(vU * 5.0), fract(vWy / 0.42));
			float bx = step(0.25, cell.x) * step(cell.x, 0.75);
			float by = step(0.3, cell.y) * step(cell.y, 0.7);
			float box = bx * by;
			float on = smoothstep(0.45, 0.55, fract(h * 7.0 + uClock * 0.03));
			vec2 q = (gl_FragCoord.xy / uRes - vec2(0.5, 0.55)) / uMaskR;
			float away = smoothstep(0.7, 1.2, length(q));
			vec3 lamp = h > 0.99 ? vec3(0.40, 0.90, 0.98) : vec3(1.0, 0.77, 0.54);
			float k = box * on * step(0.955, h) * 0.5 * (1.0 - far) * away;
			c = mix(c, lamp, k);
		}
		gl_FragColor = vec4(c * uFaceDim, 1.0);
	}
`;

export const GRID_VS = /* glsl */ `
	attribute float aS;
	attribute float aK;
	varying float vS;
	varying float vK;
	varying vec2 vXZ;
	void main() {
		vS = aS;
		vK = aK;
		vXZ = position.xz;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

export const GRID_FS = /* glsl */ `
	${BAND}
	uniform float uCycle;
	uniform float uOpacity;
	varying float vS;
	varying float vK;
	varying vec2 vXZ;
	void main() {
		float u = clamp((24.0 - vS) / 48.0, 0.0, 1.0);
		// las calles aparecen un poco antes que los edificios de su zona
		float on = smoothstep((1.0 - u) * 3.8 - 0.8, (1.0 - u) * 3.8 - 0.2, uCycle);
		float endU = 13.5 + u * 3.0 + 1.7;
		float off = smoothstep(endU, endU + 0.6, uCycle);
		float built = on * (1.0 - off);
		float fade = 1.0 - smoothstep(13.0, 24.0, length(vXZ));
		float k = vK * mix(0.4, 1.0, built) * fade * band(vXZ) * uOpacity;
		vec3 flo = vec3(0.557, 0.584, 0.910);
		vec3 avenida = mix(flo, vec3(0.133, 0.827, 0.933), 0.25);
		vec3 col = vK > 0.1 && vK < 0.2 ? avenida : flo;
		gl_FragColor = vec4(col, k);
	}
`;

export const PACKET_VS = /* glsl */ `
	${BAND}
	attribute float aLane;
	attribute float aAxis;
	attribute float aSpeed;
	attribute float aOff;
	attribute float aSeed;
	attribute float aTrail;
	uniform float uClock;
	uniform float uCycle;
	uniform float uPx;
	uniform float uOpacity;
	varying float vA;
	varying float vSeed;
	void main() {
		float dir = sign(aSpeed);
		float s = mod(aOff * 44.0 + aSpeed * uClock - dir * aTrail * 0.34, 44.0) - 22.0;
		vec3 pos = aAxis < 0.5 ? vec3(s, 0.05, aLane) : vec3(aLane, 0.05, s);
		float liveIn = smoothstep(5.5, 6.5, uCycle);
		float live = liveIn * (1.0 - smoothstep(12.8, 13.6, uCycle));
		float fade = 1.0 - smoothstep(13.0, 22.0, length(pos.xz));
		vA = live * fade * band(pos.xz) * (1.0 - aTrail * 0.30) * uOpacity;
		vSeed = aSeed;
		gl_PointSize = (3.2 + aSeed * 2.4) * (1.0 - aTrail * 0.2) * uPx;
		gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
	}
`;

export const PACKET_FS = /* glsl */ `
	varying float vA;
	varying float vSeed;
	void main() {
		float d = length(gl_PointCoord - 0.5);
		float soft = pow(smoothstep(0.5, 0.0, d), 1.6);
		vec3 cyan = vec3(0.35, 0.90, 1.0);
		vec3 violet = vec3(0.65, 0.55, 1.0);
		vec3 warm = vec3(1.0, 0.68, 0.38);
		vec3 col = vSeed > 0.96 ? warm : (vSeed > 0.62 ? cyan : violet);
		gl_FragColor = vec4(col, soft * vA);
	}
`;

export const CORE_VS = /* glsl */ `
	attribute float aSeed;
	uniform float uClock;
	uniform float uPx;
	varying float vA;
	varying float vSeed;
	void main() {
		vec3 pos = position;
		pos += 0.10 * vec3(
			sin(uClock * 0.9 + aSeed * 31.0),
			sin(uClock * 1.1 + aSeed * 17.0),
			sin(uClock * 0.8 + aSeed * 23.0)
		);
		vA = 0.55 + 0.45 * sin(uClock * 2.2 + aSeed * 50.0);
		vSeed = aSeed;
		gl_PointSize = (2.2 + aSeed * 3.4) * uPx;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
	}
`;

export const CORE_FS = /* glsl */ `
	varying float vA;
	varying float vSeed;
	void main() {
		float d = length(gl_PointCoord - 0.5);
		float soft = pow(smoothstep(0.5, 0.0, d), 1.4);
		vec3 cool = mix(vec3(0.45, 0.9, 1.0), vec3(0.8, 0.82, 1.0), vSeed);
		vec3 col = vSeed > 0.86 ? vec3(1.0, 0.72, 0.45) : cool;
		gl_FragColor = vec4(col, soft * vA);
	}
`;

export const BEAM_VS = /* glsl */ `
	uniform float uH;
	varying float vY;
	varying float vU;
	void main() {
		vY = position.y / uH;
		vU = uv.x;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

export const BEAM_FS = /* glsl */ `
	varying float vY;
	varying float vU;
	void main() {
		float f = fract(vU * 4.0);
		float corner = pow(abs(f - 0.5) * 2.0, 4.0);
		float down = pow(1.0 - vY, 1.6);
		float a = (0.045 + 0.16 * down) + 0.30 * corner * down;
		gl_FragColor = vec4(0.35, 0.75, 1.0, a);
	}
`;
