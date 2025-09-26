'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  /** Spotlight color (hex; supports #RGB, #RGBA, #RRGGBB, #RRGGBBAA) */
  color?: string;
  /** 0–1 extra opacity for the spotlight on top of the color’s own alpha */
  intensity?: number;
  /** Radius of the spotlight in px */
  radius?: number;
  /** Keep the spotlight hidden until hover (default: true) */
  hoverOnly?: boolean;
  /** Optional: override padding classes if you want different spacing */
  paddingClassName?: string;
};

export default function SpotlightCard({
  className,
  paddingClassName,
  children,
  color = '#ffffff',
  intensity = 0.22,
  radius = 260,
  hoverOnly = true,
  ...rest
}: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [styleVars, setStyleVars] = React.useState<React.CSSProperties>({});

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStyleVars({
      ['--sx' as any]: `${x}px`,
      ['--sy' as any]: `${y}px`,
    });
  };

  const handleLeave = () => {
    setStyleVars({
      ['--sx' as any]: `-9999px`,
      ['--sy' as any]: `-9999px`,
    });
  };

  React.useEffect(() => {
    handleLeave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rgba = hexToRgba(color, intensity);

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl',
        // 👇 make the card OPAQUE and a touch larger-feeling
        // (no backdrop-blur; solid dark surface)
        'bg-[#0b0f17] ring-1 ring-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]',
        // generous default padding so the content isn’t “constricted”
        paddingClassName ?? 'p-6 sm:p-7 md:p-8',
        className
      )}
      {...rest}
    >
      {/* Spotlight overlay (hidden until hover) */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 transition-opacity duration-200',
          hoverOnly ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
        )}
        style={{
          ...styleVars,
          background: `radial-gradient(${radius}px circle at var(--sx) var(--sy), ${rgba}, transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function hexToRgba(hex: string, extraAlpha: number) {
  const h = hex.replace('#', '').trim();

  if (h.length === 3 || h.length === 4) {
    const r = parseInt(h.charAt(0) + h.charAt(0), 16);
    const g = parseInt(h.charAt(1) + h.charAt(1), 16);
    const b = parseInt(h.charAt(2) + h.charAt(2), 16);
    const alphaHex = h.length === 4 ? h.charAt(3) + h.charAt(3) : null;
    const a = alphaHex ? parseInt(alphaHex, 16) / 255 : 1;
    return `rgba(${r}, ${g}, ${b}, ${clamp01(a * extraAlpha)})`;
  }

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const alphaHex = h.length >= 8 ? h.slice(6, 8) : null;
  const a = alphaHex ? parseInt(alphaHex, 16) / 255 : 1;

  return `rgba(${r}, ${g}, ${b}, ${clamp01(a * extraAlpha)})`;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
