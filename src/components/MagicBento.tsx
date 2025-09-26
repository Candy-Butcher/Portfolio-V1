'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';

/* ---------- Types ---------- */
export interface BentoCardProps {
  color?: string;
  label?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;            // use Tailwind spans like "lg:col-span-2 lg:row-span-2"
    backgroundUrl?: string;
  backgroundPosition?: string;          // e.g. 'center', '50% 30%'
  backgroundFit?: 'cover' | 'contain';  // default: 'cover'
  frosted?: boolean;                    // adds blur panel behind text
  scrim?: 'radial' | 'linear' | false; 
}

export interface BentoProps {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;          // keep available, default off (magnetism-only)
  glowColor?: string;            // "r, g, b"
  clickEffect?: boolean;
  enableMagnetism?: boolean;
  cards?: BentoCardProps[];      // <-- pass your own cards here
}

/* ---------- Defaults ---------- */
const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

/* ---------- Demo fallback cards (safe to replace later) ---------- */
const cardData: BentoCardProps[] = [
  { color: '#060010', label: 'Insights',    title: 'Analytics',     description: 'Track user behavior' },
  { color: '#060010', label: 'Overview',    title: 'Dashboard',     description: 'Centralized data view' },
  { color: '#060010', label: 'Teamwork',    title: 'Collaboration', description: 'Work together seamlessly' },
  { color: '#060010', label: 'Efficiency',  title: 'Automation',    description: 'Streamline workflows' },
  { color: '#060010', label: 'Connectivity',title: 'Integration',   description: 'Connect favorite tools' },
  { color: '#060010', label: 'Protection',  title: 'Security',      description: 'Enterprise-grade protection' },
];
const FALLBACK_CARDS: BentoCardProps[] = [
  { label: 'A', title: 'Card A' },
  { label: 'B', title: 'Card B' },
  { label: 'C', title: 'Card C' },
  { label: 'D', title: 'Card D' },
];

/* ---------- Helpers ---------- */
const createParticleElement = (x: number, y: number, color: string = DEFAULT_GLOW_COLOR): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position:absolute;width:4px;height:4px;border-radius:50%;
    background: rgba(${color},1); box-shadow: 0 0 6px rgba(${color},0.6);
    pointer-events:none; z-index:100; left:${x}px; top:${y}px;`;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number
) => {
  const r = card.getBoundingClientRect();
  const relX = ((mouseX - r.left) / r.width) * 100;
  const relY = ((mouseY - r.top) / r.height) * 100;
  card.style.setProperty('--glow-x', `${relX}%`);
  card.style.setProperty('--glow-y', `${relY}%`);
  card.style.setProperty('--glow-intensity', String(glow));
  card.style.setProperty('--glow-radius', `${radius}px`);
};

const useMobile = () => {
  const [m, setM] = useState(false);
  useEffect(() => {
    const f = () => setM(window.innerWidth <= MOBILE_BREAKPOINT);
    f(); window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return m;
};

/* ---------- Particle / magnet / (optional tilt) wrapper ---------- */
const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}> = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = false,         // magnetism-only by default
  clickEffect = true,
  enableMagnetism = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const hoverRef = useRef(false);

  const startParticles = useCallback(() => {
    const el = cardRef.current; if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const templates = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    templates.forEach((p, i) => {
      const id = window.setTimeout(() => {
        if (!hoverRef.current || !cardRef.current) return;
        const clone = p.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });
        gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
      }, i * 100);
      timeoutsRef.current.push(id);
    });
  }, [particleCount, glowColor]);

  const clearParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    particlesRef.current.forEach((p) => {
      gsap.to(p, { scale: 0, opacity: 0, duration: 0.25, ease: 'back.in(1.7)', onComplete: () => p.remove() });
    });
    particlesRef.current = [];
  }, []);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const el = cardRef.current;

    const onEnter = () => {
      hoverRef.current = true;
      startParticles();
      if (enableTilt) gsap.to(el, { rotateX: 5, rotateY: 5, duration: 0.25, ease: 'power2.out', transformPerspective: 1000 });
    };

    const onLeave = () => {
      hoverRef.current = false;
      clearParticles();
      if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.25 });
      if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.25 });
      el.style.setProperty('--glow-intensity', '0');
    };

    const onMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const cx = r.width / 2, cy = r.height / 2;
      if (enableTilt) gsap.to(el, { rotateX: ((y - cy) / cy) * -10, rotateY: ((x - cx) / cx) * 10, duration: 0.1 });
      if (enableMagnetism) gsap.to(el, { x: (x - cx) * 0.05, y: (y - cy) * 0.05, duration: 0.25, ease: 'power2.out' });
      updateCardGlowProperties(el, e.clientX, e.clientY, 1, 200);
    };

    const onClick = (e: MouseEvent) => {
      if (!clickEffect) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const maxD = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - r.width, y),
        Math.hypot(x, y - r.height),
        Math.hypot(x - r.width, y - r.height)
      );
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position:absolute;left:${x - maxD}px;top:${y - maxD}px;width:${maxD * 2}px;height:${maxD * 2}px;border-radius:50%;
        background: radial-gradient(circle, rgba(${glowColor},0.4) 0%, rgba(${glowColor},0.2) 30%, transparent 70%);
        pointer-events:none; z-index:1000;`;
      el.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('click', onClick);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('click', onClick);
      clearParticles();
    };
  }, [disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor, startParticles, clearParticles]);

  return (
    <div ref={cardRef} className={`${className} relative overflow-hidden`} style={{ ...style, position: 'relative' }}>
      {children}
    </div>
  );
};

/* ---------- Global spotlight following the mouse ---------- */
const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR
}) => {
  const spotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef.current || !enabled) return;

    const spot = document.createElement('div');
    spot.style.cssText = `
      position: fixed; width:${spotlightRadius * 2}px; height:${spotlightRadius * 2}px; border-radius:50%;
      pointer-events:none; mix-blend-mode:screen; z-index:200; opacity:0; transform:translate(-50%,-50%);
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%);`;
    document.body.appendChild(spot);
    spotRef.current = spot;

    const onMove = (e: MouseEvent) => {
      if (!gridRef.current || !spotRef.current) return;

      const section = gridRef.current.closest('.bento-section');
      const rect = section?.getBoundingClientRect();
      const inside = !!rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      const cards = gridRef.current.querySelectorAll('.card');
      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minD = Infinity;

      cards.forEach((c) => {
        const el = c as HTMLElement;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(r.width, r.height) / 2;
        const d = Math.max(0, dist);
        minD = Math.min(minD, d);

        let glow = 0;
        if (d <= proximity) glow = 1;
        else if (d <= fadeDistance) glow = (fadeDistance - d) / (fadeDistance - proximity);

        updateCardGlowProperties(el, e.clientX, e.clientY, glow, spotlightRadius);
      });

      gsap.to(spotRef.current, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });
      gsap.to(spotRef.current, {
        opacity: inside
          ? (minD <= proximity ? 0.8 : minD <= fadeDistance ? ((fadeDistance - minD) / (fadeDistance - proximity)) * 0.8 : 0)
          : 0,
        duration: 0.2,
        ease: 'power2.out',
      });
    };

    const onLeave = () => {
      if (spotRef.current) gsap.to(spotRef.current, { opacity: 0, duration: 0.3 });
      gridRef.current?.querySelectorAll('.card').forEach((c) =>
        (c as HTMLElement).style.setProperty('--glow-intensity', '0')
      );
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      spotRef.current?.remove();
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

/* ---------- Grid shell ---------- */
const BentoCardGrid: React.FC<{
  children: React.ReactNode;
  gridRef?: React.Ref<HTMLDivElement>;
  glowColor?: string;
}> = ({ children, gridRef, glowColor }) => (
  <div
  className="bento-section grid gap-3 p-0 w-full select-none relative"
    style={{
      fontSize: 'clamp(1rem, 0.9rem + 0.5vw, 1.5rem)',
      ['--glow-color' as any]: glowColor,
    }}
    ref={gridRef}
  >
    {children}
  </div>
);

/* ---------- Main ---------- */
const MagicBento: React.FC<BentoProps> = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,                // default: magnetism only
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
  cards,                              // <-- receive custom cards here
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();
  const shouldDisable = disableAnimations || isMobile;

  // choose which set to render
  const cardsToRender: BentoCardProps[] = (cards && cards.length ? cards : cardData);

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisable}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <BentoCardGrid gridRef={gridRef} glowColor={glowColor}>
<div
  className="card-responsive grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 [grid-auto-rows:minmax(150px,auto)] gap-4"
  style={{ gridTemplateColumns: 'repeat(12, minmax(0,1fr))' }}
>

        {cardsToRender.map((card, index) => {
  const hasBg = Boolean(card.backgroundUrl);

  const baseClassName = `
    card flex flex-col justify-start gap-1 sm:gap-2 relative w-full max-w-full p-4 md:p-5
    border border-solid font-light overflow-hidden
    transition-all duration-300 ease-in-out hover:-translate-y-0.5
    hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]
    rounded-[20px]
    ${enableBorderGlow ? 'card--border-glow' : ''}
    ${card.className ?? ''}
  `;

  const cardStyle: React.CSSProperties = {
    backgroundColor: hasBg ? 'transparent' : (card.color || 'var(--background-dark)'),
    borderColor: 'var(--border-color)',
    color: 'var(--white)',
    ['--glow-x' as any]: '50%',
    ['--glow-y' as any]: '50%',
    ['--glow-intensity' as any]: '0',
    ['--glow-radius' as any]: '200px',
  };

  // build text
  const textBlock = (
    <>
      <div className="card__header mb-1">
        {card.label && (
          <span className="card__label text-xs tracking-wide opacity-80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
            {card.label}
          </span>
        )}
      </div>

      <div className="card__content flex flex-col relative">
        {card.title && (
          <h3 className={`card__title font-normal text-base m-0 mb-1 ${textAutoHide ? 'text-clamp-1' : ''} drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]`}>
            {card.title}
          </h3>
        )}
        {card.description && (
          <div className={`card__description text-xs leading-5 opacity-90 ${textAutoHide ? 'text-clamp-2' : ''}`}>
            {card.description}
          </div>
        )}
      </div>
    </>
  );

  const inner = card.frosted ? (
    <div className="relative z-5 max-w-3xl rounded-xl backdrop-blur-md bg-black/ ring-1 ring-white/5 p-5 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
      {textBlock}
    </div>
  ) : (
    <div className="relative z-5">{textBlock}</div>
  );

  // compose background layers + content
  const content = (
    <>
      {hasBg && (
        <>
          {/* Background image */}
          <div
            className="absolute inset-0 -z-[1] pointer-events-none"
            style={{
              backgroundImage: `url(${card.backgroundUrl})`,
              backgroundSize: card.backgroundFit || 'cover',
              backgroundPosition: card.backgroundPosition || 'center',
              filter: 'saturate(0.9) brightness(0.98)',
              transform: 'scale(1.0)',
            }}
          />
          {/* Optional scrim */}
          {card.scrim && (
            card.scrim === 'radial' ? (
              <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(6,0,16,0.18) 0%, rgba(6,0,16,0.55) 60%, rgba(6,0,16,0.75) 100%)'
                }}
              />
            ) : (
              <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-tr from-[#060010]/70 via-[#060010]/30 to-transparent" />
            )
          )}
        </>
      )}

      {inner}
    </>
  );

  if (enableStars) {
    return (
      <ParticleCard
        key={index}
        className={baseClassName}
        style={cardStyle}
        disableAnimations={shouldDisable}
        particleCount={particleCount}
        glowColor={glowColor}
        enableTilt={enableTilt}
        clickEffect={clickEffect}
        enableMagnetism={enableMagnetism}
      >
        {content}
      </ParticleCard>
    );
  }

  return (
    <div key={index} className={baseClassName} style={cardStyle}>
      {content}
    </div>
  );
})}

        </div>
      </BentoCardGrid>
    </>
  );
};

export default MagicBento;
