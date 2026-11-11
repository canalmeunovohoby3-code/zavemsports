"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/store/cart-provider";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const {
    items,
    drawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    subtotalCents,
    itemCount,
  } = useCart();
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Carrinho">
      <button
        type="button"
        aria-label="Fechar carrinho"
        onClick={closeDrawer}
        className="animate-fade absolute inset-0 h-full w-full cursor-default bg-black/35"
      />
      <aside className="animate-drawer absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col border-l border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={18} strokeWidth={1.7} />
            <span className="text-sm font-semibold">Sua sacola</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f2f2ee] px-1.5 text-[10px] font-semibold text-[#555]">
              {itemCount}
            </span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center border border-line text-ink transition hover:border-ink"
            aria-label="Fechar carrinho"
          >
            <X size={17} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f7f7f5] text-2xl">
              0
            </span>
            <p className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em]">
              Sua sacola está vazia
            </p>
            <p className="mt-2 max-w-[270px] text-sm leading-relaxed text-muted">
              Explore a coleção e encontre o seu próximo essencial.
            </p>
            <Link
              href="/catalogo"
              onClick={closeDrawer}
              className="btn btn-lime mt-7"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <ul className="space-y-5">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-4">
                    <Link
                      href={`/produto/${item.slug}`}
                      onClick={closeDrawer}
                      className="relative h-[112px] w-[88px] shrink-0 overflow-hidden bg-[#f4f4f1]"
                    >
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="88px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[9px] uppercase tracking-[0.12em] text-muted">
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
                            onClick={closeDrawer}
                            className="mt-1 block text-sm font-medium leading-snug text-ink transition hover:text-[#666]"
                          >
                            {item.name}
                          </Link>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="shrink-0 p-1 text-muted transition hover:text-danger"
                          aria-label={`Remover ${item.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p className="mt-1.5 text-[10px] uppercase tracking-[0.08em] text-muted">
                        Tamanho {item.size}
                      </p>
                      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                        <div className="flex h-8 items-center border border-line">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                            className="flex h-full w-8 items-center justify-center text-muted transition hover:text-ink"
                            aria-label={`Diminuir quantidade de ${item.name}`}
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-7 text-center text-xs tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            disabled={item.quantity >= Math.min(item.stock, 10)}
                            className="flex h-full w-8 items-center justify-center text-muted transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Aumentar quantidade de ${item.name}`}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">
                          {formatPrice(item.priceCents * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line px-5 pb-6 pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-display text-xl font-semibold tabular-nums">
                  {formatPrice(subtotalCents)}
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                Frete e prazo são informados após a confirmação do pedido.
                Preços e estoque são validados na finalização.
              </p>
              <div className="mt-5 grid gap-2">
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="btn btn-lime btn-block"
                >
                  Finalizar compra
                </Link>
                <Link
                  href="/carrinho"
                  onClick={closeDrawer}
                  className="btn btn-outline btn-block"
                >
                  Ver sacola
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
