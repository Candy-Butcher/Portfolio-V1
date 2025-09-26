// src/components/GradientText.tsx
import React, { ElementType, ReactNode } from "react";

type Props<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  colors?: string[];                 // gradient stops
  animationSpeed?: number;           // seconds
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export default function GradientText<T extends ElementType = "h2">({
  as,
  children,
  className = "",
  colors = ["#79F2C7", "#6FB6FF", "#79F2C7"], // mint → blue like your reference
  animationSpeed = 3,
  ...rest
}: Props<T>) {
  const Component = (as || "h2") as ElementType;
  return (
    <Component
      {...rest}
      className={`bg-clip-text text-transparent animate-gradient ${className}`}
      style={{
        backgroundImage: `linear-gradient(to right, ${colors.join(",")})`,
        backgroundSize: "300% 100%",
        animationDuration: `${animationSpeed}s`,
      }}
    >
      {children}
    </Component>
  );
}
