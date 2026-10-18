"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { ROUTES } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit({ password }: ResetPasswordInput) {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error("Modification impossible", { description: error.message });
      setIsLoading(false);
      return;
    }
    toast.success("Mot de passe modifié");
    router.push(ROUTES.dashboard);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <p className="text-sm text-ink-muted">
        Compte : <strong className="text-espresso">{email}</strong>
      </p>
      <Input label="Nouveau mot de passe" type="password" autoComplete="new-password"
        placeholder="••••••••••" hint="10 caractères minimum"
        error={errors.password?.message} {...register("password")} />
      <Input label="Confirmer le mot de passe" type="password" autoComplete="new-password"
        placeholder="••••••••••" error={errors.confirm?.message}
        {...register("confirm")} />
      <Button type="submit" isLoading={isLoading} className="w-full">
        {!isLoading && <KeyRound className="h-4 w-4" />}
        {isLoading ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </Button>
    </form>
  );
}
