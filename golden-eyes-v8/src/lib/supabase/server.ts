import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Type d'un cookie tel que renvoyé/attendu par @supabase/ssr.
 * Déclaré explicitement pour éviter les "implicit any" sous strict mode.
 */
type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Client Supabase pour le serveur :
 *   - Server Components
 *   - Server Actions
 *   - Route Handlers (API)
 *
 * Lit / écrit la session via les cookies Next.js.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // `setAll` est appelé depuis un Server Component :
            // on ignore l'erreur — c'est le middleware qui rafraîchit la session.
          }
        },
      },
    },
  );
}
