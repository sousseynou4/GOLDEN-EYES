"use client";

import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Point d'entrée unique de GSAP côté navigateur.
 * Enregistre ScrollTrigger une seule fois et expose un hook qui
 * nettoie automatiquement les animations au démontage du composant.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** `true` si le visiteur a demandé à réduire les animations (accessibilité). */
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Lance des animations GSAP limitées à l'élément `scope`.
 * Tous les tweens et ScrollTriggers créés dans `setup` sont annulés
 * (et les styles inline retirés) quand le composant est démonté.
 */
export function useGsap(
  setup: (ctx: { reduced: boolean; q: (selector: string) => Element[] }) => void,
  scope: RefObject<HTMLElement | null>,
  deps: DependencyList = [],
) {
  useIsomorphicLayoutEffect(() => {
    if (!scope.current) return;
    const q = gsap.utils.selector(scope.current);
    const ctx = gsap.context(() => setup({ reduced: prefersReducedMotion(), q }), scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
