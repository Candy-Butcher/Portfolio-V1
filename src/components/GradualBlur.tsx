"use client";

import React, {
  CSSProperties,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Edge = "top" | "bottom" | "left" | "right";

export type GradualBlurProps = PropsWithChildren<{
  position?: Edge;
  /** Blur strength multiplier (≈ 1–4 is sensible) */
  strength?: number;
  /** Vertical overlay size for top/bottom (e.g., "6rem", "90px") */
  height?: string;
  /** Horizontal overlay size for left/right (e.g., "6rem", "90px") */
  width?: string;
  /** Number of stacked layers (2–4 recommended for perf) */
  divCount?: number;
  /** Exponential falloff (true) vs linear */
  exponential?: boolean;
  /** z-index of the overlay when target="page" (fixed) */
  zIndex?: number;
  /**
   * Animation:
   *  - false: static
   *  - true: enable CSS transitions on blur
   *  - "scroll": fade in when scrolled into view (via IntersectionObserver)
   */
  animated?: boolean | "scroll";
  /** CSS transition duration (e.g., "0.3s") */
  duration?: string;
  /** CSS transition easing (e.g., "ease-out") */
  easing?: string;
  /** Opacity for each layer (0–1). Keep 1.0 for crispness. */
  opacity?: number;
  /** Curve controlling the layer progression */
  curve?: "linear" | "bezier" | "ease-in" | "ease-out" | "ease-in-out";
  /** Enable responsive sizes via *Height/*Width props */
  responsive?: boolean;
  mobileHeight?: string;
  tabletHeight?: string;
  desktopHeight?: string;
  mobileWidth?: string;
  tabletWidth?: string;
  desktopWidth?: string;

  /** Handy presets for common placements/feels */
  preset?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "subtle"
    | "intense"
    | "smooth"
    | "sharp"
    | "header"
    | "footer"
    | "sidebar"
    | "page-header"
    | "page-footer";

  /** Keep DOM/CSS minimal for performance */
  gpuOptimized?: boolean; // (reserved, not used here)
  /** On hover, multiply strength by this factor (e.g., 1.3). Enables pointer events. */
  hoverIntensity?: number;
  /** "page" = position:fixed, "parent" = position:absolute */
  target?: "parent" | "page";

  onAnimationComplete?: () => void;
  className?: string;
  style?: CSSProperties;
}>;

const DEFAULT_CONFIG: Required<
  Omit<
    GradualBlurProps,
    | "children"
    | "mobileHeight"
    | "tabletHeight"
    | "desktopHeight"
    | "mobileWidth"
    | "tabletWidth"
    | "desktopWidth"
    | "onAnimationComplete"
  >
> = {
  position: "bottom",
  strength: 2,
  height: "6rem",
  width: undefined as unknown as string, // handled by logic
  divCount: 5,
  exponential: false,
  zIndex: 1000,
  animated: false,
  duration: "0.3s",
  easing: "ease-out",
  opacity: 1,
  curve: "linear",
  responsive: false,
  preset: undefined as unknown as NonNullable<GradualBlurProps["preset"]>,
  gpuOptimized: false,
  hoverIntensity: undefined as unknown as number,
  target: "parent",
  className: "",
  style: {},
};

const PRESETS: Record<string, Partial<GradualBlurProps>> = {
  top: { position: "top", height: "6rem" },
  bottom: { position: "bottom", height: "6rem" },
  left: { position: "left", height: "6rem" },
  right: { position: "right", height: "6rem" },

  subtle: { height: "4rem", strength: 1, opacity: 0.85, divCount: 3 },
  intense: { height: "10rem", strength: 4, divCount: 8, exponential: true },

  smooth: { height: "8rem", curve: "bezier", divCount: 10 },
  sharp: { height: "5rem", curve: "linear", divCount: 4 },

  header: { position: "top", height: "8rem", curve: "ease-out" },
  footer: { position: "bottom", height: "8rem", curve: "ease-out" },
  sidebar: { position: "left", height: "6rem", strength: 2.5 },

  "page-header": { position: "top", height: "10rem", target: "page", strength: 3 },
  "page-footer": { position: "bottom", height: "10rem", target: "page", strength: 3 },
};

const CURVE_FUNCTIONS: Record<string, (p: number) => number> = {
  linear: (p) => p,
  // smoothstep-like
  bezier: (p) => p * p * (3 - 2 * p),
  "ease-in": (p) => p * p,
  "ease-out": (p) => 1 - Math.pow(1 - p, 2),
  "ease-in-out": (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
};

function mergeConfigs<T extends object>(...configs: Array<Partial<T>>): T {
  // shallow merge left-to-right; final cast is safe if callers provide defaults elsewhere
  return Object.assign({}, ...configs) as T;
}

function getGradientDirection(position: Edge): string {
  const directions: Record<Edge, string> = {
    top: "to top",
    bottom: "to bottom",
    left: "to left",
    right: "to right",
  };
  return directions[position] ?? "to bottom";
}

function debounce<T extends (...a: any[]) => void>(fn: T, wait: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...a: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...a), wait);
  };
}

function useResponsiveDimension(
  responsive: boolean | undefined,
  config: Partial<GradualBlurProps>,
  key: keyof Pick<GradualBlurProps, "height" | "width">
) {
  const [val, setVal] = useState<any>(config[key]);

  useEffect(() => {
    if (!responsive) return;

    const calc = () => {
      const w = window.innerWidth;
      let v: any = config[key];
      const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
      const K = cap(key as string);

      if (w <= 480 && (config as any)[`mobile${K}`]) v = (config as any)[`mobile${K}`];
      else if (w <= 768 && (config as any)[`tablet${K}`]) v = (config as any)[`tablet${K}`];
      else if (w <= 1280 && (config as any)[`desktop${K}`]) v = (config as any)[`desktop${K}`];

      setVal(v);
    };

    const deb = debounce(calc, 100);
    calc();
    window.addEventListener("resize", deb);
    return () => window.removeEventListener("resize", deb);
  }, [responsive, config, key]);

  return responsive ? val : (config as any)[key];
}

function useIntersectionVisible(
  ref: React.RefObject<HTMLElement>,
  shouldObserve: boolean
) {
  const [isVisible, setIsVisible] = useState(!shouldObserve);

  useEffect(() => {
    if (!shouldObserve || !ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        setIsVisible(!!first?.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, shouldObserve]);

  return isVisible;
}

const GradualBlur: React.FC<GradualBlurProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Merge defaults → preset → props (props win)
  const cfg = useMemo(() => {
    const presetCfg = props.preset ? PRESETS[props.preset] ?? {} : {};
    return mergeConfigs<GradualBlurProps>(DEFAULT_CONFIG, presetCfg, props);
  }, [props]);

  const responsiveHeight = useResponsiveDimension(cfg.responsive, cfg, "height");
  const responsiveWidth = useResponsiveDimension(cfg.responsive, cfg, "width");

  const isVisible = useIntersectionVisible(
    containerRef,
    cfg.animated === "scroll"
  );

  const blurDivs = useMemo(() => {
    const nodes: React.ReactNode[] = [];

    const count = Math.max(1, cfg.divCount ?? 1);
    const increment = 100 / count;
    const curveKey = cfg.curve ?? "linear";
    const curveFn = (CURVE_FUNCTIONS[curveKey] ?? CURVE_FUNCTIONS.linear) as (p: number) => number;

    const currentStrength =
      isHovered && cfg.hoverIntensity ? (cfg.strength ?? 1) * cfg.hoverIntensity : cfg.strength ?? 1;

    for (let i = 1; i <= count; i++) {
      // 0→1 progression across layers, shaped by curve
      let progress = i / count;
      progress = curveFn(progress);

      // Layer blur: small -> larger near the edge
      const blurValue = (cfg.exponential
        ? Math.pow(2, progress * 4) * 0.0625
        : 0.0625 * (progress * count + 1)) * (currentStrength ?? 1);

      // Build a mask window for this layer
      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const direction = getGradientDirection(cfg.position ?? "bottom");

      const layerStyle: CSSProperties = {
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity: cfg.opacity ?? 1,
        transition:
          cfg.animated && cfg.animated !== "scroll"
            ? `backdrop-filter ${cfg.duration} ${cfg.easing}`
            : undefined,
      };

      nodes.push(<div key={i} className="absolute inset-0" style={layerStyle} />);
    }

    return nodes;
  }, [cfg, isHovered]);

  const containerStyle: CSSProperties = useMemo(() => {
    const position = cfg.position ?? "bottom";
    const isVertical = position === "top" || position === "bottom";
    const isHorizontal = position === "left" || position === "right";
    const isPageTarget = cfg.target === "page";

    const base: CSSProperties = {
      position: isPageTarget ? "fixed" : "absolute",
      pointerEvents: cfg.hoverIntensity ? "auto" : "none",
      opacity: isVisible ? 1 : 0,
      transition: cfg.animated ? `opacity ${cfg.duration} ${cfg.easing}` : undefined,
      zIndex: cfg.zIndex ?? 1000,
    };

    if (isVertical) {
      base.height = responsiveHeight ?? cfg.height ?? "6rem";
      base.width = responsiveWidth ?? "100%";
      (base as any)[position] = 0;
      (base as any).left = 0;
      (base as any).right = 0;
    } else if (isHorizontal) {
      base.width = responsiveWidth ?? cfg.width ?? (responsiveHeight ?? cfg.height ?? "6rem");
      base.height = "100%";
      (base as any)[position] = 0;
      (base as any).top = 0;
      (base as any).bottom = 0;
    }

    return base;
  }, [cfg, responsiveHeight, responsiveWidth, isVisible]);

  // Fire callback after scroll-animate-in completes
  useEffect(() => {
    const onDone = cfg.onAnimationComplete;
    if (isVisible && cfg.animated === "scroll" && onDone) {
      const ms = Number.parseFloat(cfg.duration ?? "0.3") * 1000;
      const t = window.setTimeout(() => {
        onDone();
      }, Number.isFinite(ms) ? ms : 300);
      return () => clearTimeout(t);
    }
  }, [isVisible, cfg.animated, cfg.onAnimationComplete, cfg.duration]);

  return (
    <div
      ref={containerRef}
      className={`gradual-blur relative isolate ${
        cfg.target === "page" ? "gradual-blur-page" : "gradual-blur-parent"
      } ${cfg.className ?? ""}`}
      style={containerStyle}
      onMouseEnter={cfg.hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={cfg.hoverIntensity ? () => setIsHovered(false) : undefined}
      aria-hidden
    >
      <div className="relative h-full w-full">{blurDivs}</div>
      {/* Children are optional; if provided, they render ABOVE the blur */}
      {props.children ? <div className="relative">{props.children}</div> : null}
    </div>
  );
};

const GradualBlurMemo = React.memo(GradualBlur);
GradualBlurMemo.displayName = "GradualBlur";
(GradualBlurMemo as any).PRESETS = PRESETS;
(GradualBlurMemo as any).CURVE_FUNCTIONS = CURVE_FUNCTIONS;
export default GradualBlurMemo;

/* Minimal styles injected once */
function injectStylesOnce() {
  if (typeof document === "undefined") return;
  const id = "gradual-blur-styles";
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent =
    `.gradual-blur{pointer-events:none;transition:opacity .3s ease-out}` +
    `.gradual-blur-inner{pointer-events:none}`;
  document.head.appendChild(el);
}
if (typeof document !== "undefined") {
  injectStylesOnce();
}
