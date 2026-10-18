import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { AuthCard } from "@/components/admin/AuthCard";

export const metadata = {
  title: "Connexion Admin",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthCard>
      <Suspense fallback={<div className="h-48 animate-pulse rounded-md bg-paper-warm" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
