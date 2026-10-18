/**
 * Mise en page commune des écrans d'authentification admin
 * (connexion, mot de passe oublié, nouveau mot de passe).
 */
export function AuthCard({
  subtitle = "Espace Administrateur",
  children,
}: {
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-warm px-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl text-espresso">Golden Eyes</h1>
          <p className="mt-2 text-[10px] uppercase tracking-editorial text-gold-600">
            {subtitle}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-paper-pure p-8">{children}</div>
      </div>
    </div>
  );
}
