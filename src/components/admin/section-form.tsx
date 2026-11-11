"use client";

import { useActionState, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { saveHomeSectionAction } from "@/app/admin/(painel)/vitrines/actions";
import type { ActionState } from "@/lib/action-state";
import { submitAction } from "@/lib/submit-action";
import { SingleImageInput } from "@/components/admin/single-image-input";
import {
  audienceLabels,
  homeSectionModes,
  type HomeSectionMode,
} from "@/config/site";
import type { Category, HomeSection, ProductSummary } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

type SectionFormProps = {
  categories: Category[];
  products: ProductSummary[];
  section?: HomeSection | null;
  nextSortOrder?: number;
};

const initialState: ActionState = { status: "idle" };

export function SectionForm({
  categories,
  products,
  section,
  nextSortOrder = 1,
}: SectionFormProps) {
  const [state, formAction, pending] = useActionState(
    saveHomeSectionAction,
    initialState,
  );
  const [title, setTitle] = useState(section?.title ?? "");
  const [subtitle, setSubtitle] = useState(section?.subtitle ?? "");
  const [imageUrl, setImageUrl] = useState(section?.imageUrl ?? "");
  const [sourceMode, setSourceMode] = useState<HomeSectionMode>(
    section?.sourceMode ?? "manual",
  );
  const [sourceCategoryId, setSourceCategoryId] = useState(
    section?.sourceCategoryId?.toString() ?? "",
  );
  const [sourceAudience, setSourceAudience] = useState(
    section?.sourceAudience ?? "adulto",
  );
  const [active, setActive] = useState(section?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(
    String(section?.sortOrder ?? nextSortOrder),
  );
  const [productIds, setProductIds] = useState<number[]>(
    section?.productIds ?? [],
  );
  const [search, setSearch] = useState("");

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const selectedProducts = productIds
    .map((id) => productMap.get(id))
    .filter((product): product is ProductSummary => Boolean(product));

  const selectedSet = new Set(productIds);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      `${product.name} ${product.categoryName}`.toLowerCase().includes(term),
    );
  }, [products, search]);

  const addProduct = (id: number) => {
    setProductIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
  };

  const removeProduct = (id: number) => {
    setProductIds((current) => current.filter((value) => value !== id));
  };

  const moveProduct = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= productIds.length) return;
    setProductIds((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const modeConfig = homeSectionModes[sourceMode];

  return (
    <form
      id="section-form"
      onSubmit={(event) => {
        event.preventDefault();
        submitAction(formAction, event.currentTarget);
      }}
    >
      <input type="hidden" name="sectionId" value={section?.id ?? ""} />
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input
        type="hidden"
        name="sourceCategoryId"
        value={sourceMode === "category" ? sourceCategoryId : ""}
      />
      <input
        type="hidden"
        name="sourceAudience"
        value={sourceMode === "audience" ? sourceAudience : ""}
      />
      <input type="hidden" name="productIds" value={JSON.stringify(productIds)} />

      {state.status === "error" ? (
        <div className="mb-6 border border-danger/35 bg-danger/5 px-4 py-3 text-xs leading-relaxed text-danger">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Conteúdo da vitrine
              </h2>
            </div>
            <div className="space-y-5 p-5">
              <div>
                <label htmlFor="title" className="field-label">
                  Título da vitrine
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="input"
                  placeholder="Ex.: Mais vendidos"
                />
                {state.fieldErrors?.title?.[0] ? (
                  <p className="field-error">{state.fieldErrors.title[0]}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="subtitle" className="field-label">
                  Subtítulo (opcional)
                </label>
                <textarea
                  id="subtitle"
                  name="subtitle"
                  value={subtitle}
                  onChange={(event) => setSubtitle(event.target.value)}
                  className="textarea"
                  rows={3}
                  placeholder="Frase curta exibida abaixo do título."
                />
                {state.fieldErrors?.subtitle?.[0] ? (
                  <p className="field-error">
                    {state.fieldErrors.subtitle[0]}
                  </p>
                ) : null}
              </div>
              <SingleImageInput
                value={imageUrl}
                onChange={setImageUrl}
                label="Imagem de apresentação (opcional)"
                hint="Quando definida, aparece como faixa editorial no topo da seção. Use uma imagem horizontal."
              />
              {state.fieldErrors?.imageUrl?.[0] ? (
                <p className="field-error">
                  {state.fieldErrors.imageUrl[0]}
                </p>
              ) : null}
            </div>
          </section>

          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Como os produtos são escolhidos
              </h2>
            </div>
            <div className="space-y-5 p-5">
              <div>
                <label htmlFor="sourceMode" className="field-label">
                  Modo de seleção
                </label>
                <select
                  id="sourceMode"
                  name="sourceMode"
                  value={sourceMode}
                  onChange={(event) =>
                    setSourceMode(event.target.value as HomeSectionMode)
                  }
                  className="select"
                >
                  {Object.entries(homeSectionModes).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[10px] leading-relaxed text-muted">
                  {modeConfig.hint}
                </p>
              </div>

              {sourceMode === "category" ? (
                <div>
                  <label htmlFor="categorySource" className="field-label">
                    Categoria
                  </label>
                  <select
                    id="categorySource"
                    value={sourceCategoryId}
                    onChange={(event) =>
                      setSourceCategoryId(event.target.value)
                    }
                    className="select"
                  >
                    <option value="">Selecione</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                        {category.isActive ? "" : " (inativa)"}
                      </option>
                    ))}
                  </select>
                  {state.fieldErrors?.sourceCategoryId?.[0] ? (
                    <p className="field-error">
                      {state.fieldErrors.sourceCategoryId[0]}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {sourceMode === "audience" ? (
                <div>
                  <label htmlFor="audienceSource" className="field-label">
                    Público
                  </label>
                  <select
                    id="audienceSource"
                    value={sourceAudience}
                    onChange={(event) =>
                      setSourceAudience(
                        event.target.value as typeof sourceAudience,
                      )
                    }
                    className="select"
                  >
                    {(["adulto", "plus", "infantil"] as const).map(
                      (audience) => (
                        <option key={audience} value={audience}>
                          {audienceLabels[audience]}
                        </option>
                      ),
                    )}
                  </select>
                  {state.fieldErrors?.sourceAudience?.[0] ? (
                    <p className="field-error">
                      {state.fieldErrors.sourceAudience[0]}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {sourceMode === "manual" ? (
                <div className="border-t border-line pt-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="field-label">Produtos da vitrine</p>
                      <p className="text-[10px] leading-relaxed text-muted">
                        Selecione os produtos e ajuste a ordem de exibição. Ao
                        remover da vitrine, o produto continua no catálogo.
                      </p>
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.1em] text-muted">
                      {productIds.length} selecionado(s)
                    </span>
                  </div>

                  {products.length === 0 ? (
                    <div className="mt-4 border border-dashed border-line bg-coal p-5 text-center">
                      <p className="text-xs text-muted">
                        Nenhum produto cadastrado ainda.
                      </p>
                      <Link
                        href="/admin/produtos/novo"
                        className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-lime"
                      >
                        <Plus size={12} />
                        Cadastrar primeiro produto
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="relative mt-4">
                        <Search
                          size={13}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        />
                        <input
                          type="search"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          className="input h-9 min-h-9 pl-9 text-xs"
                          placeholder="Buscar produto por nome ou categoria"
                          aria-label="Buscar produtos para a vitrine"
                        />
                      </div>

                      <div className="mt-3 max-h-[280px] overflow-y-auto border border-line bg-coal">
                        {filteredProducts.length === 0 ? (
                          <p className="px-4 py-6 text-center text-[11px] text-muted">
                            Nenhum produto encontrado para esta busca.
                          </p>
                        ) : (
                          <ul className="divide-y divide-line">
                            {filteredProducts.map((product) => {
                              const selected = selectedSet.has(product.id);
                              return (
                                <li
                                  key={product.id}
                                  className="flex items-center gap-3 px-3 py-2.5"
                                >
                                  <div className="relative h-10 w-8 shrink-0 overflow-hidden border border-line bg-raised">
                                    {product.imageUrl ? (
                                      <Image
                                        src={product.imageUrl}
                                        alt=""
                                        fill
                                        sizes="32px"
                                        unoptimized
                                        className="object-cover"
                                      />
                                    ) : (
                                      <span className="flex h-full items-center justify-center text-[7px] text-line">
                                        ZV
                                      </span>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] text-white">
                                      {product.name}
                                    </p>
                                    <p className="mt-0.5 truncate text-[9px] text-muted">
                                      {product.categoryName} ·{" "}
                                      {formatPrice(product.priceCents)} ·{" "}
                                      {product.totalStock} un.
                                    </p>
                                  </div>
                                  {!product.isActive ? (
                                    <span className="tag tag-danger shrink-0">
                                      Inativo
                                    </span>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => addProduct(product.id)}
                                    disabled={selected}
                                    aria-label={`Adicionar ${product.name}`}
                                    className={cn(
                                      "flex h-8 shrink-0 items-center gap-1 border px-2 text-[8px] font-semibold uppercase tracking-[0.08em] transition",
                                      selected
                                        ? "border-lime/30 bg-lime/10 text-lime"
                                        : "border-line text-muted hover:border-lime/50 hover:text-lime",
                                    )}
                                  >
                                    {selected ? (
                                      <Check size={11} />
                                    ) : (
                                      <Plus size={11} />
                                    )}
                                    {selected ? "Na vitrine" : "Adicionar"}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>

                      <div className="mt-5">
                        <p className="field-label">Ordem na vitrine</p>
                        {selectedProducts.length === 0 ? (
                          <p className="mt-2 border border-dashed border-line bg-coal px-4 py-4 text-[11px] text-muted">
                            Nenhum produto selecionado. A vitrine será exibida
                            vazia até que produtos sejam adicionados.
                          </p>
                        ) : (
                          <ol className="mt-2 space-y-2">
                            {selectedProducts.map((product, index) => (
                              <li
                                key={product.id}
                                className="flex items-center gap-3 border border-line bg-coal px-3 py-2"
                              >
                                <span className="w-4 text-center text-[9px] tabular-nums text-muted">
                                  {index + 1}
                                </span>
                                <div className="relative h-9 w-7 shrink-0 overflow-hidden border border-line bg-raised">
                                  {product.imageUrl ? (
                                    <Image
                                      src={product.imageUrl}
                                      alt=""
                                      fill
                                      sizes="28px"
                                      unoptimized
                                      className="object-cover"
                                    />
                                  ) : null}
                                </div>
                                <p className="min-w-0 flex-1 truncate text-[11px] text-white">
                                  {product.name}
                                </p>
                                <div className="flex shrink-0 gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveProduct(index, -1)}
                                    disabled={index === 0}
                                    aria-label={`Mover ${product.name} para cima`}
                                    className="flex h-7 w-7 items-center justify-center border border-line text-muted transition hover:text-lime disabled:opacity-30"
                                  >
                                    <ArrowUp size={11} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveProduct(index, 1)}
                                    disabled={
                                      index === selectedProducts.length - 1
                                    }
                                    aria-label={`Mover ${product.name} para baixo`}
                                    className="flex h-7 w-7 items-center justify-center border border-line text-muted transition hover:text-lime disabled:opacity-30"
                                  >
                                    <ArrowDown size={11} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeProduct(product.id)}
                                    aria-label={`Remover ${product.name} da vitrine`}
                                    className="flex h-7 w-7 items-center justify-center border border-line text-muted transition hover:border-danger/40 hover:text-danger"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="border border-line bg-coal px-4 py-3 text-[10px] leading-relaxed text-muted">
                  Neste modo a seleção é automática. Mude para “Seleção manual”
                  para escolher produtos específicos.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Exibição
              </h2>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label htmlFor="sortOrder" className="field-label">
                  Posição na página inicial
                </label>
                <input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  min={0}
                  max={9999}
                  required
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="input"
                />
                {state.fieldErrors?.sortOrder?.[0] ? (
                  <p className="field-error">
                    {state.fieldErrors.sortOrder[0]}
                  </p>
                ) : null}
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-xs text-soft">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-lime"
                />
                <span>
                  Vitrine ativa
                  <span className="mt-0.5 block text-[10px] text-muted">
                    Vitrines inativas não aparecem na página inicial.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                Prévia da seção
              </p>
            </div>
            <div className="bg-[#f7f7f5] p-4 text-black">
              <div className="relative overflow-hidden border border-black/10 bg-white">
                {imageUrl ? (
                  <div className="relative h-24">
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      sizes="340px"
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                    <div className="absolute inset-0 flex items-end p-3">
                      <div className="text-white">
                        <p className="font-display text-lg font-semibold leading-tight">
                          {title || "Título da vitrine"}
                        </p>
                        {subtitle ? (
                          <p className="mt-0.5 line-clamp-2 text-[9px] text-white/80">
                            {subtitle}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-b border-black/10 p-3">
                    <p className="font-display text-lg font-semibold leading-tight text-black">
                      {title || "Título da vitrine"}
                    </p>
                    {subtitle ? (
                      <p className="mt-0.5 line-clamp-2 text-[9px] text-black/55">
                        {subtitle}
                      </p>
                    ) : null}
                  </div>
                )}
                <div className="grid grid-cols-4 gap-1.5 p-3">
                  {sourceMode === "manual" ? (
                    selectedProducts.length > 0 ? (
                      selectedProducts.slice(0, 4).map((product) => (
                        <div key={product.id}>
                          <div className="relative aspect-[3/4] overflow-hidden bg-[#f0f0ec]">
                            {product.imageUrl ? (
                              <Image
                                src={product.imageUrl}
                                alt=""
                                fill
                                sizes="80px"
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full items-center justify-center text-[7px] text-black/30">
                                ZV
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-[7px] text-black/70">
                            {product.name}
                          </p>
                        </div>
                      ))
                    ) : (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index}>
                          <div className="flex aspect-[3/4] items-center justify-center border border-dashed border-black/10 bg-white text-[7px] text-black/30">
                            Produto
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    <div className="col-span-4 border border-dashed border-black/15 bg-white px-3 py-4 text-center text-[8px] leading-relaxed text-black/45">
                      Os produtos automáticos aparecem na loja conforme o modo
                      selecionado.
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-3 text-[9px] leading-relaxed text-black/45">
                Prévia ilustrativa. A loja aplica os estilos e recortes reais.
              </p>
            </div>
          </section>

          <section className="border border-line bg-surface p-5">
            <button
              type="submit"
              disabled={pending}
              className="btn btn-lime btn-block"
            >
              {pending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Salvando…
                </>
              ) : (
                <>
                  <Save size={15} />
                  {section ? "Salvar vitrine" : "Criar vitrine"}
                </>
              )}
            </button>
            <Link
              href="/admin/vitrines"
              className="btn btn-outline btn-block mt-2"
            >
              <ArrowLeft size={14} />
              Voltar
            </Link>
          </section>
        </aside>
      </div>
    </form>
  );
}
