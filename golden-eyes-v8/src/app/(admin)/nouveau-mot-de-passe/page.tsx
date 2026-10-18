import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";
import { AuthCard } from "@/components/admin/AuthCard";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";

export const metadata = {
  title: "Nouveau mot de passe",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * Accessible après avoir cliqué sur le lien de réinitialisation reçu
 * par email, ou depuis le dashboard pour changer son mot de passe.
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthCard subtitle="Nouveau mot de passe">
      {user?.email ? (
        <ResetPasswordForm email={user.email} />
      ) : (
        <div className="space-y-5 text-center">
          <p className="text-sm text-ink-muted">
            Ce lien a expiré ou a déjà été utilisé. Faites une nouvelle demande
            de réinitialisation.
          </p>
          <Link href={ROUTES.forgotPassword} className="btn-primary inline-flex">
            Nouvelle demande
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
