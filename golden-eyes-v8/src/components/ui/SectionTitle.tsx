import { cn } from "@/lib/utils";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

/**
 * Titre de section éditorial : eyebrow doré avec filet, grand titre
 * serif, description en brun doux. Variante `dark` pour fonds sombres.
 */
export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  dark = false,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "eyebrow mb-5",
            align === "center" && "justify-center",
            dark && "!text-gold-300",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-serif text-display-md text-balance",
          dark ? "text-paper" : "text-espresso",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed text-balance",
            dark ? "text-paper/70" : "text-ink-muted",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
