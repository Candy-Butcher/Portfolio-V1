import React from "react";

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties["animationDuration"];
  thickness?: number;              // glow ring width
  /** ▼ NEW: visible border **/
  borderColor?: string;
  borderWidth?: number;
};

const StarBorder = <T extends React.ElementType = "button">({
  as,
  className = "",
  color = "white",
  speed = "6s",
  thickness = 1,
  borderColor = "rgba(62, 59, 59, 0.15)",  // <— NEW default border color
  borderWidth = 1,                          // <— NEW default border width (px)
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || "button";

  return (
    <Component className={`relative inline-block overflow-hidden rounded-[20px] ${className}`} {...(rest as any)}>
      {/* animated glow masked to the ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[20px]"
        style={{
          padding: thickness,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      >
        <div
          className="absolute bottom-[-11px] right-[-250%] h-[50%] w-[300%] rounded-full animate-star-movement-bottom opacity-70 blur-[6px]"
          style={{ background: `radial-gradient(circle, ${color}, transparent 10%)`, animationDuration: speed }}
        />
        <div
          className="absolute left-[-250%] top-[-10px] h-[50%] w-[300%] rounded-full animate-star-movement-top opacity-70 blur-[6px]"
          style={{ background: `radial-gradient(circle, ${color}, transparent 10%)`, animationDuration: speed }}
        />
      </div>

      {/* ▼ NEW: crisp static border on top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[20px] z-[1]"
        style={{ boxShadow: `inset 0 0 0 ${borderWidth}px ${borderColor}` }}
      />

      {/* content (transparent background) */}
      <div className="relative z-[2] rounded-[20px] px-[26px] py-[16px] text-center text-[16px] text-white">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
