"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/store/cart-provider";
import type { ProductVariant } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

type PurchasePanelProps = {
  product: {
    id: number;
    name: string;
    slug: string;
    priceCents: number;
    compareAtCents: number | null;
    imageUrl: string;
    categoryName: string;
  };
  variants: ProductVariant[];
};

export function PurchasePanel({ product, variants }: PurchasePanelProps) {
  const { addItem } = useCart();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const selected = useMemo(
    () => variants.find((variant) => variant.id === selectedId) ?? null,
    [variants, selectedId],
  );
  const totalStock = useMemo(
    () => variants.reduce((total, variant) => total + variant.stock, 0),
    [variants],
  );
  const maxQuantity = selected ? Math.min(selected.stock, 10) : 1;
  const soldOut = totalStock <= 0;

  const handleAdd = () => {
    if (!selected || selected.stock <= 0) return;
    addItem(
      {
        variantId: selected.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        size: selected.size,
        priceCents: product.priceCents,
        imageUrl: product.imageUrl,
        stock: selected.stock,
      },
      quantity,
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2.5">
        <span className="font-display text-[30px] font-semibold tracking-[-0.04em] tabular-nums text-ink">
          {formatPrice(product.priceCents)}
        </span>
        {product.compareAtCents &&
        product.compareAtCents > product.priceCents ? (
          <span className="text-sm text-muted line-through">
            {formatPrice(product.compareAtCents)}
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 text-[10px] text-muted">
        PIX ou cartão de crédito · confirmação pela loja
      </p>

      <div className="mt-7 border-t border-line pt-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink">
            Tamanho
          </p>
          <Link
            href="/guia-de-tamanhos"
            className="text-[10px] text-muted underline underline-offset-2 transition hover:text-ink"
          >
            Guia de tamanhos
          </Link>
        </div>

        {variants.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Nenhum tamanho cadastrado para este produto.
          </p>
        ) : (
          <>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {variants.map((variant) => {
                const unavailable = variant.stock <= 0;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={unavailable}
                    data-selected={selectedId === variant.id}
                    onClick={() => {
                      setSelectedId(variant.id);
                      setQuantity(1);
                    }}
                    className="size-chip"
                    aria-label={`Tamanho ${variant.size}${unavailable ? ", esgotado" : ""}`}
                    title={unavailable ? "Sem estoque" : undefined}
                  >
                    {variant.size}
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-[10px] text-muted">
              Tamanhos riscados estão esgotados.
            </p>
          </>
        )}

        {selected ? (
          <p
            className={cn(
              "mt-3 text-[11px]",
              selected.stock <= 3 ? "text-[var(--color-warning)]" : "text-[var(--color-success)]",
            )}
          >
            {selected.stock <= 3
              ? `Últimas ${selected.stock} unidades no tamanho ${selected.size}.`
              : `Tamanho ${selected.size} disponível em estoque.`}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink">
            Quantidade
          </p>
          <div className="flex h-12 items-center border border-[#d9d9d4] bg-white">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={quantity <= 1}
              className="flex h-full w-10 items-center justify-center text-muted transition hover:text-ink disabled:opacity-30"
              aria-label="Diminuir quantidade"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                setQuantity((value) => Math.min(maxQuantity, value + 1))
              }
              disabled={!selected || quantity >= maxQuantity}
              className="flex h-full w-10 items-center justify-center text-muted transition hover:text-ink disabled:opacity-30"
              aria-label="Aumentar quantidade"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected || soldOut}
          className="btn btn-lime h-12 flex-1 disabled:border-[#e4e4df] disabled:bg-[#f2f2ee] disabled:text-[#8b8b86] disabled:opacity-100"
        >
          <ShoppingBag size={16} />
          {soldOut
            ? "Produto esgotado"
            : selected
              ? "Adicionar à sacola"
              : "Selecione um tamanho"}
        </button>
      </div>

      {!soldOut ? (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-muted">
          <span>Estoque validado no pedido</span>
          <span className="h-1 w-1 self-center rounded-full bg-lime" />
          <span>Compra acompanhada</span>
        </div>
      ) : null}
    </div>
  );
}
