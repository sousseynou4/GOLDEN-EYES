/**
 * Layout des routes admin (groupe `(admin)`).
 * Sert de conteneur neutre — la protection auth se fait :
 *   1. Au niveau du middleware (`src/middleware.ts`)
 *   2. Re-vérifiée dans `dashboard/layout.tsx` (defense-in-depth)
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
