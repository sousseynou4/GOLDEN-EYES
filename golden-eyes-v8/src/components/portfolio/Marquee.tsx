import Image from "next/image";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  images: { id: string; url: string; alt?: string }[];
  reverse?: boolean;
  className?: string;
}

/**
 * Bandeau défilant infini (CSS animation `marquee`).
 * Liste dupliquée pour une boucle sans saut, fondu sur les bords.
 */
export function Marquee({ images, reverse = false, className }: MarqueeProps) {
  if (images.length === 0) return null;
  const duplicated = [...images, ...images];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max gap-5 animate-marquee",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {duplicated.map((img, i) => (
          <div
            key={`${img.id}-${i}`}
            className="relative aspect-[4/5] w-60 flex-shrink-0 overflow-hidden rounded-xl bg-paper-warm md:w-72"
          >
            <Image
              src={img.url}
              alt={img.alt ?? ""}
              fill
              sizes="(max-width: 768px) 240px, 288px"
              className="object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
