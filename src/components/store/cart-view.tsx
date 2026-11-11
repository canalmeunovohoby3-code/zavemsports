"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/store/cart-provider";
import { formatPrice } from "@/lib/format";
import { SHIPPING_PENDING_LABEL, SHIPPING_NOTICE } from "@/lib/shipping";

export function CartView() {
  const {
    items,
    isReady,
    updateQuantity,
    removeItem,
    subtotalCents,
    itemCount,
  } = useCart();

  if (!isReady) {
    return (
      <div className="shell py-16">
        <div className="h-8 w-44 animate-pulse bg-[#f2f2ee]" />
        <div className="mt-8 h-[260px] animate-pulse border border-line bg-[#f7f7f5]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="shell py-14 md:py-20">
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted">
          <Link href="/" className="transition hover:text-ink">
            Início
          </Link>
          <span>/</span>
          <span className="text-[#555]">Sacola</span>
        </nav>
        <div className="mt-7 border border-line bg-[#f7f7f5] p-8 md:p-14">
          <span className="flex h-12 w-12 items-center justify-center border border-line bg-white">
            <ShoppingBag size={20} strokeWidth={1.6} />
          </span>
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-[-0.035em] text-ink">
            Sua sacola está vazia
          </h1>
          <p className="mt-3 max-w-[430px] text-sm leading-relaxed text-muted">
            Explore as categorias e encontre o seu próximo essencial ZEVEN.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Link href="/catalogo" className="btn btn-lime">
              Ver produtos
              <ArrowRight size={14} />
            </Link>
            <Link href="/guia-de-tamanhos" className="btn btn-outline">
              Guia de tamanhos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-8 md:py-12">
      <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted">
        <Link href="/" className="transition hover:text-ink">
          Início
        </Link>
        <span>/</span>
        <span className="text-[#555]">Sacola</span>
      </nav>

      <header className="mt-7 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Sua seleção
          </p>
          <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.04em] text-ink">
            Minha sacola
          </h1>
        </div>
        <p className="text-xs text-muted">
          {itemCount} {itemCount === 1 ? "item" : "itens"}
        </p>
      </header>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
        <div className="border-t border-line">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 border-b border-line py-5 md:gap-6"
            >
              <Link
                href={`/produto/${item.slug}`}
                className="relative h-[128px] w-[100px] shrink-0 overflow-hidden bg-[#f4f4f1] md:h-[150px] md:w-[120px]"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center px-2 text-center text-[9px] uppercase tracking-[0.12em] text-muted">
                    ZEVEN
                  </span>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
                      ZEVEN SPORTS
                    </p>
                    <Link
                      href={`/produto/${item.slug}`}
                      className="mt-1 block font-display text-base font-medium leading-snug text-ink transition hover:text-[#666] md:text-lg"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1.5 text-[10px] text-muted">
                      Tamanho {item.size}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    className="shrink-0 p-1 text-muted transition hover:text-danger"
                    aria-label={`Remover ${item.name} do carrinho`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-4">
                  <div className="flex h-10 items-center border border-line bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="flex h-full w-9 items-center justify-center text-muted transition hover:text-ink"
                      aria-label={`Diminuir quantidade de ${item.name}`}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-xs tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      disabled={item.quantity >= Math.min(item.stock, 10)}
                      className="flex h-full w-9 items-center justify-center text-muted transition hover:text-ink disabled:opacity-30"
                      aria-label={`Aumentar quantidade de ${item.name}`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted">
                      {formatPrice(item.priceCents)} / un.
                    </p>
                    <p className="mt-1 text-sm font-semibold tabular-nums text-ink">
                      {formatPrice(item.priceCents * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="py-5">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 text-[10px] font-medium text-[#555] transition hover:text-ink"
            >
              <ArrowLeft size={13} />
              Continuar comprando
            </Link>
          </div>
        </div>

        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="border border-line bg-[#f7f7f5] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">
              Resumo
            </p>
            <div className="mt-5 space-y-3 border-b border-line pb-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotalCents)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Frete</span>
                <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-warning)]">
                  {SHIPPING_PENDING_LABEL}
                </span>
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink">
                Total dos produtos
              </span>
              <span className="font-display text-2xl font-semibold tabular-nums text-ink">
                {formatPrice(subtotalCents)}
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-muted">
              {SHIPPING_NOTICE}
            </p>
            <Link href="/checkout" className="btn btn-lime btn-block mt-5">
              Finalizar compra
              <ArrowRight size={14} />
            </Link>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-muted">
              Estoque e preços são confirmados na finalização.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
