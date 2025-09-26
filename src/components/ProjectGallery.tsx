'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Lightbox from '@/components/Lightbox';

type MediaType = 'image' | 'video';

export type GalleryItem = {
  src: string;
  type?: MediaType;   // default 'image'
  alt?: string;
  poster?: string;    // for videos
};

type Props = {
  items: GalleryItem[];
  thumbHeight?: number; // px height of the in-card strip
};

export default function ProjectGallery({ items, thumbHeight = 220 }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [showArrows, setShowArrows] = useState(false);
  const stripRef = useRef<HTMLDivElement | null>(null);

  // Ensure each item has a type
  const media = useMemo(
    () => items.map((i) => ({ type: i.type ?? 'image', ...i })),
    [items]
  );

  /* ------------ In-card horizontal interactions ------------ */

  // Convert vertical mouse wheel to horizontal scroll
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Let intentional horizontal wheel through
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel as EventListener);
  }, []);

  // Drag-to-pan
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startLeft = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDown = true;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      el.classList.add('select-none', 'cursor-grabbing');
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      el.scrollLeft = startLeft - (e.clientX - startX);
    };
    const onPointerUp = (e: PointerEvent) => {
      isDown = false;
      el.classList.remove('select-none', 'cursor-grabbing');
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  // Show arrows only when content overflows horizontally
  useEffect(() => {
    const update = () => {
      const el = stripRef.current;
      if (!el) {
        setShowArrows(false);
        return;
      }
      setShowArrows(el.scrollWidth > el.clientWidth + 2);
    };

    update();

    const el = stripRef.current;
    if (!el) return;

    const ro = new ResizeObserver(update);
    ro.observe(el);

    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', update as EventListener);
      window.removeEventListener('resize', update);
    };
  }, [media.length, thumbHeight]);

  const scrollByOne = useCallback((dir: -1 | 1) => {
    const el = stripRef.current;
    if (!el) return;
    const firstChild = el.querySelector('button');
    const gap = 16; // tailwind gap-4
    const childWidth = firstChild
      ? (firstChild as HTMLElement).getBoundingClientRect().width
      : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * (childWidth + gap), behavior: 'smooth' });
  }, []);

  return (
    <>
      {/* ---------- Scrollable strip inside the card ---------- */}
      <div className="relative w-full">
  <div
    ref={stripRef}
    className="no-scrollbar flex w-full justify-start gap-4 overflow-x-auto snap-x snap-mandatory cursor-grab"
    style={{
      height: thumbHeight,
      WebkitOverflowScrolling: 'touch',
      scrollPaddingLeft: 0, // keep first tile flush left
    }}
    aria-label="Gallery strip"
  >
    {media.map((m, idx) => (
      <button
        key={m.src + idx}
        onClick={() => setOpenIdx(idx)}
        className="relative flex-none snap-start aspect-video h-full min-w-[70%] sm:min-w-[420px] overflow-hidden rounded-xl ring-1 ring-white/10 hover:ring-white/20 transition"
        aria-label="Open media viewer"
      >
        {m.type === 'video' ? (
          <video
            className="h-full w-full object-cover"
            muted
            playsInline
            loop
            preload="metadata"
            poster={m.poster}
          >
            <source src={m.src} />
          </video>
        ) : (
          <img src={m.src} alt={m.alt ?? ''} className="h-full w-full object-cover" />
        )}
        <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-wide">
          {m.type}
        </span>
      </button>
    ))}
  </div>
  
        {/* Left/Right scroll buttons (only if overflow and >1 item) */}
        {showArrows && media.length > 1 && (
          <>
            <button
              onClick={() => scrollByOne(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xl bg-white/5 p-2 ring-1 ring-white/10 hover:bg-white/10"
              aria-label="Scroll left"
            >
              ‹
            </button>
            <button
              onClick={() => scrollByOne(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-white/5 p-2 ring-1 ring-white/10 hover:bg-white/10"
              aria-label="Scroll right"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* ---------- Fullscreen Lightbox ---------- */}
      {openIdx !== null ? (
        <Lightbox
          items={media}
          index={openIdx}
          onIndex={setOpenIdx}
          onClose={() => setOpenIdx(null)}
        />
      ) : null}
    </>
  );
}
