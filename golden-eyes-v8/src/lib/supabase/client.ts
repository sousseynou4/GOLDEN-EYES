import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client Supabase à utiliser uniquement côté navigateur
 * (Client Components, hooks, event handlers).
 *
 * Pour les Server Components / Server Actions / Route Handlers,
 * utiliser `@/lib/supabase/server`.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
