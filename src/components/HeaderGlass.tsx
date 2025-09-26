"use client";

import GradualBlur from "@/components/GradualBlur";

export default function HeaderGlass({ children }: { children: React.ReactNode }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-[60]">
      <div className="relative mx-auto max-w-7xl px-4 py-3">
        {/* Blur layer (behind content) */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <GradualBlur
            target="parent"
            position="top"
            height="100%"     // fill header box
            strength={1.1}    // tune 0.9–1.4
            divCount={4}      // 3–4 layers is smooth and light
            curve="bezier"
            opacity={1}
            className="rounded-xl"
          />
          {/* subtle tint + hairline to separate from content */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: "hsl(var(--background) / 0.35)",           // soft glass tint
              boxShadow: "0 1px 0 hsl(var(--muted) / 0.6) inset",    // hairline at bottom
            }}
          />
        </div>

        {/* your actual header content */}
        <div className="flex items-center justify-between gap-4">
          {children}
        </div>
      </div>
    </header>
  );
}
