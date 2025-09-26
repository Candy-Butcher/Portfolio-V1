"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import GradualBlur from "@/components/GradualBlur";

/** Always-visible bottom-of-viewport blur, above page content. */
export default function ViewportBottomBlur() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <GradualBlur
      target="page"        // makes it position: fixed
      position="bottom"
      height="4.5rem"
      strength={1.2}
      divCount={3}
      curve="bezier"
      exponential={true}
      opacity={1}
      zIndex={1000}        // above your content
      className="pointer-events-none"
    />,
    document.body
  );
}
