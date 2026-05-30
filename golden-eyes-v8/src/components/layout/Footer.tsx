import Link from "next/link";
import { Instagram, Facebook, Mail, ArrowUpRight } from "lucide-react";
import { SITE_CONFIG, ROUTES } from "@/lib/constants";

/**
 * Footer sombre (espresso) — contraste avec le corps clair du site,
 * comme la dernière page d'un beau magazine.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-espresso text-paper">
      {/* Grand titre signature */}
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-12">
        <p className="eyebrow !text-gold-300 mb-6">Travaillons ensemble</p>
        <Link href={ROUTES.contact} className="group block">
          <h2 className="font-serif text-display-md text-paper transition-colors group-hover:text-gold-300">
            Racontons votre histoire
            <ArrowUpRight className="ml-2 inline h-8 w-8 -translate-y-1 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2" />
          </h2>
        </Link>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 border-t border-line-dark px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-serif text-3xl text-gold-300">{SITE_CONFIG.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper/60">
            {SITE_CONFIG.tagline}
          </p>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-editorial text-gold-300">
            Explorer
          </p>
          <ul className="space-y-2.5 text-sm text-paper/70">
            <li>
              <Link href={ROUTES.portfolio} className="transition hover:text-gold-300">
                Portfolio
              </Link>
            </li>
            <li>
              <Link href={ROUTES.about} className="transition hover:text-gold-300">
                À propos
              </Link>
            </li>
            <li>
              <Link href={ROUTES.contact} className="transition hover:text-gold-300">
                Réservation
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-editorial text-gold-300">
            Contact
          </p>
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="inline-flex items-center gap-2 text-sm text-paper/70 transition hover:text-gold-300"
          >
            <Mail className="h-4 w-4" />
            {SITE_CONFIG.email}
          </a>
          <div className="mt-5 flex gap-3">
            <a
              href={SITE_CONFIG.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full border border-line-dark p-2.5 text-paper/70 transition hover:border-gold-300 hover:text-gold-300"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={SITE_CONFIG.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="rounded-full border border-line-dark p-2.5 text-paper/70 transition hover:border-gold-300 hover:text-gold-300"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-line-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-[11px] text-paper/40 md:flex-row">
          <p>© {year} {SITE_CONFIG.name}. Tous droits réservés.</p>
          <p className="uppercase tracking-wider">Next.js · Supabase</p>
        </div>
      </div>
    </footer>
  );
}
