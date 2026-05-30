import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * Layout commun à toutes les pages publiques :
 * Header fixe en haut, contenu, Footer en bas.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="relative">{children}</main>
      <Footer />
    </>
  );
}
