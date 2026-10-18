"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { ROUTES } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit({ email }: ForgotPasswordInput) {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=${ROUTES.resetPassword}`,
    });
    setIsLoading(false);

    if (error) {
      toast.error("Envoi impossible", { description: error.message });
      return;
    }
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <div className="space-y-5 text-center">
        <Mail className="mx-auto h-8 w-8 text-gold-600" />
        <p className="text-sm text-ink-muted">
          Si un compte existe pour <strong className="text-espresso">{sentTo}</strong>,
          un email contenant un lien de réinitialisation vient d&apos;être envoyé.
          Ouvrez-le <strong>dans ce même navigateur</strong>.
        </p>
        <p className="text-xs text-ink-faint">
          Pensez à vérifier les courriers indésirables.
        </p>
        <Link href={ROUTES.login} className="btn-ghost inline-flex">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <p className="text-sm text-ink-muted">
        Indiquez l&apos;email du compte administrateur : vous recevrez un lien
        pour choisir un nouveau mot de passe.
      </p>
      <Input label="Email" type="email" autoComplete="email"
        placeholder="admin@golden-eyes.eu" error={errors.email?.message}
        {...register("email")} />
      <Button type="submit" isLoading={isLoading} className="w-full">
        {!isLoading && <Mail className="h-4 w-4" />}
        {isLoading ? "Envoi…" : "Recevoir le lien"}
      </Button>
      <p className="text-center text-xs">
        <Link href={ROUTES.login} className="text-ink-faint transition hover:text-gold-600">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
