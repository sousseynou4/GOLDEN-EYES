import { AuthCard } from "@/components/admin/AuthCard";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";

export const metadata = {
  title: "Mot de passe oublié",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard subtitle="Mot de passe oublié">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
