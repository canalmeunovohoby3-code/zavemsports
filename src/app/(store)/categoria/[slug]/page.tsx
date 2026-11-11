import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { audienceLabels } from "@/config/site";
import { getCategoryImage } from "@/config/editorial";
import {
  getStoreAvailableSizesByCategory,
  getStoreCategories,
  getStoreCategoryBySlug,
  getStoreProducts,
} from "@/lib/storefront";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getStoreCategoryBySlug(slug);
  if (!category) return { title: "Categoria não encontrada" };
  return {
    title: category.name,
    description: category.description,
  };
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const raw = await searchParams;
  const category = await getStoreCategoryBySlug(slug);
  if (!category) notFound();

  const size = first(raw.tamanho)?.trim() ?? "";
  const sortParam = first(raw.ordem);
  const sort =
    sortParam === "menor-preco"
      ? "price-asc"
      : sortParam === "maior-preco"
        ? "price-desc"
        : sortParam === "nome"
          ? "name"
          : "recent";

  const allCategories = await getStoreCategories();
  const availableSizes = await getStoreAvailableSizesByCategory(category.id);
  const products = await getStoreProducts({
    categoryId: category.id,
    size: size || undefined,
    sort,
    limit: 200,
  });
  const image = getCategoryImage(category.slug, category.imageUrl);
  const kindLabel = category.kind === "camiseta" ? "Camisetas" : "Bermudas";

  const hrefFor = (overrides: Record<string, string | undefined>) => {
    const search = new URLSearchParams();
    const merged = { tamanho: size || undefined, ordem: sortParam, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value) search.set(key, value);
    }
    const query = search.toString();
    return `/categoria/${category.slug}${query ? `?${query}` : ""}`;
  };

  const sortOptions = [
    {
      value: "recentes",
      label: "Mais recentes",
      active: sortParam == null || sortParam === "recentes",
    },
    {
      value: "menor-preco",
      label: "Menor preço",
      active: sortParam === "menor-preco",
    },
    {
      value: "maior-preco",
      label: "Maior preço",
      active: sortParam === "maior-preco",
    },
    { value: "nome", label: "A–Z", active: sortParam === "nome" },
  ];

  return (
    <div className="bg-white">
      <div className="shell py-8 md:py-10">
        <nav
          aria-label="Trilha de navegação"
          className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted"
        >
          <Link href="/" className="transition hover:text-ink">
            Início
          </Link>
          <span>/</span>
          <Link href="/catalogo" className="transition hover:text-ink">
            Produtos
          </Link>
          <span>/</span>
          <span className="text-[#555]">{category.name}</span>
        </nav>

        <section className="mt-6 grid overflow-hidden border border-line bg-[#f7f7f5] md:grid-cols-[1.05fr_0.95fr]">
          <div className="flex items-center px-6 py-9 md:px-9 md:py-12">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                {audienceLabels[category.audience]} · {kindLabel}
              </p>
              <h1 className="mt-2 font-display text-[clamp(2.2rem,4.8vw,4rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-ink">
                {category.name}
              </h1>
              <p className="mt-3 max-w-[460px] text-sm leading-relaxed text-[#5d5d5d]">
                {category.description}
              </p>
              <p className="mt-5 text-xs text-muted">
                {products.length} {products.length === 1 ? "produto" : "produtos"}
              </p>
            </div>
          </div>
          <div className="relative min-h-[240px] md:min-h-[300px]">
            <Image
              src={image}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-4 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            {allCategories.map((item) => (
              <Link
                key={item.id}
                href={`/categoria/${item.slug}`}
                className={cn(
                  "shrink-0 border px-3 py-1.5 text-[10px] font-medium transition",
                  item.id === category.id
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-[#555] hover:border-ink",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            {availableSizes.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase tracking-[0.1em] text-muted">
                  Tamanho
                </span>
                {availableSizes.map((availableSize) => (
                  <Link
                    key={availableSize}
                    href={hrefFor({
                      tamanho:
                        size === availableSize ? undefined : availableSize,
                    })}
                    className={cn(
                      "flex h-7 min-w-7 items-center justify-center border px-1.5 text-[9px] font-medium transition",
                      size === availableSize
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-white text-[#555] hover:border-ink",
                    )}
                  >
                    {availableSize}
                  </Link>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] uppercase tracking-[0.1em]">
              <span className="text-muted">Ordenar</span>
              {sortOptions.map((option) => (
                <Link
                  key={option.value}
                  href={hrefFor({
                    tamanho: size || undefined,
                    ordem: option.value === "recentes" ? undefined : option.value,
                  })}
                  className={cn(
                    "transition hover:text-ink",
                    option.active ? "font-semibold text-ink" : "text-muted",
                  )}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="mt-7 border border-line bg-[#f7f7f5] p-8 md:p-12">
            <p className="font-display text-5xl font-semibold leading-none text-[#d8d8d2]">
              00
            </p>
            <h2 className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
              {size
                ? "Nenhum produto disponível neste tamanho."
                : "Esta linha está sendo preparada."}
            </h2>
            <p className="mt-3 max-w-[500px] text-sm leading-relaxed text-muted">
              {size
                ? "Remova o filtro de tamanho ou confira as outras peças do catálogo."
                : "As peças desta categoria serão publicadas pela loja em breve."}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link href="/catalogo" className="btn btn-black">
                Ver catálogo
                <ArrowRight size={14} />
              </Link>
              {size ? (
                <Link href={`/categoria/${category.slug}`} className="btn btn-outline">
                  Limpar filtro
                </Link>
              ) : (
                <Link href="/guia-de-tamanhos" className="btn btn-outline">
                  Guia de tamanhos
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-5">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#555] transition hover:text-ink"
          >
            <ArrowUpRight size={12} className="rotate-[-135deg]" />
            Todos os produtos
          </Link>
          <Link
            href="/guia-de-tamanhos"
            className="text-[10px] font-medium text-muted transition hover:text-ink"
          >
            Guia de tamanhos
          </Link>
        </div>
      </div>
    </div>
  );
}
