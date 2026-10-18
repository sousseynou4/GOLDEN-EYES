"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, [data-cursor]";

/**
 * Curseur doré (ordinateur uniquement) : un point qui suit la souris
 * et un anneau qui le rattrape avec un léger retard, puis s'agrandit
 * au survol des liens et boutons. Le curseur natif reste visible.
 * Désactivé sur écran tactile et si les animations sont réduites.
 */
export function GoldCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    const d = dot.current;
    const r = ring.current;

    const dotX = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(r, "x", { duration: 0.55, ease: "power3.out" });
    const ringY = gsap.quickTo(r, "y", { duration: 0.55, ease: "power3.out" });

    let visible = false;
    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
        gsap.to([d, r], { opacity: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };
    const onOver = (e: PointerEvent) => {
      const hovering = (e.target as Element | null)?.closest?.(INTERACTIVE);
      gsap.to(r, {
        scale: hovering ? 1.9 : 1,
        backgroundColor: hovering ? "rgba(221,184,102,0.12)" : "rgba(221,184,102,0)",
        duration: 0.4,
        ease: "power3.out",
      });
    };
    const onLeave = () => {
      visible = false;
      gsap.to([d, r], { opacity: 0, duration: 0.3 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[70] -ml-5 -mt-5 h-10 w-10 rounded-full border border-gold-400/80 opacity-0"
      />
      <div
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[70] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-gold-400 opacity-0"
      />
    </>
  );
}
