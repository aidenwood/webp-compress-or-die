/**
 * AsciiFx — text-mode creative coding. Renders a live ASCII field into a
 * <pre> (no WebGL, no canvas readback — just a string rebuilt per frame at
 * ~30fps). Brand-coloured via CSS so it inherits light/dark automatically.
 *
 * Modes:
 *   donut     — the classic rotating ASCII torus (luminance-shaded)
 *   metaballs — text-mode gooey blobs
 *   plasma    — sine-folded plasma ramp
 *   tunnel    — scrolling polar tunnel
 *   matrix    — falling digital rain
 *   wave      — interfering sine ridges
 *
 * Perf/UX: paused off-screen (IntersectionObserver), frozen single frame on
 * prefers-reduced-motion, grid capped so the string stays small.
 */

import React, { useEffect, useRef } from 'react';

export type AsciiMode = 'donut' | 'metaballs' | 'plasma' | 'tunnel' | 'matrix' | 'wave';

interface AsciiFxProps {
  mode: AsciiMode;
  className?: string;
  speed?: number;
  /** Char cell size in px (smaller = denser). Default 9. */
  cell?: number;
  /** Tint the field with the site accents instead of one solid ink colour. */
  accentGradient?: boolean;
}

const RAMP = ' .,:;ir=+*%#@'; // dark → light
const MATRIX_CHARS = '01ｱｲｳｴｵｶｷｸ<>/\\|=+*ABCDEF';

export default function AsciiFx({ mode, className = '', speed = 1, cell = 9, accentGradient = false }: AsciiFxProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const pre = preRef.current;
    if (!wrap || !pre || typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let cols = 0, rows = 0;
    let raf = 0, running = false;
    let t0 = 0;
    // matrix rain column heads
    let heads: number[] = [];

    const measure = () => {
      const r = wrap.getBoundingClientRect();
      cols = Math.max(8, Math.floor(r.width / (cell * 0.6)));
      rows = Math.max(6, Math.floor(r.height / cell));
      heads = new Array(cols).fill(0).map(() => Math.random() * rows);
      pre.style.fontSize = `${cell}px`;
      pre.style.lineHeight = `${cell}px`;
    };

    const ramp = (v: number) => RAMP[Math.max(0, Math.min(RAMP.length - 1, Math.floor(v * (RAMP.length - 1))))];

    const frame = (time: number) => {
      const t = (time - t0) / 1000 * speed;
      let out = '';

      if (mode === 'matrix') {
        // Build a sparse grid from moving column heads + trails.
        const grid: string[] = new Array(cols * rows).fill(' ');
        for (let x = 0; x < cols; x++) {
          heads[x] += 0.35 + (x % 5) * 0.05;
          if (heads[x] > rows + 12) heads[x] = -Math.random() * 20;
          const head = Math.floor(heads[x]);
          for (let trail = 0; trail < 12; trail++) {
            const y = head - trail;
            if (y >= 0 && y < rows) {
              const ch = MATRIX_CHARS[Math.floor((Math.random() * 0.4 + (x + y + t) % 1) * MATRIX_CHARS.length) % MATRIX_CHARS.length];
              grid[y * cols + x] = trail === 0 ? '@' : ch;
            }
          }
        }
        for (let y = 0; y < rows; y++) out += grid.slice(y * cols, y * cols + cols).join('') + '\n';
        pre.textContent = out;
        if (running && !reduced) raf = requestAnimationFrame(frame);
        return;
      }

      if (mode === 'donut') {
        // Sutherland-style rotating torus. zbuffer per cell.
        const A = t * 1.0, B = t * 0.5;
        const zbuf = new Float32Array(cols * rows).fill(0);
        const chars = new Array(cols * rows).fill(' ');
        const cosA = Math.cos(A), sinA = Math.sin(A), cosB = Math.cos(B), sinB = Math.sin(B);
        const R1 = 1, R2 = 2, K2 = 5;
        const K1 = cols * K2 * 3 / (8 * (R1 + R2));
        for (let th = 0; th < 6.28; th += 0.10) {
          const ct = Math.cos(th), st = Math.sin(th);
          for (let ph = 0; ph < 6.28; ph += 0.03) {
            const cp = Math.cos(ph), sp = Math.sin(ph);
            const cx = R2 + R1 * ct, cy = R1 * st;
            const x = cx * (cosB * cp + sinA * sinB * sp) - cy * cosA * sinB;
            const y = cx * (sinB * cp - sinA * cosB * sp) + cy * cosA * cosB;
            const z = K2 + cosA * cx * sp + cy * sinA;
            const ooz = 1 / z;
            const xp = Math.floor(cols / 2 + K1 * ooz * x);
            const yp = Math.floor(rows / 2 - K1 * ooz * y * 0.5);
            const L = cp * ct * sinB - cosA * ct * sp - sinA * st + cosB * (cosA * st - ct * sinA * sp);
            if (yp >= 0 && yp < rows && xp >= 0 && xp < cols && ooz > zbuf[yp * cols + xp]) {
              zbuf[yp * cols + xp] = ooz;
              chars[yp * cols + xp] = ramp(Math.max(0, L) * 0.7 + 0.05);
            }
          }
        }
        for (let y = 0; y < rows; y++) out += chars.slice(y * cols, y * cols + cols).join('') + '\n';
        pre.textContent = out;
        if (running && !reduced) raf = requestAnimationFrame(frame);
        return;
      }

      // Field-based modes (metaballs / plasma / tunnel / wave)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const u = (x / cols) * 2 - 1;
          const v = ((y / rows) * 2 - 1) * (rows / cols) * 1.8;
          let val = 0;
          if (mode === 'plasma') {
            val = 0.5 + 0.25 * (Math.sin(u * 4 + t) + Math.sin((u + v) * 3 + t * 1.3) + Math.sin(Math.hypot(u, v) * 6 - t));
          } else if (mode === 'metaballs') {
            for (let i = 0; i < 4; i++) {
              const bx = 0.6 * Math.sin(t * 0.6 + i * 1.7);
              const by = 0.6 * Math.cos(t * 0.5 + i * 2.3);
              val += 0.06 / Math.max(0.02, Math.hypot(u - bx, v - by));
            }
            val = Math.min(1, val * 0.5);
          } else if (mode === 'tunnel') {
            const r = Math.hypot(u, v), a = Math.atan2(v, u);
            val = 0.5 + 0.5 * Math.sin(1 / (r + 0.1) * 3 + a * 4 + t * 2);
          } else { // wave
            val = 0.5 + 0.5 * Math.sin(u * 6 + Math.sin(v * 4 + t) * 2 + t);
          }
          out += ramp(val);
        }
        out += '\n';
      }
      pre.textContent = out;
      if (running && !reduced) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? (reduced ? requestAnimationFrame(frame) : start()) : stop()), { rootMargin: '120px 0px' });
    io.observe(wrap);

    return () => { stop(); ro.disconnect(); io.disconnect(); };
  }, [mode, speed, cell]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ overflow: 'hidden' }}
      aria-hidden
    >
      <pre
        ref={preRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontWeight: 700,
          letterSpacing: 0,
          whiteSpace: 'pre',
          color: accentGradient ? 'transparent' : 'var(--primary-500, #7c5cff)',
          background: accentGradient ? 'linear-gradient(108deg, var(--primary-500) 0%, var(--primary-500) 25%, var(--accent-sea-lime-ink) 40%, var(--accent-sea-lime-ink) 68%, var(--primary-500) 84%, var(--primary-500) 100%)' : undefined,
          backgroundClip: accentGradient ? 'text' : undefined,
          WebkitBackgroundClip: accentGradient ? 'text' : undefined,
          WebkitTextFillColor: accentGradient ? 'transparent' : undefined,
          userSelect: 'none',
        }}
      />
    </div>
  );
}
