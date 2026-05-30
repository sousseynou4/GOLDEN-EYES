"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
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
      <Input label="Email" type="email" autoComplete="email"
        placeholder="admin@golden-eyes.fr" error={errors.email?.message}
        {...register("email")} />
      <Input label="Mot de passe" type="password" autoComplete="current-password"
        placeholder="••••••••" error={errors.password?.message}
        {...register("password")} />
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
