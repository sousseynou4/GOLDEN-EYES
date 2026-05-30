import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "primary-dark" | "ghost-dark";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-espresso text-paper hover:bg-gold-500 hover:text-espresso active:scale-[0.98]",
  ghost:
    "border border-ink/30 text-ink hover:border-espresso hover:bg-espresso hover:text-paper",
  "primary-dark":
    "bg-gold-500 text-espresso hover:bg-paper active:scale-[0.98]",
  "ghost-dark":
    "border border-paper/40 text-paper hover:bg-paper hover:text-espresso",
};

const sizes: Record<Size, string> = {
  sm: "px-5 py-2 text-xs",
  md: "px-7 py-3.5 text-sm",
  lg: "px-9 py-4 text-base",
};

/**
 * Bouton réutilisable, forme pilule, label en majuscules espacées.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium uppercase tracking-wider",
          "transition-all duration-300",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
