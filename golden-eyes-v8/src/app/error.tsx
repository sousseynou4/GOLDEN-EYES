"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="eyebrow justify-center !text-red-500">Erreur</p>
      <h1 className="mt-6 font-serif text-display-md text-espresso">
        Une ombre inattendue
      </h1>
      <p className="mt-4 max-w-md text-ink-muted">
        Quelque chose s&apos;est mal passé. Réessaie dans un instant.
      </p>
      <button onClick={reset} className="btn-primary mt-10">
        Réessayer
      </button>
    </main>
  );
}
