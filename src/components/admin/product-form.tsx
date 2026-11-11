"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { saveProductAction } from "@/app/admin/(painel)/produtos/actions";
import type { ActionState } from "@/lib/action-state";
import { submitAction } from "@/lib/submit-action";
import type { Category } from "@/lib/types";
import type { AdminImage } from "@/components/admin/image-list-input";
import { ImageListInput } from "@/components/admin/image-list-input";
import { siteConfig } from "@/config/site";
import { centsToInput } from "@/lib/format";
import { cn } from "@/lib/cn";

type FormVariant = { size: string; stock: number; sku: string };

type ProductFormProps = {
  categories: Category[];
  product?: {
    id: number;
    name: string;
    slug: string;
    categoryId: number;
    description: string;
    details: string;
    priceCents: number;
    compareAtCents: number | null;
    isActive: boolean;
    isFeatured: boolean;
    images: AdminImage[];
    variants: FormVariant[];
  } | null;
};

const initialState: ActionState = { status: "idle" };

export function ProductForm({ categories, product }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(
    saveProductAction,
    initialState,
  );
  const [images, setImages] = useState<AdminImage[]>(product?.images ?? []);
  const [variants, setVariants] = useState<FormVariant[]>(
    product?.variants.length
      ? product.variants.map((variant) => ({
          size: variant.size,
          stock: variant.stock,
          sku: variant.sku,
        }))
      : [{ size: "", stock: 0, sku: "" }],
  );
  const [name, setName] = useState(product?.name ?? "");

  const totalStock = variants.reduce(
    (total, variant) => total + (Number(variant.stock) || 0),
    0,
  );
  const duplicateSizes =
    new Set(
      variants
        .map((variant) => variant.size.trim().toLowerCase())
        .filter(Boolean),
    ).size !==
    variants.filter((variant) => variant.size.trim()).length;

  const addVariant = (size = "", stock = 0) => {
    setVariants((current) => [...current, { size, stock, sku: "" }]);
  };

  const applyPreset = (sizes: readonly string[]) => {
    setVariants((current) => {
      const existing = new Set(
        current.map((variant) => variant.size.trim().toLowerCase()),
      );
      const additions = sizes
        .filter((size) => !existing.has(size.toLowerCase()))
        .map((size) => ({ size, stock: 0, sku: "" }));
      return [...current, ...additions];
    });
  };

  const updateVariant = (index: number, patch: Partial<FormVariant>) => {
    setVariants((current) =>
      current.map((variant, i) =>
        i === index ? { ...variant, ...patch } : variant,
      ),
    );
  };

  return (
    <form
      id="product-form"
      onSubmit={(event) => {
        event.preventDefault();
        submitAction(formAction, event.currentTarget);
      }}
    >
      <input type="hidden" name="productId" value={product?.id ?? ""} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />

      {state.status === "error" ? (
        <div className="mb-6 border border-danger/35 bg-danger/5 px-4 py-3 text-xs leading-relaxed text-danger">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Informações do produto
              </h2>
            </div>
            <div className="space-y-5 p-5">
              <div>
                <label htmlFor="name" className="field-label">
                  Nome do produto
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="input"
                  placeholder="Ex.: Camiseta Essential Preta"
                />
                {state.fieldErrors?.name?.[0] ? (
                  <p className="field-error">{state.fieldErrors.name[0]}</p>
                ) : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="categoryId" className="field-label">
                    Categoria
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    defaultValue={product?.categoryId ?? ""}
                    className="select"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {state.fieldErrors?.categoryId?.[0] ? (
                    <p className="field-error">
                      {state.fieldErrors.categoryId[0]}
                    </p>
                  ) : null}
                </div>
                {product ? (
                  <div>
                    <span className="field-label">Endereço na loja</span>
                    <p className="flex h-12 items-center border border-line bg-coal px-3 text-xs text-muted">
                      /produto/{product.slug}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-end">
                    <p className="text-[10px] leading-relaxed text-muted">
                      O endereço (slug) será criado automaticamente a partir do
                      nome e permanecerá estável após a publicação.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="description" className="field-label">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={product?.description ?? ""}
                  className="textarea"
                  rows={5}
                  placeholder="Descrição exibida na página do produto."
                />
                {state.fieldErrors?.description?.[0] ? (
                  <p className="field-error">
                    {state.fieldErrors.description[0]}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="details" className="field-label">
                  Composição e cuidados
                </label>
                <textarea
                  id="details"
                  name="details"
                  defaultValue={product?.details ?? ""}
                  className="textarea"
                  rows={4}
                  placeholder="Ex.: 100% algodão. Lavar à máquina em água fria."
                />
                {state.fieldErrors?.details?.[0] ? (
                  <p className="field-error">{state.fieldErrors.details[0]}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Imagens
              </h2>
              <span className="text-[9px] uppercase tracking-[0.1em] text-muted">
                {images.length}/10
              </span>
            </div>
            <div className="p-5">
              <ImageListInput
                value={images}
                onChange={setImages}
                productName={name}
              />
              {state.fieldErrors?.images?.[0] ? (
                <p className="field-error">{state.fieldErrors.images[0]}</p>
              ) : null}
            </div>
          </section>

          <section className="border border-line bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Grade e estoque por tamanho
              </h2>
              <span className="text-[9px] uppercase tracking-[0.1em] text-muted">
                {variants.length} tamanho(s) · {totalStock} un.
              </span>
            </div>

            <div className="border-b border-line px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-muted">
                  <Sparkles size={12} className="text-lime" />
                  Predefinições
                </span>
                <button
                  type="button"
                  onClick={() => applyPreset(siteConfig.sizePresets.plus)}
                  className="border border-line px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-soft transition hover:border-lime hover:text-lime"
                >
                  Plus G1—G3
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(siteConfig.sizePresets.kids)}
                  className="border border-line px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-soft transition hover:border-lime hover:text-lime"
                >
                  Infantil 02—14
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(["Único"])}
                  className="border border-line px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-soft transition hover:border-lime hover:text-lime"
                >
                  Tamanho único
                </button>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-muted">
                A grade adulto completa ainda não foi confirmada. Cadastre os
                tamanhos manualmente para cada peça adulto.
              </p>
            </div>

            <div className="space-y-3 p-5">
              <div className="hidden gap-2 px-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-muted sm:grid sm:grid-cols-[1fr_110px_1fr_36px]">
                <span>Tamanho</span>
                <span>Estoque</span>
                <span>SKU (opcional)</span>
                <span />
              </div>
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-2 border border-line bg-coal p-3 sm:grid-cols-[1fr_110px_1fr_36px] sm:items-center sm:border-0 sm:bg-transparent sm:p-0"
                >
                  <div>
                    <label className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.1em] text-muted sm:hidden">
                      Tamanho
                    </label>
                    <input
                      value={variant.size}
                      onChange={(event) =>
                        updateVariant(index, { size: event.target.value })
                      }
                      required
                      className="input h-10 min-h-10 text-xs uppercase"
                      placeholder="Ex.: G1"
                      aria-label={`Tamanho ${index + 1}`}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.1em] text-muted sm:hidden">
                      Estoque
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={999999}
                      value={variant.stock}
                      onChange={(event) =>
                        updateVariant(index, {
                          stock: Number(event.target.value),
                        })
                      }
                      required
                      className="input h-10 min-h-10 text-xs tabular-nums"
                      aria-label={`Estoque do tamanho ${index + 1}`}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[8px] font-semibold uppercase tracking-[0.1em] text-muted sm:hidden">
                      SKU
                    </label>
                    <input
                      value={variant.sku}
                      onChange={(event) =>
                        updateVariant(index, { sku: event.target.value })
                      }
                      className="input h-10 min-h-10 text-xs"
                      placeholder="Opcional"
                      aria-label={`SKU do tamanho ${index + 1}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setVariants((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                    disabled={variants.length === 1}
                    className="col-span-2 mt-1 flex h-9 items-center justify-center gap-1.5 border border-line text-[8px] font-semibold uppercase tracking-[0.08em] text-muted transition hover:border-danger/40 hover:text-danger disabled:opacity-30 sm:col-span-1 sm:mt-0 sm:h-10 sm:w-9 sm:border-0"
                    aria-label={`Remover tamanho ${index + 1}`}
                  >
                    <Trash2 size={13} />
                    <span className="sm:hidden">Remover</span>
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addVariant()}
                className="flex h-10 w-full items-center justify-center gap-2 border border-dashed border-line text-[9px] font-semibold uppercase tracking-[0.1em] text-muted transition hover:border-lime/50 hover:text-lime"
              >
                <Plus size={13} />
                Adicionar tamanho
              </button>

              {duplicateSizes ? (
                <p className="text-[10px] text-warning">
                  Há tamanhos repetidos. Cada tamanho deve aparecer uma única
                  vez.
                </p>
              ) : null}
              {state.fieldErrors?.variants?.[0] ? (
                <p className="field-error">
                  {state.fieldErrors.variants[0]}
                </p>
              ) : null}
              <p className="text-[10px] leading-relaxed text-muted">
                O estoque é individual por tamanho. Variações com estoque zero
                aparecem como esgotadas na loja e não podem ser adicionadas ao
                carrinho.
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Publicação
              </h2>
            </div>
            <div className="space-y-4 p-5">
              <label className="flex cursor-pointer items-start gap-3 text-xs text-soft">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={product?.isActive ?? true}
                  className="mt-0.5 h-4 w-4 accent-lime"
                />
                <span>
                  Produto ativo
                  <span className="mt-0.5 block text-[10px] text-muted">
                    Visível na loja quando ativo.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 text-xs text-soft">
                <input
                  type="checkbox"
                  name="isFeatured"
                  defaultChecked={product?.isFeatured ?? false}
                  className="mt-0.5 h-4 w-4 accent-lime"
                />
                <span>
                  Destacar na página inicial
                  <span className="mt-0.5 block text-[10px] text-muted">
                    Aparece na seção de destaques.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Preço
              </h2>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label htmlFor="price" className="field-label">
                  Preço atual (R$)
                </label>
                <input
                  id="price"
                  name="price"
                  inputMode="decimal"
                  required
                  defaultValue={
                    product ? centsToInput(product.priceCents) : ""
                  }
                  className="input"
                  placeholder="0,00"
                />
                {state.fieldErrors?.price?.[0] ? (
                  <p className="field-error">{state.fieldErrors.price[0]}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="compareAt" className="field-label">
                  Preço anterior (opcional)
                </label>
                <input
                  id="compareAt"
                  name="compareAt"
                  inputMode="decimal"
                  defaultValue={
                    product?.compareAtCents
                      ? centsToInput(product.compareAtCents)
                      : ""
                  }
                  className="input"
                  placeholder="0,00"
                />
                {state.fieldErrors?.compareAt?.[0] ? (
                  <p className="field-error">
                    {state.fieldErrors.compareAt[0]}
                  </p>
                ) : null}
              </div>
              <p className="text-[10px] leading-relaxed text-muted">
                O preço é exibido em reais. Não há acréscimo ou parcelamento
                automático.
              </p>
            </div>
          </section>

          <section className="border border-line bg-surface p-5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.1em] text-muted">
              <span>Total em estoque</span>
              <span className="text-white">{totalStock}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.1em] text-muted">
              <span>Imagens</span>
              <span className="text-white">{images.length}</span>
            </div>
            <button
              type="submit"
              disabled={pending || duplicateSizes}
              className={cn("btn btn-lime btn-block mt-5")}
            >
              {pending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Salvando…
                </>
              ) : (
                <>
                  <Save size={15} />
                  {product ? "Salvar alterações" : "Criar produto"}
                </>
              )}
            </button>
            <Link
              href="/admin/produtos"
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



