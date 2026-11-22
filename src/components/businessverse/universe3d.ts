import * as THREE from 'three';
import gsap from 'gsap';
import type { CareerWorld, WorldMotif } from '../../data/careerWorlds';
import { audioEngine } from '../../utils/audioEngine';

/**
 * The Businessverse in WebGL: five career worlds on an arc, linked to a
 * central nexus. Each world has its own orbiting motif so it reads as a
 * distinct place. Lightweight by design — primitive geometry, two tiny
 * shaders, no textures or models, capped pixel ratio.
 *
 * Focus: 0 = overview, 1..5 = a world, 6 = closing pull-back.
 */

const STAGE_W = 1920;
const STAGE_H = 1080;
const IMS_BLUE = new THREE.Color('#0481FE');

const planetVert = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying vec3 vP;
  void main() {
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vV = -mv.xyz;
    vP = position;
    gl_Position = projectionMatrix * mv;
  }`;

const planetFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uTime;
  varying vec3 vN; varying vec3 vV; varying vec3 vP;
  void main() {
    vec3 n = normalize(vN);
    float fres = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 2.2);
    float bands = 0.5 + 0.5 * sin(vP.y * 5.0 + uTime * 0.5 + sin(vP.x * 2.6 + uTime * 0.2) * 1.6);
    float light = 0.35 + 0.65 * max(dot(n, normalize(vec3(-0.5, 0.6, 0.6))), 0.0);
    vec3 base = mix(vec3(0.02, 0.03, 0.08), uColor * 0.55, (0.18 + 0.32 * bands) * light);
    gl_FragColor = vec4(base + uColor * fres * 1.5, 1.0);
  }`;

const glowVert = /* glsl */ `
  varying float vI;
  uniform float uPower;
  void main() {
    vec3 n = normalize(normalMatrix * normal);
    // Rendered on back faces: strongest near the planet, fading to zero at the rim.
    vI = pow(max(0.0, -n.z), uPower);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

const glowFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uStrength;
  varying float vI;
  void main() {
    vec3 c = uColor * vI * uStrength;
    // Alpha must track brightness: the canvas is transparent over the DOM backdrop.
    gl_FragColor = vec4(c, clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0));
  }`;

const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** World positions on a shallow arc facing the camera. */
const WORLD_POS = [0, 1, 2, 3, 4].map((i) => {
  const o = i - 2;
  return new THREE.Vector3(o * 6.6, Math.sin(i * 1.7) * 0.6, -o * o * 1.1);
});
const NEXUS_POS = new THREE.Vector3(0, 2.6, -15);

interface Shot {
  pos: THREE.Vector3;
  look: THREE.Vector3;
}

const SHOTS: Shot[] = [
  { pos: new THREE.Vector3(0, 3.2, 24), look: new THREE.Vector3(0, 1.4, -2) },
  ...WORLD_POS.map((p) => ({
    pos: p.clone().add(new THREE.Vector3(3.1, 0.8, 9.4)),
    look: p.clone().add(new THREE.Vector3(3.1, 0.1, 0)),
  })),
  { pos: new THREE.Vector3(0, 6.5, 33), look: new THREE.Vector3(0, 5.6, -3) },
];

export interface LabelSink {
  (positions: { x: number; y: number; visible: boolean }[]): void;
}

export class Universe {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(45, STAGE_W / STAGE_H, 0.1, 200);
  private look = new THREE.Vector3();
  private worlds: THREE.Group[] = [];
  /** `world` ties a spinner to a world so focusing it can speed that motif up (-1 = scenery). */
  private spinners: { obj: THREE.Object3D; axis: 'x' | 'y' | 'z'; speed: number; world?: number }[] = [];
  private motifs: THREE.Group[] = [];
  /** Extra spin per world, kicked up when a world is focused and decaying back to 0. */
  private boost = [0, 0, 0, 0, 0];
  /** Camera position before idle drift is added; GSAP tweens this between shots. */
  private basePos = new THREE.Vector3();
  private driftT = 0;
  private tmp2 = new THREE.Vector3();
  private planetMats: THREE.ShaderMaterial[] = [];
  private links: THREE.LineBasicMaterial[] = [];
  private clock = new THREE.Clock();
  private raf = 0;
  private paused = false;
  private focus = -1;
  private camTween: gsap.core.Timeline | null = null;
  private tmp = new THREE.Vector3();
  private disposables: { dispose: () => void }[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    worlds: CareerWorld[],
    private onLabels: LabelSink,
    private reducedMotion: boolean,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(STAGE_W, STAGE_H, false);
    this.resize();

    // Arrive from deep space.
    this.basePos.set(0, 1.5, 70);
    this.camera.position.copy(this.basePos);
    this.look.copy(SHOTS[0].look);
    this.camera.lookAt(this.look);

    this.buildNexus();
    worlds.forEach((w, i) => this.buildWorld(w, i));
    this.buildDust();

    window.addEventListener('resize', this.resize);
    this.raf = requestAnimationFrame(this.frame);
  }

  /** Render at the real display resolution, not the 1920×1080 stage size. */
  resize = () => {
    const stageScale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    const ratio = Math.min(stageScale * (window.devicePixelRatio || 1), 1.75);
    this.renderer.setPixelRatio(Math.max(0.5, ratio));
    this.renderer.setSize(STAGE_W, STAGE_H, false);
  };

  private track<T extends { dispose: () => void }>(item: T): T {
    this.disposables.push(item);
    return item;
  }

  private glow(radius: number, color: THREE.Color, strength = 1.2, power = 3) {
    const mat = this.track(
      new THREE.ShaderMaterial({
        vertexShader: glowVert,
        fragmentShader: glowFrag,
        uniforms: { uColor: { value: color }, uStrength: { value: strength }, uPower: { value: power } },
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    );
    return new THREE.Mesh(this.track(new THREE.SphereGeometry(radius, 48, 32)), mat);
  }

  private buildNexus() {
    const core = new THREE.Mesh(
      this.track(new THREE.SphereGeometry(0.6, 48, 32)),
      this.track(new THREE.MeshBasicMaterial({ color: new THREE.Color('#dfe9ff') })),
    );
    core.position.copy(NEXUS_POS);
    const halo = this.glow(2.2, IMS_BLUE.clone(), 2.4, 1.8);
    halo.position.copy(NEXUS_POS);
    const halo2 = this.glow(3.6, new THREE.Color('#7657F6'), 1.1, 3);
    halo2.position.copy(NEXUS_POS);
    this.scene.add(core, halo, halo2);

    // Orbit ring around the nexus.
    const ring = new THREE.Mesh(
      this.track(new THREE.TorusGeometry(2.6, 0.015, 8, 160)),
      this.track(new THREE.MeshBasicMaterial({ color: IMS_BLUE, transparent: true, opacity: 0.6 })),
    );
    ring.position.copy(NEXUS_POS);
    ring.rotation.x = Math.PI / 2.3;
    this.scene.add(ring);
    this.spinners.push({ obj: ring, axis: 'z', speed: 0.15 });
  }

  private buildWorld(world: CareerWorld, i: number) {
    const color = new THREE.Color(world.accent);
    const group = new THREE.Group();
    group.position.copy(WORLD_POS[i]);
    // Worlds start collapsed and arrive one by one in intro().
    group.scale.setScalar(this.reducedMotion ? 1 : 0.001);

    const mat = this.track(
      new THREE.ShaderMaterial({
        vertexShader: planetVert,
        fragmentShader: planetFrag,
        uniforms: { uColor: { value: color }, uTime: { value: rand(i) * 10 } },
      }),
    );
    this.planetMats.push(mat);
    const planet = new THREE.Mesh(this.track(new THREE.SphereGeometry(1.5, 64, 48)), mat);
    group.add(planet, this.glow(2.05, color.clone(), 2.2, 2.5));

    const spinnersBefore = this.spinners.length;
    const motif = this.buildMotif(world.id, color, i);
    this.spinners.slice(spinnersBefore).forEach((sp) => (sp.world = i));
    this.motifs.push(motif);
    motif.rotation.z = (rand(i + 9) - 0.5) * 0.5;
    group.add(motif);
    this.scene.add(group);
    this.worlds.push(group);

    // Link from the nexus to this world.
    const linkMat = this.track(new THREE.LineBasicMaterial({ color, transparent: true, opacity: this.reducedMotion ? 0.3 : 0 }));
    this.links.push(linkMat);
    const mid = NEXUS_POS.clone().lerp(WORLD_POS[i], 0.5).add(new THREE.Vector3(0, 1.6, 0));
    const curve = new THREE.QuadraticBezierCurve3(NEXUS_POS, mid, WORLD_POS[i]);
    const line = new THREE.Line(this.track(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48))), linkMat);
    this.scene.add(line);
  }

  private basic(color: THREE.Color, opacity = 1, wireframe = false) {
    return this.track(new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, wireframe }));
  }

  private buildMotif(id: WorldMotif, color: THREE.Color, seed: number): THREE.Group {
    const g = new THREE.Group();
    switch (id) {
      case 'finance': {
        // A ring of rising bar-chart columns, like a market dashboard in orbit.
        const ring = new THREE.Group();
        const box = this.track(new THREE.BoxGeometry(0.13, 1, 0.13));
        const mat = this.basic(color, 0.85);
        const count = 22;
        for (let k = 0; k < count; k++) {
          const a = (k / count) * Math.PI * 2;
          const h = 0.25 + (0.5 + 0.5 * Math.sin(k * 0.9)) * 0.9 + rand(seed * 40 + k) * 0.4;
          const bar = new THREE.Mesh(box, mat);
          bar.scale.y = h;
          bar.position.set(Math.cos(a) * 2.45, h / 2 - 0.3, Math.sin(a) * 2.45);
          ring.add(bar);
        }
        // Thin trend line hovering above the bars.
        const pts = Array.from({ length: 90 }, (_, k) => {
          const a = (k / 89) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(a) * 2.45, 1.25 + Math.sin(a * 5) * 0.18 + Math.sin(a * 2) * 0.12, Math.sin(a) * 2.45);
        });
        ring.add(new THREE.Line(this.track(new THREE.BufferGeometry().setFromPoints(pts)), this.track(new THREE.LineBasicMaterial({ color: new THREE.Color('#FFE2B3') }))));
        ring.rotation.x = 0.35;
        g.add(ring);
        this.spinners.push({ obj: ring, axis: 'y', speed: 0.25 });
        break;
      }
      case 'strategy': {
        // A lattice of connected decision nodes.
        const geo = this.track(new THREE.IcosahedronGeometry(2.45, 1));
        const edges = new THREE.LineSegments(this.track(new THREE.EdgesGeometry(geo)), this.track(new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 })));
        const nodes = new THREE.Points(geo, this.track(new THREE.PointsMaterial({ color: new THREE.Color('#ffffff'), size: 0.12, sizeAttenuation: true })));
        const lattice = new THREE.Group();
        lattice.add(edges, nodes);
        g.add(lattice);
        this.spinners.push({ obj: lattice, axis: 'y', speed: 0.12 }, { obj: lattice, axis: 'x', speed: 0.05 });
        break;
      }
      case 'marketing': {
        // Crossing orbits with "brand bubbles" travelling along them.
        [0.4, -0.7, 1.3].forEach((tilt, k) => {
          const orbit = new THREE.Group();
          orbit.rotation.set(tilt, k * 0.8, tilt * 0.5);
          const r = 2.2 + k * 0.28;
          orbit.add(new THREE.Mesh(this.track(new THREE.TorusGeometry(r, 0.018, 8, 140)), this.basic(color, 0.7)));
          const bubble = new THREE.Mesh(this.track(new THREE.SphereGeometry(0.16 + k * 0.05, 24, 16)), this.basic(k === 1 ? new THREE.Color('#ffffff') : color));
          bubble.position.set(r, 0, 0);
          orbit.add(bubble);
          g.add(orbit);
          this.spinners.push({ obj: orbit, axis: 'z', speed: 0.35 + k * 0.12 });
        });
        break;
      }
      case 'innovation': {
        // Building blocks spiralling upward — an idea being assembled.
        const helix = new THREE.Group();
        const count = 30;
        const box = this.track(new THREE.BoxGeometry(1, 1, 1));
        for (let k = 0; k < count; k++) {
          const t = k / (count - 1);
          const a = t * Math.PI * 4;
          const s = 0.1 + t * 0.2;
          const cube = new THREE.Mesh(box, this.basic(k % 4 === 0 ? new THREE.Color('#ffffff') : color, k % 4 === 0 ? 1 : 0.85, k % 3 === 1));
          cube.scale.setScalar(s);
          cube.position.set(Math.cos(a) * 2.35, -1.8 + t * 3.6, Math.sin(a) * 2.35);
          cube.rotation.set(t * 3, t * 5, 0);
          helix.add(cube);
        }
        g.add(helix);
        this.spinners.push({ obj: helix, axis: 'y', speed: 0.3 });
        break;
      }
      case 'technology': {
        // A wireframe data shell and a cloud of data points.
        const shell = new THREE.Mesh(this.track(new THREE.SphereGeometry(2.25, 28, 18)), this.basic(color, 0.16, true));
        const count = 260;
        const pos = new Float32Array(count * 3);
        for (let k = 0; k < count; k++) {
          const u = rand(seed * 100 + k) * 2 - 1;
          const th = rand(seed * 200 + k) * Math.PI * 2;
          const r = 2.6 + rand(seed * 300 + k) * 0.7;
          const s = Math.sqrt(1 - u * u);
          pos.set([Math.cos(th) * s * r, u * r * 0.7, Math.sin(th) * s * r], k * 3);
        }
        const cloudGeo = this.track(new THREE.BufferGeometry());
        cloudGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const cloud = new THREE.Points(cloudGeo, this.track(new THREE.PointsMaterial({ color, size: 0.07 })));
        g.add(shell, cloud);
        this.spinners.push({ obj: shell, axis: 'y', speed: -0.15 }, { obj: cloud, axis: 'y', speed: 0.2 });
        break;
      }
    }
    return g;
  }

  private buildDust() {
    const count = 700;
    const pos = new Float32Array(count * 3);
    for (let k = 0; k < count; k++) {
      pos.set([(rand(k) - 0.5) * 70, (rand(k + 1000) - 0.5) * 30, -rand(k + 2000) * 50 + 8], k * 3);
    }
    const geo = this.track(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(geo, this.track(new THREE.PointsMaterial({ color: new THREE.Color('#a9b6ff'), size: 0.06, transparent: true, opacity: 0.6 })));
    this.scene.add(dust);
    this.spinners.push({ obj: dust, axis: 'y', speed: 0.004 });
  }

  /** Worlds arrive one at a time with a pop, and their links to the nexus light up. */
  private intro() {
    if (this.reducedMotion) return;
    this.worlds.forEach((w, i) => {
      const at = 1.3 + i * 0.42;
      gsap.to(w.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.1,
        delay: at,
        ease: 'back.out(1.8)',
        onStart: () => audioEngine.play('pop'),
      });
      gsap.to(this.links[i], { opacity: 0.3, duration: 1.2, delay: at + 0.3 });
    });
  }

  setFocus(index: number) {
    if (index === this.focus) return;
    const first = this.focus === -1;
    this.focus = index;
    const shot = SHOTS[Math.max(0, Math.min(SHOTS.length - 1, index))];
    this.camTween?.kill();
    const duration = this.reducedMotion ? 0.01 : first ? 3.2 : 2.1;
    const ease = first ? 'power3.out' : 'power2.inOut';
    this.camTween = gsap
      .timeline({ paused: this.paused })
      .to(this.basePos, { x: shot.pos.x, y: shot.pos.y, z: shot.pos.z, duration, ease }, 0)
      .to(this.look, { x: shot.look.x, y: shot.look.y, z: shot.look.z, duration, ease }, 0);
    if (first) {
      this.intro();
      return;
    }
    this.links.forEach((m) => gsap.to(m, { opacity: index === 6 ? 0.7 : index === 0 ? 0.3 : 0.12, duration: 1.2 }));
    // The focused world stays full size; the others recede so the eye stays on one place.
    this.worlds.forEach((w, i) => {
      const s = index >= 1 && index <= 5 && index - 1 !== i ? 0.5 : 1;
      gsap.to(w.scale, { x: s, y: s, z: s, duration: this.reducedMotion ? 0.01 : 1.6, ease: 'power2.inOut', overwrite: 'auto' });
    });
    // The focused world comes alive: its motif bursts outward and spins up, then settles.
    const k = index - 1;
    if (k >= 0 && k < this.motifs.length && !this.reducedMotion) {
      gsap.fromTo(this.motifs[k].scale, { x: 0.55, y: 0.55, z: 0.55 }, { x: 1, y: 1, z: 1, duration: 1.8, delay: 1.2, ease: 'elastic.out(1, 0.45)' });
      gsap.fromTo(this.boost, { [k]: 6 }, { [k]: 0, duration: 4.5, delay: 1.2, ease: 'power2.out' });
    }
    if (index === 6 && !this.reducedMotion) {
      // Closing: every world gets one last spin as the links light up.
      this.motifs.forEach((_, i) => gsap.fromTo(this.boost, { [i]: 4 }, { [i]: 0, duration: 4, delay: 0.6 + i * 0.12, ease: 'power2.out' }));
    }
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (paused) this.camTween?.pause();
    else this.camTween?.resume();
  }

  private frame = () => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (document.hidden) return;
    const motion = this.paused ? 0 : this.reducedMotion ? 0.15 : 1;
    for (const s of this.spinners) s.obj.rotation[s.axis] += s.speed * dt * motion * (1 + (s.world !== undefined ? this.boost[s.world] : 0));
    for (const m of this.planetMats) m.uniforms.uTime.value += dt * motion;
    this.worlds.forEach((w, i) => {
      w.position.y = WORLD_POS[i].y + Math.sin(this.clock.elapsedTime * 0.5 + i) * 0.12 * motion;
    });
    // Idle drift: a slow orbit around whatever the camera is looking at, so a held shot is never a still frame.
    this.driftT += dt * motion;
    const amp = this.focus >= 1 && this.focus <= 5 ? 0.2 : 0.09;
    const angle = Math.sin(this.driftT * 0.11) * amp;
    this.tmp2.copy(this.basePos).sub(this.look).applyAxisAngle(THREE.Object3D.DEFAULT_UP, angle);
    this.camera.position.copy(this.look).add(this.tmp2);
    this.camera.position.y += Math.sin(this.driftT * 0.17) * 0.25;
    this.camera.lookAt(this.look);
    this.renderer.render(this.scene, this.camera);

    this.onLabels(
      this.worlds.map((w) => {
        this.tmp.copy(w.position).add(new THREE.Vector3(0, -2.25, 0)).project(this.camera);
        return {
          x: (this.tmp.x * 0.5 + 0.5) * STAGE_W,
          y: (-this.tmp.y * 0.5 + 0.5) * STAGE_H,
          visible: this.tmp.z < 1,
        };
      }),
    );
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    this.camTween?.kill();
    this.links.forEach((m) => gsap.killTweensOf(m));
    this.worlds.forEach((w) => gsap.killTweensOf(w.scale));
    this.motifs.forEach((m) => gsap.killTweensOf(m.scale));
    gsap.killTweensOf(this.boost);
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
  }
}
