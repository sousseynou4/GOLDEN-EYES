"use client";

import { useEffect, useRef } from "react";
import type { WebGLRenderer } from "three";
import { prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface GoldParticlesProps {
  className?: string;
  /** Multiplie le nombre de particules (1 = valeur par défaut). */
  density?: number;
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uHeight;
  attribute float aSeed;
  attribute float aSize;
  attribute float aTint;
  varying float vAlpha;
  varying float vTint;
  varying float vBokeh;

  void main() {
    vec3 p = position;
    // Montée lente et infinie, avec une légère ondulation
    float speed = 0.12 + fract(aSeed * 7.13) * 0.22;
    p.y = mod(p.y + uTime * speed + uHeight * 0.5, uHeight) - uHeight * 0.5;
    p.x += sin(uTime * 0.3 + aSeed) * 0.35;
    p.z += cos(uTime * 0.22 + aSeed) * 0.25;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (12.0 / -mv.z);

    float twinkle = 0.55 + 0.45 * sin(uTime * 1.6 + aSeed * 6.0);
    vBokeh = step(5.0, aSize);
    vAlpha = twinkle * mix(0.95, 0.16, vBokeh);
    vTint = aTint;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying float vAlpha;
  varying float vTint;
  varying float vBokeh;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    // Poussière d'or nette ou grand bokeh flou selon la taille
    float spark = pow(core, 2.4);
    float bokeh = smoothstep(0.5, 0.3, d) * 0.55 + core * 0.45;
    float glow = mix(spark, bokeh, vBokeh);
    vec3 gold = mix(vec3(0.72, 0.52, 0.17), vec3(1.0, 0.9, 0.62), vTint);
    gl_FragColor = vec4(gold, glow * vAlpha);
  }
`;

/**
 * Poussière d'or en 3D (Three.js) : particules dorées qui montent
 * lentement, scintillent, et suivent légèrement la souris.
 * - Chargé à la demande (Three.js n'alourdit pas le premier affichage)
 * - Désactivé si le visiteur préfère réduire les animations
 * - Mis en pause hors écran ou quand l'onglet est caché
 */
export function GoldParticles({ className, density = 1 }: GoldParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      const canvas = document.createElement("canvas");
      let renderer: WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
        });
      } catch {
        return; // WebGL indisponible : on garde simplement la photo
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity 1.6s ease";
      container.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
      camera.position.z = 10;

      const isSmall = window.innerWidth < 768;
      const count = Math.round((isSmall ? 420 : 1200) * density);
      const height = 14;
      const positions = new Float32Array(count * 3);
      const seeds = new Float32Array(count);
      const sizes = new Float32Array(count);
      const tints = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 26;
        positions[i * 3 + 1] = (Math.random() - 0.5) * height;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        seeds[i] = Math.random() * Math.PI * 2;
        // ~6 % de grands bokeh flous, le reste en fine poussière
        sizes[i] = Math.random() < 0.06 ? 6 + Math.random() * 10 : 1 + Math.random() * 2.5;
        tints[i] = Math.random();
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute("aTint", new THREE.BufferAttribute(tints, 1));

      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: renderer.getPixelRatio() },
          uHeight: { value: height },
        },
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // ── Taille ──
      const resize = () => {
        const { clientWidth: w, clientHeight: h } = container;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      // ── Parallaxe souris ──
      const pointer = { x: 0, y: 0 };
      const onPointerMove = (e: PointerEvent) => {
        pointer.x = e.clientX / window.innerWidth - 0.5;
        pointer.y = e.clientY / window.innerHeight - 0.5;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      // ── Pause hors écran / onglet caché ──
      let inView = true;
      const intersection = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
      });
      intersection.observe(container);

      // ── Boucle de rendu ──
      let frame = 0;
      let last = performance.now();
      let elapsed = 0;
      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        const delta = Math.min((now - last) / 1000, 0.05);
        last = now;
        if (!inView || document.hidden) return;
        elapsed += delta;
        material.uniforms.uTime.value = elapsed;
        camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.035;
        camera.position.y += (-pointer.y * 0.9 - camera.position.y) * 0.035;
        camera.lookAt(0, 0, 0);
        points.rotation.y = elapsed * 0.015;
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(tick);
      requestAnimationFrame(() => (canvas.style.opacity = "1"));

      cleanup = () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        intersection.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [density]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    />
  );
}
