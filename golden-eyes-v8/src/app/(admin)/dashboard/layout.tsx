import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Inbox, MessageSquare, Images } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(ROUTES.login);

  const navItems = [
    { href: ROUTES.dashboard, label: "Vue d'ensemble", icon: LayoutDashboard },
    { href: ROUTES.bookings, label: "Réservations", icon: Inbox },
    { href: ROUTES.messages, label: "Messages", icon: MessageSquare },
    { href: ROUTES.media, label: "Médias", icon: Images },
  ];

  return (
    <div className="min-h-screen bg-paper-warm">
      <header className="border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href={ROUTES.dashboard} className="flex flex-col leading-none">
            <span className="font-serif text-2xl text-espresso">Golden Eyes</span>
            <span className="text-[9px] uppercase tracking-editorial text-gold-600">
              Dashboard
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-ink-muted md:block">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
        <nav className="border-t border-line/60">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 py-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm text-ink-muted transition hover:bg-paper-pure hover:text-gold-600"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
