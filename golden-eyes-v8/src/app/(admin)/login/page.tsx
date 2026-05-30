import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = {
  title: "Connexion Admin",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-warm px-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl text-espresso">Golden Eyes</h1>
          <p className="mt-2 text-[10px] uppercase tracking-editorial text-gold-600">
            Espace Administrateur
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-paper-pure p-8">
          <Suspense fallback={<div className="h-48 animate-pulse rounded-md bg-paper-warm" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
