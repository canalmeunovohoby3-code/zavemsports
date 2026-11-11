import Link from "next/link";
import { ArrowUpRight, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { audienceLabels, type Audience, type CategoryKind } from "@/config/site";
import {
  getStoreAvailableSizes,
  getStoreCategories,
  getStoreProducts,
} from "@/lib/storefront";
import { cn } from "@/lib/cn";

export const metadata = {
  title: "Todos os produtos",
  description:
    "Explore camisetas, bermudas, plus size e linha infantil da ZEVEN SPORTS.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseAudience(value: string | undefined): Audience | undefined {
  return value === "adulto" || value === "plus" || value === "infantil"
    ? value
    : undefined;
}

function parseKind(value: string | undefined): CategoryKind | undefined {
  return value === "camiseta" || value === "bermuda" ? value : undefined;
}

function buildHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return `/catalogo${query ? `?${query}` : ""}`;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams;
  const audience = parseAudience(first(raw.publico));
  const kind = parseKind(first(raw.tipo));
  const query = first(raw.q)?.trim() ?? "";
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

  const categories = await getStoreCategories();
  const availableSizes = await getStoreAvailableSizes();
  const products = await getStoreProducts({
    audience,
    kind,
    query: query || undefined,
    size: size || undefined,
    sort,
    limit: 200,
  });

  const typeLabel =
    kind === "camiseta" ? "Camisetas" : kind === "bermuda" ? "Bermudas" : "";
  const title = query
    ? "Busca"
    : typeLabel && audience
      ? `${typeLabel} ${audienceLabels[audience]}`
      : typeLabel
        ? typeLabel
        : audience
          ? audienceLabels[audience]
          : "Todos os produtos";

  const baseParams = {
    publico: audience,
    tipo: kind,
    q: query || undefined,
    tamanho: size || undefined,
    ordem: sortParam,
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
      <div className="shell py-8 md:py-12">
        <nav
          aria-label="Trilha de navegação"
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted"
        >
          <Link href="/" className="transition hover:text-ink">
            Início
          </Link>
          <span>/</span>
          <span className="text-[#555]">Produtos</span>
        </nav>

        <header className="mt-7 flex flex-col gap-5 border-b border-line pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Catálogo ZEVEN
            </p>
            <h1 className="mt-2 font-display text-[clamp(2.2rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-ink">
              {query ? `Resultados para “${query}”` : title}
            </h1>
            <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-muted">
              {query
                ? "Confira os produtos encontrados e refine a busca se precisar."
                : "Camisetas, bermudas, plus size e infantil. Filtre por linha, tamanho e preço para encontrar o que procura."}
            </p>
          </div>
          <p className="shrink-0 text-xs text-muted">
            {products.length} {products.length === 1 ? "produto" : "produtos"}
          </p>
        </header>

        <div className="mt-7 grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-36 space-y-7">
              <div className="border border-line bg-[#f7f7f5] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">
                    Filtrar
                  </p>
                  <SlidersHorizontal size={14} className="text-muted" />
                </div>

                <div className="mt-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Linha
                  </p>
                  <ul className="mt-2.5 space-y-0.5">
                    <li>
                      <Link
                        href={buildHref({
                          q: query || undefined,
                          tipo: kind,
                          tamanho: size || undefined,
                          ordem: sortParam,
                        })}
                        className={cn(
                          "flex items-center justify-between py-1.5 text-xs transition",
                          !audience ? "font-semibold text-ink" : "text-[#555] hover:text-ink",
                        )}
                      >
                        Todas
                        {!audience ? <span className="h-1.5 w-1.5 rounded-full bg-lime" /> : null}
                      </Link>
                    </li>
                    {(["adulto", "plus", "infantil"] as const).map((item) => (
                      <li key={item}>
                        <Link
                          href={buildHref({
                            publico: item,
                            tipo: kind,
                            q: query || undefined,
                            tamanho: size || undefined,
                            ordem: sortParam,
                          })}
                          className={cn(
                            "flex items-center justify-between py-1.5 text-xs transition",
                            audience === item
                              ? "font-semibold text-ink"
                              : "text-[#555] hover:text-ink",
                          )}
                        >
                          {audienceLabels[item]}
                          {audience === item ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 border-t border-line pt-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Categorias
                  </p>
                  <ul className="mt-2.5 space-y-0.5">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          href={`/categoria/${category.slug}`}
                          className="flex items-center justify-between gap-2 py-1.5 text-xs text-[#555] transition hover:text-ink"
                        >
                          <span>{category.name}</span>
                          <span className="text-[9px] text-muted">{category.productCount}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {availableSizes.length > 0 ? (
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Tamanhos
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {availableSizes.map((availableSize) => (
                        <Link
                          key={availableSize}
                          href={buildHref({
                            ...baseParams,
                            tamanho:
                              size === availableSize ? undefined : availableSize,
                          })}
                          className={cn(
                            "flex h-8 min-w-8 items-center justify-center border px-2 text-[10px] font-medium transition",
                            size === availableSize
                              ? "border-ink bg-ink text-white"
                              : "border-line bg-white text-[#555] hover:border-ink",
                          )}
                        >
                          {availableSize}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                <Link
                  href="/catalogo"
                  className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-medium text-muted transition hover:text-ink"
                >
                  <X size={12} />
                  Limpar filtros
                </Link>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-col gap-3 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="no-scrollbar flex w-full min-w-0 items-center gap-1.5 overflow-x-auto lg:w-auto">
                {(["todos", "camiseta", "bermuda"] as const).map((item) => {
                  const active = item === "todos" ? !kind : kind === item;
                  return (
                    <Link
                      key={item}
                      href={buildHref({
                        ...baseParams,
                        tipo: item === "todos" ? undefined : item,
                      })}
                      className={cn(
                        "shrink-0 border px-3 py-1.5 text-[10px] font-medium capitalize transition",
                        active
                          ? "border-ink bg-ink text-white"
                          : "border-line bg-white text-[#555] hover:border-ink",
                      )}
                    >
                      {item === "todos"
                        ? "Tudo"
                        : item === "camiseta"
                          ? "Camisetas"
                          : "Bermudas"}
                    </Link>
                  );
                })}
                <span className="mx-1 h-4 w-px shrink-0 bg-line" />
                {(["todos", "adulto", "plus", "infantil"] as const).map((item) => {
                  const active = item === "todos" ? !audience : audience === item;
                  return (
                    <Link
                      key={item}
                      href={buildHref({
                        ...baseParams,
                        publico: item === "todos" ? undefined : item,
                      })}
                      className={cn(
                        "shrink-0 border px-3 py-1.5 text-[10px] font-medium transition",
                        active
                          ? "border-ink bg-ink text-white"
                          : "border-line bg-white text-[#555] hover:border-ink",
                      )}
                    >
                      {item === "todos" ? "Todas as linhas" : audienceLabels[item]}
                    </Link>
                  );
                })}
              </div>

              <form action="/catalogo" className="flex w-full gap-2 lg:w-auto">
                <input type="hidden" name="publico" value={audience ?? ""} />
                <input type="hidden" name="tipo" value={kind ?? ""} />
                <input type="hidden" name="tamanho" value={size} />
                <input type="hidden" name="ordem" value={sortParam ?? ""} />
                <div className="relative flex-1 lg:w-[220px]">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder="Buscar no catálogo"
                    aria-label="Buscar no catálogo"
                    className="input h-9 min-h-9 pl-9 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="flex h-9 items-center border border-line bg-white px-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink transition hover:border-ink"
                >
                  Buscar
                </button>
              </form>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto lg:hidden">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categoria/${category.slug}`}
                    className="shrink-0 border border-line bg-white px-3 py-1.5 text-[9px] font-medium text-[#555] transition hover:border-ink hover:text-ink"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] uppercase tracking-[0.1em]">
                <span className="text-muted">Ordenar</span>
                {sortOptions.map((option) => (
                  <Link
                    key={option.value}
                    href={buildHref({
                      ...baseParams,
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

            {products.length === 0 ? (
              <div className="mt-7 border border-line bg-[#f7f7f5] p-8 md:p-12">
                <p className="font-display text-5xl font-semibold leading-none text-[#d8d8d2]">
                  00
                </p>
                <h2 className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
                  {query
                    ? "Nenhum produto encontrado."
                    : "O catálogo está sendo preparado."}
                </h2>
                <p className="mt-3 max-w-[500px] text-sm leading-relaxed text-muted">
                  {query
                    ? "Tente outro termo ou navegue pelas categorias da loja."
                    : "As peças serão publicadas pela ZEVEN com nome, preço e grade de tamanhos. Explore as categorias enquanto isso."}
                </p>
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <Link href="/catalogo" className="btn btn-black">
                    Ver catálogo
                  </Link>
                  <Link href="/guia-de-tamanhos" className="btn btn-outline">
                    Guia de tamanhos
                  </Link>
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

            <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-line pt-5 sm:flex-row sm:items-center">
              <p className="text-[10px] text-muted">
                Estoque e preços são validados na finalização do pedido.
              </p>
              <Link
                href="/guia-de-tamanhos"
                className="inline-flex items-center gap-1 text-[10px] font-medium text-[#555] transition hover:text-ink"
              >
                Guia de tamanhos
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
