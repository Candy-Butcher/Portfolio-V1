'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(InertiaPlugin);

/* ---------------- utils ---------------- */
const throttle = (fn: (...args: any[]) => void, limit: number) => {
  let last = 0;
  return function (this: any, ...args: any[]) {
    const now = performance.now();
    if (now - last >= limit) {
      last = now;
      fn.apply(this, args);
    }
  };
};

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  _inertiaApplied: boolean;
}

export interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;   // hex or rgba()
  activeColor?: string; // hex or rgba()
  proximity?: number;
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  resistance?: number;
  returnDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

/* ---- color parsing (safe for noUncheckedIndexedAccess) ---- */
function parseColor(input: string): { r: number; g: number; b: number; a: number } {
  const s = (input ?? '').trim();

  if (s.startsWith('#')) {
    let h = s.slice(1);

    // #RGB -> #RRGGBB
    if (h.length === 3) {
      const r = h.charAt(0);
      const g = h.charAt(1);
      const b = h.charAt(2);
      h = r + r + g + g + b + b;
    }

    // #RGBA -> #RRGGBBAA
    if (h.length === 4) {
      const r = h.charAt(0);
      const g = h.charAt(1);
      const b = h.charAt(2);
      const a = h.charAt(3);
      h = r + r + g + g + b + b + a + a;
    }

    if (h.length === 6 || h.length === 8) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
      return { r, g, b, a };
    }
  }

  const m = s.match(/rgba?\(([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\)/i);
  if (m) {
    const r = Number(m[1] ?? 0);
    const g = Number(m[2] ?? 0);
    const b = Number(m[3] ?? 0);
    const a = m[4] !== undefined ? Number(m[4]) : 1;
    return { r, g, b, a };
  }

  // Fallback
  return { r: 0, g: 0, b: 0, a: 1 };
}
const rgba = (c: { r: number; g: number; b: number; a: number }) =>
  `rgba(${c.r},${c.g},${c.b},${c.a})`;

/* ---------------- component ---------------- */
const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 16,
  gap = 32,
  baseColor = '#2d2828ff',
  activeColor = '#ac13ffff',
  proximity = 150,
  speedTrigger = 100,
  shockRadius = 250,
  shockStrength = 5,
  maxSpeed = 5000,
  resistance = 750,
  returnDuration = 1.5,
  className = '',
  style
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathRef = useRef<Path2D | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, speed: 0, lastTime: 0, lastX: 0, lastY: 0 });

  const base = parseColor(baseColor);
  const active = parseColor(activeColor);

  /* Build circle Path2D on client */
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).Path2D) {
      pathRef.current = null;
      return;
    }
    const p = new Path2D();
    p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    pathRef.current = p;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const rect = wrap.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cell = dotSize + gap;
    const cols = Math.max(1, Math.floor((width + gap) / cell));
    const rows = Math.max(1, Math.floor((height + gap) / cell));

    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;
    const startX = (width - gridW) / 2 + dotSize / 2;
    const startY = (height - gridH) / 2 + dotSize / 2;

    const dots: Dot[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        dots.push({ cx: startX + x * cell, cy: startY + y * cell, xOffset: 0, yOffset: 0, _inertiaApplied: false });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  /* Draw loop */
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    let rafId = 0;
    const proxSq = proximity * proximity;
    const baseStr = rgba(base);

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
      if (!ctx) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: px, y: py } = pointerRef.current;
      for (const dot of dotsRef.current) {
        const ox = dot.cx + dot.xOffset;
        const oy = dot.cy + dot.yOffset;

        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dsq = dx * dx + dy * dy;

        if (dsq <= proxSq) {
          const dist = Math.sqrt(dsq);
          const t = Math.max(0, Math.min(1, 1 - dist / proximity));
          const c = {
            r: Math.round(base.r + (active.r - base.r) * t),
            g: Math.round(base.g + (active.g - base.g) * t),
            b: Math.round(base.b + (active.b - base.b) * t),
            a: base.a + (active.a - base.a) * t
          };
          ctx.fillStyle = rgba(c);
        } else {
          ctx.fillStyle = baseStr;
        }

        ctx.save();
        ctx.translate(ox, oy);
        ctx.fill(path);
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [proximity, base, active]);

  /* Build grid + resize */
  useEffect(() => {
    buildGrid();
    if (typeof window === 'undefined') return;

    const ro = 'ResizeObserver' in window ? new ResizeObserver(() => buildGrid()) : null;
    if (ro && wrapperRef.current) ro.observe(wrapperRef.current);

    const onResize = () => buildGrid();
    window.addEventListener('resize', onResize);

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [buildGrid]);

  /* Interactions */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const pr = pointerRef.current;
      const dt = pr.lastTime ? now - pr.lastTime : 16;
      const dx = e.clientX - pr.lastX;
      const dy = e.clientY - pr.lastY;

      let vx = (dx / dt) * 1000;
      let vy = (dy / dt) * 1000;
      let speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        const s = maxSpeed / speed;
        vx *= s;
        vy *= s;
        speed = maxSpeed;
      }

      pr.lastTime = now;
      pr.lastX = e.clientX;
      pr.lastY = e.clientY;
      pr.vx = vx;
      pr.vy = vy;
      pr.speed = speed;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      pr.x = e.clientX - rect.left;
      pr.y = e.clientY - rect.top;

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
        if (speed > speedTrigger && dist < proximity && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);
          const pushX = dot.cx - pr.x + vx * 0.005;
          const pushY = dot.cy - pr.y + vy * 0.005;
          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance },
            onComplete: () => {
              gsap.to(dot, { xOffset: 0, yOffset: 0, duration: returnDuration, ease: 'elastic.out(1,0.75)' });
              dot._inertiaApplied = false;
            }
          });
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist < shockRadius && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);
          const falloff = Math.max(0, 1 - dist / shockRadius);
          const pushX = (dot.cx - cx) * shockStrength * falloff;
          const pushY = (dot.cy - cy) * shockStrength * falloff;
          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance },
            onComplete: () => {
              gsap.to(dot, { xOffset: 0, yOffset: 0, duration: returnDuration, ease: 'elastic.out(1,0.75)' });
              dot._inertiaApplied = false;
            }
          });
        }
      }
    };

    const throttledMove = throttle(onMove, 50);
    window.addEventListener('mousemove', throttledMove as EventListener, { passive: true });
    window.addEventListener('click', onClick as EventListener);

    return () => {
      window.removeEventListener('mousemove', throttledMove as EventListener);
      window.removeEventListener('click', onClick as EventListener);
    };
  }, [maxSpeed, speedTrigger, proximity, resistance, returnDuration, shockRadius, shockStrength]);

  return (
    <section className={`p-4 flex items-center justify-center h-full w-full relative ${className}`} style={style}>
      <div ref={wrapperRef} className="w-full h-full relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      </div>
    </section>
  );
};

export default DotGrid;
