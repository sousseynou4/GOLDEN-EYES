import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizes = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

export function Container({
  className,
  size = "xl",
  children,
  ...props
}: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-6", sizes[size], className)} {...props}>
      {children}
    </div>
  );
}
