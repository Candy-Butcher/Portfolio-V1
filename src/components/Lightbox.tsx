"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { GalleryItem } from "@/components/ProjectGallery";

type LightboxProps = {
  items: GalleryItem[];
  index: number;
  onIndex: (n: number) => void;
  onClose: () => void;
};

const Lightbox: React.FC<LightboxProps> = ({ items, index, onIndex, onClose }) => {
  // keep our own index but sync outward
  const [current, setCurrent] = useState(index);

  useEffect(() => setCurrent(index), [index]);
  useEffect(() => onIndex(current), [current, onIndex]);

  const hasItems = items && items.length > 0;
  const item = useMemo(() => (hasItems ? items[current % items.length] : undefined), [items, current, hasItems]);

  const goPrev = useCallback(() => {
    if (!hasItems) return;
    setCurrent((i) => (i - 1 + items.length) % items.length);
  }, [hasItems, items.length]);

  const goNext = useCallback(() => {
    if (!hasItems) return;
    setCurrent((i) => (i + 1) % items.length);
  }, [hasItems, items.length]);

  // Close on ESC & navigate with arrows
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goPrev, goNext]);

  // Lock background scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // SSR guard
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      aria-modal
      role="dialog"
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-violet-400/60"
      >
        ✕
      </button>

      {/* Prev / Next */}
      {hasItems && items.length > 1 && (
        <>
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-violet-400/60"
            onClick={goPrev}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-violet-400/60"
            onClick={goNext}
            aria-label="Next"
          >
            ›
          </button>
        </>
      )}

      {/* Media */}
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-8">
        <div className="relative mx-auto aspect-video w-full max-h-[90vh]">
          {item ? (
            item.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt ?? ""}
                className="h-full w-full rounded-lg object-contain shadow-xl"
              />
            ) : (
              <video
                className="h-full w-full rounded-lg object-contain shadow-xl"
                controls
                autoPlay
                playsInline
                // poster is optional
                poster={"poster" in item ? item.poster : undefined}
              >
                <source src={item.src} />
              </video>
            )
          ) : null}
        </div>

        {/* Counter */}
        {hasItems && (
          <div className="mt-3 text-center text-sm text-white/70">
            {current + 1} / {items.length}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Lightbox;
