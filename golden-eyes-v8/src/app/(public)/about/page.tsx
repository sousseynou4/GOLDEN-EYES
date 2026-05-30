import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ROUTES } from "@/lib/constants";
import { DEMO_PORTRAIT } from "@/lib/demo-content";

export const metadata = {
  title: "À propos",
  description: "Photographe indépendant — démarche, valeurs et parcours.",
};

const SERVICES = [
  {
    title: "Mariages",
    description:
      "Couverture complète, de la préparation au dernier verre. Un récit sincère de votre journée.",
  },
  {
    title: "Portraits",
    description:
      "Individuels, en famille ou en couple. En studio comme en lumière naturelle.",
  },
  {
    title: "Reportages",
    description:
      "Événements, vie d'équipe, artisanat, projets d'auteur. Là où il y a une histoire.",
  },
];

const PROCESS = [
  { step: "01", title: "Échange", text: "Vous décrivez votre projet via le formulaire." },
  { step: "02", title: "Rencontre", text: "Je vous recontacte sous 48h, sans engagement." },
  { step: "03", title: "Devis", text: "Une proposition détaillée et personnalisée." },
  { step: "04", title: "Séance", text: "Le grand jour — détendu et sur-mesure." },
  { step: "05", title: "Livraison", text: "Vos photos sous 2 à 4 semaines, en galerie privée." },
];

export default function AboutPage() {
  return (
    <>
      <div className="h-28" />

      {/* Intro avec photo */}
      <section className="pb-20 pt-8">
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
            <div>
              <SectionTitle
                eyebrow="À propos"
                title="Photographier, c'est apprendre à regarder."
              />
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink-muted">
                <p>
                  Je suis photographe indépendant, basé en France, et j&apos;ai
                  fait du temps mon principal outil. Le temps de
                  l&apos;observation, de la confiance, et de la lumière qui
                  descend juste comme il faut.
                </p>
                <p>
                  Mon approche est documentaire avant d&apos;être stylisée. Je
                  préfère un éclat de rire vrai à une pose répétée. Cela vaut
                  pour les mariages, les portraits, les reportages — partout où
                  il y a une histoire à raconter avec justesse.
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src={DEMO_PORTRAIT}
                alt="Le photographe"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Services */}
      <section className="bg-paper-warm py-24">
        <Container>
          <SectionTitle eyebrow="Ce que je propose" title="Trois terrains de jeu." />
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {SERVICES.map((service) => (
              <div
                key={service.title}
                className="bg-paper-pure p-8 transition-colors hover:bg-paper"
              >
                <h3 className="font-serif text-2xl text-espresso">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Process */}
      <section className="py-24">
        <Container>
          <SectionTitle eyebrow="Comment ça se passe" title="Un parcours en cinq temps." />
          <div className="mt-14 space-y-px overflow-hidden rounded-2xl border border-line bg-line">
            {PROCESS.map((p) => (
              <div
                key={p.step}
                className="flex items-baseline gap-6 bg-paper-pure p-6 transition-colors hover:bg-paper md:gap-10 md:p-8"
              >
                <span className="font-serif text-3xl text-gold-300 md:text-4xl">
                  {p.step}
                </span>
                <div>
                  <h3 className="font-serif text-xl text-espresso">{p.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{p.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href={ROUTES.contact} className="btn-primary inline-flex">
              Réserver une séance
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
