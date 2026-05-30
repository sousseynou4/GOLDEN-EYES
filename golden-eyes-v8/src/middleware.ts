import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware racine de Golden Eyes.
 * S'exécute avant chaque requête correspondant au `matcher` ci-dessous.
 * Rafraîchit la session Supabase et protège les routes admin.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match toutes les requêtes SAUF :
     *   - _next/static (assets statiques)
     *   - _next/image  (optimiseur d'images)
     *   - favicon.ico
     *   - fichiers binaires (.svg, .png, .jpg, .webm, .mp4, ...)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4|woff2?)$).*)",
  ],
};
