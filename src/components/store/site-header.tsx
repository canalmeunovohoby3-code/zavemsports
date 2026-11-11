"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { useCart } from "@/components/store/cart-provider";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/cn";

type SiteHeaderProps = {
  categories: Category[];
  logoUrl: string;
  announcement: string;
};

const mainLinks = [
  { label: "Início", href: "/" },
  { label: "Camisetas", href: "/catalogo?tipo=camiseta" },
  { label: "Bermudas", href: "/catalogo?tipo=bermuda" },
  { label: "Plus Size", href: "/catalogo?publico=plus" },
  { label: "Infantil", href: "/catalogo?publico=infantil" },
  { label: "Todos os produtos", href: "/catalogo" },
];

export function SiteHeader({
  categories,
  logoUrl,
  announcement,
}: SiteHeaderProps) {
  const { itemCount, openDrawer, closeDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const openCart = () => {
    setMobileOpen(false);
    openDrawer();
  };

  return (
    <>
      <div className="bg-black text-white">
        <div className="shell flex h-8 items-center justify-center gap-2.5">
          <span className="h-1 w-1 rounded-full bg-lime" />
          <p className="truncate text-[9px] font-medium uppercase tracking-[0.16em] text-white/85">
            {announcement}
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-line bg-white">
        <div className="shell flex h-[68px] items-center gap-4 lg:h-[76px] lg:gap-8">
          <button
            type="button"
            onClick={() => {
              closeDrawer();
              setMobileOpen(true);
            }}
            className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center text-ink lg:hidden"
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={21} />
          </button>

          <Link
            href="/"
            className="shrink-0 text-ink transition-opacity hover:opacity-70"
            aria-label="ZEVEN SPORTS — página inicial"
          >
            <BrandMark logoUrl={logoUrl} />
          </Link>

          <form
            action="/catalogo"
            className="relative hidden flex-1 items-center lg:flex lg:max-w-[560px]"
          >
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 text-muted"
            />
            <input
              type="search"
              name="q"
              aria-label="Buscar produtos"
              placeholder="O que você procura?"
              className="h-11 w-full rounded-sm border border-transparent bg-[#f4f4f1] py-2 pl-10 pr-24 text-sm text-ink outline-none transition placeholder:text-muted focus:border-ink focus:bg-white"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 h-9 bg-black px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-lime hover:text-black"
            >
              Buscar
            </button>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Link
              href="/conta"
              className="flex h-10 w-10 items-center justify-center text-ink transition hover:text-[#666]"
              aria-label="Acompanhar pedido"
            >
              <UserRound size={19} strokeWidth={1.7} />
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center text-ink transition hover:text-[#666]"
              aria-label={`Abrir sacola com ${itemCount} item(ns)`}
            >
              <ShoppingBag size={19} strokeWidth={1.7} />
              {itemCount > 0 ? (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime px-1 text-[9px] font-bold text-black">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <form
          action="/catalogo"
          className="shell relative flex items-center pb-3 lg:hidden"
        >
          <Search
            size={15}
            className="pointer-events-none absolute left-7 text-muted"
          />
          <input
            type="search"
            name="q"
            aria-label="Buscar produtos"
            placeholder="Buscar camisetas, bermudas, tamanhos…"
            className="h-10 w-full rounded-sm border border-line bg-[#f7f7f5] py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-ink focus:bg-white"
          />
        </form>

        <nav
          aria-label="Navegação principal"
          className="hidden border-t border-line-soft lg:block"
        >
          <div className="shell flex h-11 items-center gap-8">
            {mainLinks.map((item) => {
              const active = item.href === "/" && pathname === "/";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex h-full items-center text-[11px] font-medium tracking-[0.02em] transition hover:text-[#666]",
                    active ? "text-ink" : "text-ink/80",
                  )}
                >
                  {item.label}
                  {active ? (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-lime" />
                  ) : null}
                </Link>
              );
            })}
            <Link
              href="/sobre"
              className="ml-auto text-[11px] font-medium text-muted transition hover:text-ink"
            >
              Sobre a ZEVEN
            </Link>
          </div>
        </nav>
      </header>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[85] flex flex-col bg-white lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          <div className="flex h-[68px] items-center justify-between border-b border-line px-5">
            <BrandMark logoUrl={logoUrl} compact />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center border border-line text-ink"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-7">
            <nav aria-label="Menu mobile" className="space-y-7">
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Navegue
                </p>
                <div className="border-t border-line">
                  {mainLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between border-b border-line py-4 text-[15px] font-medium text-ink"
                    >
                      {item.label}
                      <ChevronRight size={16} className="text-muted" />
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Categorias
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categoria/${category.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="border border-line px-3 py-3 text-[11px] font-medium leading-tight text-soft transition hover:border-ink hover:text-ink"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-line pt-4">
                <Link
                  href="/sobre"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-3 text-sm font-medium text-ink"
                >
                  Sobre a ZEVEN
                  <ArrowUpRight size={15} />
                </Link>
                <Link
                  href="/conta"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-3 text-sm font-medium text-ink"
                >
                  Acompanhar pedido
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </nav>
          </div>

          <div className="mobile-bar border-t border-line bg-white px-5 py-4">
            <button
              type="button"
              onClick={openCart}
              className="btn btn-lime btn-block"
            >
              <ShoppingBag size={16} />
              Ver sacola ({itemCount})
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
