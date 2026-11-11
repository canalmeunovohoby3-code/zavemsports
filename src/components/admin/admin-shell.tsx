"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { logoutAction } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

type AdminShellProps = {
  user: { name: string; email: string };
  logoUrl: string;
  children: React.ReactNode;
};

const navigation = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Layers },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/conta", label: "Conta e segurança", icon: KeyRound },
];

export function AdminShell({ user, logoUrl, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const nav = (
    <nav aria-label="Menu administrativo" className="space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "relative flex items-center gap-3 border border-transparent px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] transition",
              active
                ? "border-line bg-raised text-white"
                : "text-muted hover:bg-surface hover:text-white",
            )}
          >
            {active ? (
              <span className="absolute left-0 top-0 h-full w-[2px] bg-lime" />
            ) : null}
            <Icon
              size={16}
              strokeWidth={active ? 2 : 1.6}
              className={active ? "text-lime" : ""}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-coal">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-line bg-ink lg:flex">
        <div className="border-b border-line px-6 py-6">
          <Link href="/admin" aria-label="ZEVEN Admin">
            <BrandMark logoUrl={logoUrl} compact onDark />
          </Link>
          <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.24em] text-muted">
            Painel administrativo
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">{nav}</div>

        <div className="border-t border-line p-4">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted transition hover:text-lime"
          >
            Ver loja
            <ExternalLink size={13} />
          </Link>
          <div className="mt-3 border border-line bg-surface p-3">
            <p className="truncate text-xs font-medium text-white">{user.name}</p>
            <p className="mt-0.5 truncate text-[10px] text-muted">{user.email}</p>
            <form action={logoutAction} className="mt-3">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 border border-line py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted transition hover:border-danger/50 hover:text-danger"
              >
                <LogOut size={12} />
                Sair do painel
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-line bg-ink/95 px-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center border border-line text-white"
              aria-label="Abrir menu administrativo"
            >
              <Menu size={18} />
            </button>
            <BrandMark logoUrl={logoUrl} compact onDark />
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted"
          >
            Ver loja
          </Link>
        </header>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <aside className="animate-drawer absolute inset-y-0 left-0 flex w-[290px] flex-col border-r border-line bg-ink">
              <div className="flex items-center justify-between border-b border-line px-5 py-5">
                <BrandMark logoUrl={logoUrl} compact onDark />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center border border-line text-white"
                  aria-label="Fechar menu"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{nav}</div>
              <div className="border-t border-line p-4">
                <div className="border border-line bg-surface p-3">
                  <p className="truncate text-xs text-white">{user.name}</p>
                  <p className="truncate text-[10px] text-muted">{user.email}</p>
                  <form action={logoutAction} className="mt-3">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 border border-line py-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted"
                    >
                      <LogOut size={12} />
                      Sair
                    </button>
                  </form>
                </div>
              </div>
            </aside>
          </div>
        ) : null}

        <main className="min-h-screen">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-7 md:py-8 xl:px-10">
            {children}
          </div>
          <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between px-4 pb-8 text-[9px] uppercase tracking-[0.12em] text-muted md:px-7 xl:px-10">
            <span>ZEVEN SPORTS · Administração</span>
            <span className="flex items-center gap-1.5">
              <ShoppingBag size={11} />
              Loja protegida
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}

