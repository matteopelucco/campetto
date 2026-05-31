"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  IconLayoutDashboard,
  IconUsers,
  IconTrophy,
  IconHeartbeat,
  IconCreditCard,
  IconCalendar,
  IconLogout,
} from "@tabler/icons-react";

const navItems = [
  { label: "Dashboard",      href: "/dashboard",   icon: IconLayoutDashboard },
  { label: "Giocatori",      href: "/giocatori",   icon: IconUsers },
  { label: "Squadre",        href: "/squadre",     icon: IconTrophy },
  { label: "Visite Mediche", href: "/visite",      icon: IconHeartbeat },
  { label: "Pagamenti",      href: "/pagamenti",   icon: IconCreditCard },
  { label: "Scadenzario",    href: "/scadenzario", icon: IconCalendar },
];

function pageTitle(pathname: string): string {
  return navItems.find((n) => pathname.startsWith(n.href))?.label ?? "Campetto";
}

function formatDate(): string {
  return new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0d1209" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 w-60 h-full"
        style={{ background: "#131a0f" }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: "#f0b429" }}
          >
            Campetto ⚽
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-100
                  ${active
                    ? "text-white border-l-2 pl-[10px]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border-l-2 border-transparent pl-[10px]"
                  }
                `}
                style={active ? { color: "#4caf50", borderColor: "#4caf50", background: "rgba(76,175,80,0.08)" } : {}}
              >
                <Icon size={18} stroke={1.75} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          >
            <IconLogout size={18} stroke={1.75} />
            Esci
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between flex-shrink-0 h-14 px-6 border-b border-white/5"
          style={{ background: "#0d1209" }}
        >
          <h1 className="text-base font-semibold text-white">
            {pageTitle(pathname)}
          </h1>
          <span className="text-xs text-zinc-500 capitalize">{formatDate()}</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
