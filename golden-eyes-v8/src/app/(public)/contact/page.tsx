import { Mail, Clock, Globe } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { BookingForm } from "@/components/forms/BookingForm";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata = {
  title: "Contact & Réservation",
  description:
    "Réservez votre séance photo ou contactez-moi pour discuter de votre projet.",
};

const INFOS = [
  { icon: Mail, title: "Email", value: SITE_CONFIG.email, href: `mailto:${SITE_CONFIG.email}` },
  { icon: Clock, title: "Réponse", value: "Sous 48 heures" },
  { icon: Globe, title: "Langues", value: "Français, Anglais" },
];

export default function ContactPage() {
  return (
    <>
      <div className="h-28" />

      <section className="pb-24 pt-8">
        <Container size="lg">
          <SectionTitle
            eyebrow="Contact"
            title="Réservez votre séance."
            description="Remplissez ce formulaire et je reviens vers vous personnellement sous 48 heures. Le premier échange est toujours gratuit."
          />

          <div className="mt-16 grid gap-12 lg:grid-cols-[0.8fr,1.2fr] lg:gap-16">
            {/* Infos */}
            <aside className="space-y-4">
              {INFOS.map((info) => (
                <div
                  key={info.title}
                  className="rounded-xl border border-line bg-paper-pure p-5"
                >
                  <div className="flex items-center gap-3">
                    <info.icon className="h-5 w-5 text-gold-600" />
                    <p className="text-[10px] uppercase tracking-editorial text-ink-faint">
                      {info.title}
                    </p>
                  </div>
                  {info.href ? (
                    <a
                      href={info.href}
                      className="mt-2 block text-ink transition hover:text-gold-600"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="mt-2 text-ink">{info.value}</p>
                  )}
                </div>
              ))}

              <div className="rounded-xl bg-espresso p-6">
                <p className="text-[10px] uppercase tracking-editorial text-gold-300">
                  Bon à savoir
                </p>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">
                  Le premier échange est gratuit et sans engagement. Nous prenons
                  le temps de discuter de votre projet avant tout devis.
                </p>
              </div>
            </aside>

            {/* Formulaire */}
            <div className="rounded-2xl border border-line bg-paper-pure p-8 md:p-10">
              <BookingForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
