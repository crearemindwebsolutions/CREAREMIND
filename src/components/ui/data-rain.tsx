// component.tsx
import { useEffect, useRef } from "react";
import "../../index.css";

export interface DataRainPalette {
  calm: string;
  mid: string;
  hot: string;
}

export interface DataRainProps {
  className?: string;
  count?: number;
  flowSpeed?: number;
  obstacleRadius?: number;
  autopilot?: boolean;
  fullscreen?: boolean;
  palette?: DataRainPalette;
}

interface EngineApi {
  refresh: () => void;
}

type RGB = readonly [number, number, number];

/* ───────────────────────────── constants ───────────────────────────── */

const MAX = 4000; // optimized particle capacity for silky 120fps performance
const L = 14; // history points per particle for smooth trails
const TAU = Math.PI * 2;
const AGE_BUCKETS = 4;
const SEGS_PER_BUCKET = 3;

const DEFAULT_CALM: RGB = [34, 230, 255]; // cyan
const DEFAULT_MID: RGB = [138, 92, 255];  // violet
const DEFAULT_HOT: RGB = [255, 61, 154];  // pink
const DEFAULT_CORE: RGB = [234, 252, 255]; // white

const BASE_ALPHA = [0.22, 0.35, 0.5];
const BASE_WIDTH = [0.8, 1.0, 1.3];
const ALPHA_GAIN = 1.25;
const HEAD_WIDTH = 1.5;

/* ───────────────────────────── helpers ───────────────────────────── */

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseHex(input: string | undefined, fallback: RGB): RGB {
  if (!input) return fallback;
  let s = input.trim().replace(/^#/, "");
  if (s.length === 3) {
    s = s.charAt(0) + s.charAt(0) + s.charAt(1) + s.charAt(1) + s.charAt(2) + s.charAt(2);
  }
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return fallback;
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

interface Wave {
  kx: number;
  ky: number;
  om: number;
  ph: number;
  au: number;
  av: number;
}

function makeWave(lambda: number, angle: number, omega: number, phase: number, amp: number): Wave {
  const k = TAU / lambda;
  return {
    kx: k * Math.cos(angle),
    ky: k * Math.sin(angle),
    om: omega,
    ph: phase,
    au: amp * Math.sin(angle),
    av: -amp * Math.cos(angle),
  };
}

const WAVE_0 = makeWave(450, 0.35, 0.15, 0.7, 12);
const WAVE_1 = makeWave(700, 1.9, 0.22, 2.1, 9);
const WAVE_2 = makeWave(950, 3.4, 0.28, 4.2, 7);

/* ───────────────────────────── component ───────────────────────────── */

export default function DataRain(props: DataRainProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLCanvasElement | null>(null);
  const bloomRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef<DataRainProps>(props);
  const apiRef = useRef<EngineApi | null>(null);
  propsRef.current = props;

  useEffect(() => {
    const root = rootRef.current;
    const main = mainRef.current;
    const bloom = bloomRef.current;
    if (!root || !main || !bloom) return undefined;
    const ctx = main.getContext("2d", { alpha: true });
    const bctx = bloom.getContext("2d", { alpha: true });
    if (!ctx || !bctx) return undefined;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = mulberry32(11);

    let disposed = false;
    let initialised = false;
    let live = false;

    /* geometry */
    let w = 0;
    let h = 0;
    let dpr = 1;
    let bw = 1;
    let bh = 1;

    /* particles */
    const px = new Float32Array(MAX);
    const py = new Float32Array(MAX);
    const vx = new Float32Array(MAX);
    const vy = new Float32Array(MAX);
    const pz = new Float32Array(MAX);
    const v0 = new Float32Array(MAX);
    const qv = new Float32Array(MAX);
    const fire = new Float32Array(MAX);
    const len = new Uint8Array(MAX);
    const hx = new Float32Array(MAX * L);
    const hy = new Float32Array(MAX * L);
    let head = 0;

    /* render groups */
    const groupList: Int32Array[] = [];
    for (let g = 0; g < 6; g++) groupList.push(new Int32Array(MAX));
    const groupCount = new Int32Array(6);

    /* styles */
    const strokeStyles: string[] = new Array<string>(6 * AGE_BUCKETS).fill("");
    const strokeWidths = new Float32Array(6 * AGE_BUCKETS);
    const headStyles: string[] = ["", ""];
    let haloGradient: CanvasGradient | null = null;

    /* simulation state */
    let simTime = 0;
    let liveTime = 0;
    let active = 0;
    let targetCount = 0;

    /* input / cursor */
    let pointerActive = false;
    let pointerX = 0;
    let pointerY = 0;
    let idleSince = 0;
    const idleDelay = 2.0;
    let prevSrc = 0;
    let tgtX = 0;
    let tgtY = 0;
    let cx = 0;
    let cy = 0;
    let pcx = 0;
    let pcy = 0;
    let vcx = 0;
    let vcy = 0;
    let influence = 0;
    let curA = 48;

    /* loop */
    let raf = 0;
    let last = 0;

    /* ─────────────── styles & palette ─────────────── */

    const buildStyles = (): void => {
      const cs = getComputedStyle(root);
      const pal = propsRef.current.palette;
      const calm = parseHex(pal?.calm ?? cs.getPropertyValue("--dr-calm"), DEFAULT_CALM);
      const mid = parseHex(pal?.mid ?? cs.getPropertyValue("--dr-mid"), DEFAULT_MID);
      const hot = parseHex(pal?.hot ?? cs.getPropertyValue("--dr-hot"), DEFAULT_HOT);
      const core = parseHex(cs.getPropertyValue("--dr-core"), DEFAULT_CORE);
      const colours: RGB[] = [calm, mid, hot];

      for (let g = 0; g < 6; g++) {
        const depth = g < 3 ? 0 : 1;
        const bucket = g % 3;
        const c = colours[bucket];
        for (let ab = 0; ab < AGE_BUCKETS; ab++) {
          const falloff = Math.pow(1 - (ab + 0.5) / AGE_BUCKETS, 1.4);
          const alpha = Math.min(
            0.92,
            BASE_ALPHA[bucket] * (depth === 0 ? 0.6 : 1) * falloff * ALPHA_GAIN,
          );
          strokeStyles[g * AGE_BUCKETS + ab] = `rgba(${c[0]},${c[1]},${c[2]},${alpha.toFixed(3)})`;
          const width =
            BASE_WIDTH[bucket] * (depth === 0 ? 0.8 : 1) * (1 - (0.4 * ab) / AGE_BUCKETS);
          strokeWidths[g * AGE_BUCKETS + ab] = clamp(width, 0.7, 1.4);
        }
      }
      headStyles[0] = `rgba(${core[0]},${core[1]},${core[2]},0.55)`;
      headStyles[1] = `rgba(${core[0]},${core[1]},${core[2]},0.9)`;

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      grad.addColorStop(0, `rgba(${mid[0]},${mid[1]},${mid[2]},0.6)`);
      grad.addColorStop(0.5, `rgba(${calm[0]},${calm[1]},${calm[2]},0.2)`);
      grad.addColorStop(1, `rgba(${calm[0]},${calm[1]},${calm[2]},0)`);
      haloGradient = grad;
    };

    /* ─────────────── particles ─────────────── */

    const seedParticle = (i: number, uniform: boolean): void => {
      let x: number;
      let y: number;
      if (uniform) {
        x = rand() * w;
        y = rand() * h;
      } else {
        x = -40 + rand() * (w + 80);
        y = -40 - rand() * 80;
      }
      const z = 0.35 + 0.65 * rand();
      const nominal = 60 + 85 * z * z;
      const flow = clamp(propsRef.current.flowSpeed ?? 0.85, 0.05, 5);
      pz[i] = z;
      v0[i] = nominal;
      len[i] = 8 + Math.floor(rand() * 6);
      px[i] = x;
      py[i] = y;
      vx[i] = 0;
      vy[i] = nominal * flow;
      qv[i] = 1;
      fire[i] = 0;
      const base = i * L;
      for (let k = 0; k < L; k++) {
        hx[base + k] = x;
        hy[base + k] = y;
      }
    };

    const seedAll = (): void => {
      for (let i = 0; i < MAX; i++) seedParticle(i, true);
    };

    const setActive = (n: number, uniform: boolean): void => {
      const next = clamp(Math.round(n), 1, MAX);
      for (let i = active; i < next; i++) seedParticle(i, uniform);
      active = next;
    };

    const applyCount = (uniform: boolean): void => {
      const auto = clamp(Math.round((w * h) / 720), 1000, 2600);
      const requested = propsRef.current.count;
      targetCount = clamp(Math.round(requested !== undefined ? requested : auto), 1, MAX);
      setActive(targetCount, uniform);
    };

    /* ─────────────── smooth physics step ─────────────── */

    const simulate = (dt: number): void => {
      const p = propsRef.current;
      const flow = clamp(p.flowSpeed ?? 0.85, 0.05, 5);
      const obsR = clamp(p.obstacleRadius ?? 45, 16, 120);
      const autopilotOn = p.autopilot ?? true;

      // Rate scale relative to 60fps base step
      const stepScale = dt * 60;
      const kRelax = 1 - Math.exp(-dt / 0.14);
      const kQ = 1 - Math.exp(-dt * 6);
      const kCursor = 1 - Math.exp(-dt * 12);
      const kVel = 1 - Math.exp(-dt * 8);
      const kIn = 1 - Math.exp(-dt / 0.12);
      const kOut = 1 - Math.exp(-dt / 0.35);

      head = (head + 1) % L;
      simTime += dt;
      if (live) liveTime += dt;

      /* cursor source: real pointer > ghost > none */
      const ghostOn = !reduced && autopilotOn && !pointerActive && live && liveTime - idleSince >= idleDelay;
      const src = pointerActive ? 2 : ghostOn ? 1 : 0;
      if (src === 1) {
        // Slow, gentle, harmonic wander — never violent
        tgtX = w * (0.5 + 0.24 * Math.sin(0.22 * liveTime));
        tgtY = h * (0.5 + 0.18 * Math.sin(0.31 * liveTime + 0.8));
      } else if (src === 2) {
        tgtX = pointerX;
        tgtY = pointerY;
      }
      const snap = src !== 0 && prevSrc === 0 && influence < 0.05;
      prevSrc = src;

      if (snap) {
        cx = tgtX;
        cy = tgtY;
        pcx = cx;
        pcy = cy;
        vcx = 0;
        vcy = 0;
      } else {
        pcx = cx;
        pcy = cy;
        cx += (tgtX - cx) * kCursor;
        cy += (tgtY - cy) * kCursor;
        vcx += ((cx - pcx) / Math.max(0.001, dt) - vcx) * kVel;
        vcy += ((cy - pcy) / Math.max(0.001, dt) - vcy) * kVel;
      }

      /* smooth influence envelope */
      influence += ((src !== 0 ? 1 : 0) - influence) * (src !== 0 ? kIn : kOut);
      const infl = influence;

      const vcMag = Math.sqrt(vcx * vcx + vcy * vcy);
      const a = obsR + Math.min(vcMag * 0.015, 20);
      curA = a;

      /* sway phases */
      const ph0 = WAVE_0.om * simTime + WAVE_0.ph;
      const ph1 = WAVE_1.om * simTime + WAVE_1.ph;
      const ph2 = WAVE_2.om * simTime + WAVE_2.ph;
      const k0x = WAVE_0.kx;
      const k0y = WAVE_0.ky;
      const k1x = WAVE_1.kx;
      const k1y = WAVE_1.ky;
      const k2x = WAVE_2.kx;
      const k2y = WAVE_2.ky;
      const a0u = WAVE_0.au;
      const a0v = WAVE_0.av;
      const a1u = WAVE_1.au;
      const a1v = WAVE_1.av;
      const a2u = WAVE_2.au;
      const a2v = WAVE_2.av;

      const obsOn = infl > 0.005;
      const respawnBottom = h + 40;
      const respawnRight = w + 80;

      for (let i = 0; i < active; i++) {
        const x0 = px[i];
        const y0 = py[i];
        const z = pz[i];
        const v0e = v0[i] * flow;

        /* base + smooth laminar sway */
        const c0 = Math.cos(k0x * x0 + k0y * y0 + ph0);
        const c1 = Math.cos(k1x * x0 + k1y * y0 + ph1);
        const c2 = Math.cos(k2x * x0 + k2y * y0 + ph2);
        let tx = (a0u * c0 + a1u * c1 + a2u * c2) * z;
        let ty = v0e + (a0v * c0 + a1v * c1 + a2v * c2) * z;

        const zf = 0.55 + 0.45 * z;
        const aE = a * zf;
        const rx = x0 - cx;
        const ry = y0 - cy;

        let pertX = 0;
        let pertY = 0;

        /* Smooth, organic potential flow without harsh clamping or knot formation */
        if (obsOn) {
          const d2 = rx * rx + ry * ry;
          const outerR = 3.5 * aE;
          if (d2 < outerR * outerR) {
            const dist = Math.sqrt(d2) + 0.001;
            // Smooth cubic bell curve falloff (Hermite interpolation)
            const t = clamp(dist / outerR, 0, 1);
            const falloff = (1 - t) * (1 - t) * (1 + 2 * t);
            
            // Deflect gently away from obstacle center along radial direction with smooth tangential glide
            const nx = rx / dist;
            const ny = ry / dist;
            const push = falloff * 75 * infl;
            
            // Soft streamline separation (horizontal push dominates so rain gracefully parts around obstacle)
            pertX = nx * push * 1.4;
            pertY = ny * push * 0.4;
          }
        }

        tx = tx + pertX;
        ty = ty + pertY;

        /* smooth inertia */
        let ux = vx[i] + (tx - vx[i]) * kRelax;
        let uy = vy[i] + (ty - vy[i]) * kRelax;
        
        // Gentle speed cap
        const sp2 = ux * ux + uy * uy;
        if (sp2 > 360000) {
          const sc = 600 / Math.sqrt(sp2);
          ux *= sc;
          uy *= sc;
        }

        let x = x0 + ux * dt;
        let y = y0 + uy * dt;

        vx[i] = ux;
        vy[i] = uy;
        px[i] = x;
        py[i] = y;

        /* respawn */
        if (y > respawnBottom || x < -80 || x > respawnRight || y < -400) {
          seedParticle(i, false);
          continue;
        }

        /* smoothed speed ratio */
        qv[i] += (Math.sqrt(ux * ux + uy * uy) / v0e - qv[i]) * kQ;

        /* subtle synaptic glow */
        if (rand() < 0.0008 * stepScale) {
          fire[i] = 1;
        } else {
          fire[i] = Math.max(0, fire[i] - 0.035 * stepScale);
        }

        const slot = i * L + head;
        hx[slot] = x;
        hy[slot] = y;
      }
    };

    /* ─────────────── rendering ─────────────── */

    const render = (): void => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      /* gentle, subtle cursor halo */
      if (influence > 0.05 && haloGradient) {
        const r = 1.3 * curA;
        ctx.globalAlpha = Math.min(0.25, 0.18 * influence);
        ctx.setTransform(dpr * r, 0, 0, dpr * r, dpr * cx, dpr * cy);
        ctx.fillStyle = haloGradient;
        ctx.fillRect(-1, -1, 2, 2);
        ctx.globalAlpha = 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      /* classify particles into depth and energy tiers */
      groupCount.fill(0);
      for (let i = 0; i < active; i++) {
        const qq = qv[i];
        let b = qq < 1.15 ? 0 : qq < 1.6 ? 1 : 2;
        if (fire[i] > 0.4 && b < 2) b++;
        const g = (pz[i] < 0.62 ? 0 : 3) + b;
        groupList[g][groupCount[g]++] = i;
      }

      /* draw smooth gradient trails */
      for (let g = 0; g < 6; g++) {
        const cnt = groupCount[g];
        if (cnt === 0) continue;
        const list = groupList[g];
        for (let ab = 0; ab < AGE_BUCKETS; ab++) {
          const k0 = ab * SEGS_PER_BUCKET;
          const k1 = k0 + SEGS_PER_BUCKET;
          ctx.strokeStyle = strokeStyles[g * AGE_BUCKETS + ab];
          ctx.lineWidth = strokeWidths[g * AGE_BUCKETS + ab];
          ctx.beginPath();
          for (let j = 0; j < cnt; j++) {
            const i = list[j];
            const segs = len[i] - 1;
            if (k0 >= segs) continue;
            const base = i * L;
            const kEnd = Math.min(k1, segs);
            let idx = (head - k0 + L) % L;
            ctx.moveTo(hx[base + idx], hy[base + idx]);
            for (let k = k0; k < kEnd; k++) {
              idx = idx === 0 ? L - 1 : idx - 1;
              ctx.lineTo(hx[base + idx], hy[base + idx]);
            }
          }
          ctx.stroke();
        }
      }

      /* luminous head sparks */
      const prevHead = head === 0 ? L - 1 : head - 1;
      ctx.lineWidth = HEAD_WIDTH;
      for (let depth = 0; depth < 2; depth++) {
        ctx.strokeStyle = headStyles[depth];
        ctx.beginPath();
        for (let b = 1; b < 3; b++) {
          const g = depth * 3 + b;
          const cnt = groupCount[g];
          const list = groupList[g];
          for (let j = 0; j < cnt; j++) {
            const i = list[j];
            if (b === 1 && fire[i] <= 0.4) continue;
            const base = i * L;
            ctx.moveTo(hx[base + head], hy[base + head]);
            ctx.lineTo(hx[base + prevHead], hy[base + prevHead]);
          }
        }
        ctx.stroke();
      }

      /* bloom reflection */
      bctx.clearRect(0, 0, bw, bh);
      bctx.drawImage(main, 0, 0, bw, bh);
    };

    /* ─────────────── lifecycle helpers ─────────────── */

    const presim = (seconds: number): void => {
      const step = 1 / 60;
      const n = Math.round(seconds / step);
      for (let s = 0; s < n; s++) simulate(step);
    };

    const rebuildStatic = (): void => {
      seedAll();
      active = 0;
      applyCount(true);
      pointerActive = true;
      pointerX = w * 0.5;
      pointerY = h * 0.5;
      tgtX = pointerX;
      tgtY = pointerY;
      cx = pcx = pointerX;
      cy = pcy = pointerY;
      vcx = 0;
      vcy = 0;
      influence = 0.5;
      prevSrc = 2;
      presim(2);
      render();
    };

    const resize = (): void => {
      const rect = root.getBoundingClientRect();
      const nw = Math.max(1, rect.width || window.innerWidth);
      const nh = Math.max(1, rect.height || window.innerHeight);
      let d = Math.min(window.devicePixelRatio || 1, 2);
      if (nw * nh * d * d > 4.5e6) d = Math.sqrt(4.5e6 / (nw * nh));
      if (nw === w && nh === h && d === dpr) return;

      w = nw;
      h = nh;
      dpr = d;
      main.width = Math.max(1, Math.round(w * dpr));
      main.height = Math.max(1, Math.round(h * dpr));
      bw = Math.max(1, Math.ceil(w / 4));
      bh = Math.max(1, Math.ceil(h / 4));
      bloom.width = bw;
      bloom.height = bh;
      bctx.imageSmoothingEnabled = true;
      bctx.imageSmoothingQuality = "medium";

      if (!initialised) return;

      if (reduced) {
        rebuildStatic();
        return;
      }
      for (let i = 0; i < active; i++) {
        if (px[i] < -80 || px[i] > w + 80 || py[i] > h + 40) seedParticle(i, false);
      }
      applyCount(true);
      render();
    };

    /* ─────────────── input containment ─────────────── */

    const onMove = (e: PointerEvent): void => {
      const r = root.getBoundingClientRect();
      // Check if pointer is within or near the element bounds
      const insideX = e.clientX >= r.left - 20 && e.clientX <= r.right + 20;
      const insideY = e.clientY >= r.top - 20 && e.clientY <= r.bottom + 20;
      if (insideX && insideY) {
        pointerX = e.clientX - r.left;
        pointerY = e.clientY - r.top;
        pointerActive = true;
      } else if (pointerActive) {
        pointerActive = false;
        idleSince = liveTime;
      }
    };

    const onLeave = (): void => {
      if (!pointerActive) return;
      pointerActive = false;
      idleSince = liveTime;
    };

    /* ─────────────── frame-rate agnostic smooth loop ─────────────── */

    const frame = (now: number): void => {
      if (disposed) return;
      if (last === 0) last = now;
      const dtRaw = (now - last) / 1000;
      last = now;

      // Clamp delta time to avoid jumps on tab switch / lag spikes
      const dt = clamp(dtRaw, 0.001, 0.033);

      simulate(dt);
      render();

      raf = requestAnimationFrame(frame);
    };

    const start = (): void => {
      cancelAnimationFrame(raf);
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    let isVisible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = !!entry?.isIntersecting;
        if (!isVisible) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else if (live && !disposed && !document.hidden && raf === 0) {
          start();
        }
      },
      { rootMargin: "100px" }
    );

    const onVisibility = (): void => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (live && !disposed && isVisible && raf === 0) {
        start();
      }
    };

    /* ─────────────── init ─────────────── */

    resize();
    buildStyles();
    seedAll();
    applyCount(true);
    cx = pcx = tgtX = w * 0.5;
    cy = pcy = tgtY = h * 0.5;

    const ro = new ResizeObserver(() => resize());
    ro.observe(root);

    apiRef.current = {
      refresh: () => {
        if (disposed || !initialised) return;
        buildStyles();
        if (reduced) {
          rebuildStatic();
        } else {
          applyCount(false);
        }
      },
    };

    if (reduced) {
      initialised = true;
      rebuildStatic();
    } else {
      presim(2);
      render();
      initialised = true;
      live = true;
      io.observe(root);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onMove, { passive: true });
      window.addEventListener("pointerup", onLeave, { passive: true });
      window.addEventListener("pointercancel", onLeave, { passive: true });
      window.addEventListener("blur", onLeave);
      document.addEventListener("visibilitychange", onVisibility);
      start();
    }

    return () => {
      disposed = true;
      live = false;
      cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onLeave);
      window.removeEventListener("pointercancel", onLeave);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      apiRef.current = null;
      haloGradient = null;
    };
  }, []);

  const palette = props.palette;
  useEffect(() => {
    apiRef.current?.refresh();
  }, [props.count, palette?.calm, palette?.mid, palette?.hot]);

  const fullscreen = props.fullscreen ?? true;
  const cls =
    "dr-root" + (fullscreen ? "" : " dr-root--contained") + (props.className ? " " + props.className : "");

  return (
    <div ref={rootRef} className={cls} aria-hidden="true">
      <canvas ref={bloomRef} className="dr-bloom" />
      <canvas ref={mainRef} className="dr-main" />
      <div className="dr-vignette" />
      <div className="dr-grain" />
    </div>
  );
}
