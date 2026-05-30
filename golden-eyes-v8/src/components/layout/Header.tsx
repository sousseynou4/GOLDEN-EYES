"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const NAV_LINKS = [
  { href: ROUTES.home, label: "Accueil" },
  { href: ROUTES.portfolio, label: "Portfolio" },
  { href: ROUTES.about, label: "À propos" },
  { href: ROUTES.contact, label: "Contact" },
];

/**
 * Header éditorial.
 * - Sur la home : transparent au sommet (texte clair sur le hero sombre),
 *   puis fond crème + ombre au scroll.
 * - Sur les autres pages : fond crème dès le départ.
 */
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === ROUTES.home;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Sur la home en haut de page : header transparent, texte clair
  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        transparent
          ? "bg-transparent py-6"
          : "border-b border-line bg-paper/90 py-4 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link href={ROUTES.home} className="group flex flex-col leading-none">
          <span
            className={cn(
              "font-serif text-2xl transition-colors",
              transparent ? "text-paper" : "text-espresso",
            )}
          >
            Golden Eyes
          </span>
          <span
            className={cn(
              "text-[9px] uppercase tracking-editorial transition-colors",
              transparent ? "text-paper/70" : "text-gold-600",
            )}
          >
            Studio Photographique
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === ROUTES.home
                ? pathname === ROUTES.home
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-xs uppercase tracking-wider transition-colors",
                  transparent
                    ? "text-paper/80 hover:text-paper"
                    : isActive
                      ? "text-gold-600"
                      : "text-ink-muted hover:text-espresso",
                )}
              >
                {link.label}
                {isActive && !transparent && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 h-px w-full bg-gold-500"
                  />
                )}
              </Link>
            );
          })}
          <Link
            href={ROUTES.contact}
            className={cn(
              "rounded-full px-5 py-2 text-xs uppercase tracking-wider transition-all",
              transparent
                ? "bg-paper text-espresso hover:bg-gold-300"
                : "bg-espresso text-paper hover:bg-gold-500 hover:text-espresso",
            )}
          >
            Réserver
          </Link>
        </nav>

        {/* Burger mobile */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className={cn(
            "rounded-md p-2 transition md:hidden",
            transparent ? "text-paper" : "text-espresso",
          )}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-line bg-paper md:hidden"
          >
            <div className="flex flex-col px-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="border-b border-line py-4 text-sm uppercase tracking-wider text-ink-muted transition hover:text-gold-600"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={ROUTES.contact}
                className="my-4 rounded-full bg-espresso py-3 text-center text-xs uppercase tracking-wider text-paper"
              >
                Réserver une séance
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
