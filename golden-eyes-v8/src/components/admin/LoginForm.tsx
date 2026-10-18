"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { ROUTES } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      toast.error("Connexion échouée", { description: error.message });
      setIsLoading(false);
      return;
    }
    toast.success("Connexion réussie");
    router.push(searchParams.get("redirectedFrom") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {searchParams.get("error") === "lien-invalide" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          Le lien de réinitialisation est invalide ou a expiré. Refaites une
          demande via « Mot de passe oublié ».
        </p>
      )}
      <Input label="Email" type="email" autoComplete="email"
        placeholder="admin@golden-eyes.fr" error={errors.email?.message}
        {...register("email")} />
      <Input label="Mot de passe" type="password" autoComplete="current-password"
        placeholder="••••••••" error={errors.password?.message}
        {...register("password")} />
      <div className="-mt-2 text-right">
        <Link href={ROUTES.forgotPassword}
          className="text-xs text-ink-muted transition hover:text-gold-600">
          Mot de passe oublié ?
        </Link>
      </div>
      <Button type="submit" isLoading={isLoading} className="w-full">
        {!isLoading && <LogIn className="h-4 w-4" />}
        {isLoading ? "Connexion…" : "Se connecter"}
      </Button>
      <p className="text-center text-xs text-ink-faint">
        Espace réservé au photographe.
      </p>
    </form>
  );
}
