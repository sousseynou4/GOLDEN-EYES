"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion", { description: error.message });
      return;
    }
    toast.success("Déconnecté");
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs uppercase tracking-wider text-ink-muted transition hover:border-espresso hover:text-espresso"
      aria-label="Se déconnecter"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Déconnexion</span>
    </button>
  );
}
