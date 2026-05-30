import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="eyebrow justify-center">Erreur 404</p>
      <h1 className="mt-6 font-serif text-display-md text-espresso">
        Page introuvable
      </h1>
      <p className="mt-4 max-w-md text-ink-muted">
        L&apos;objectif s&apos;est égaré. Retournons vers la lumière.
      </p>
      <Link href="/" className="btn-primary mt-10">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
