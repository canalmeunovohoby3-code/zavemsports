import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/types";
import { formatPrice } from "@/lib/format";

type ProductCardProps = {
  product: ProductSummary;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const soldOut = product.totalStock <= 0;
  const hasDiscount =
    product.compareAtCents != null &&
    product.compareAtCents > product.priceCents;
  const visibleSizes = product.sizes.slice(0, 4);
  const extraSizes = Math.max(0, product.sizes.length - visibleSizes.length);

  return (
    <article className="group flex h-full flex-col border border-line bg-white">
      <Link href={`/produto/${product.slug}`} className="flex h-full flex-col">
        <div className="product-media relative aspect-[3/4]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                ZEVEN SPORTS
              </span>
              <div>
                <p className="font-display text-xl font-semibold leading-tight text-ink/65">
                  {product.categoryName}
                </p>
                <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-muted">
                  Imagem em breve
                </p>
              </div>
            </div>
          )}

          <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            {hasDiscount && !soldOut ? (
              <span className="tag tag-lime">Oferta</span>
            ) : null}
            {soldOut ? <span className="tag tag-black">Esgotado</span> : null}
          </div>

        </div>

        <div className="flex flex-1 flex-col p-3 md:p-3.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
            {product.categoryName}
          </p>
          <h3 className="mt-1.5 font-display text-[14px] font-medium leading-snug tracking-[-0.01em] text-ink md:text-[15px]">
            {product.name}
          </h3>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[14px] font-semibold tabular-nums text-ink">
              {formatPrice(product.priceCents)}
            </span>
            {hasDiscount ? (
              <span className="text-[11px] text-muted line-through">
                {formatPrice(product.compareAtCents!)}
              </span>
            ) : null}
          </div>

          <p className="mt-1.5 min-h-[15px] text-[10px] text-muted">
            {soldOut
              ? "Indisponível"
              : visibleSizes.length > 0
                ? `Tam. ${visibleSizes.join(" · ")}${extraSizes ? ` +${extraSizes}` : ""}`
                : "Consulte tamanhos"}
          </p>

          <span className="mt-3 flex h-9 items-center justify-center border border-line text-[9px] font-semibold uppercase tracking-[0.1em] text-ink transition group-hover:border-black group-hover:bg-black group-hover:text-white">
            Ver produto
          </span>
        </div>
      </Link>
    </article>
  );
}
