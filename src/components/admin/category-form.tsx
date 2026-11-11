"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { saveCategoryAction } from "@/app/admin/(painel)/categorias/actions";
import type { ActionState } from "@/lib/action-state";
import { submitAction } from "@/lib/submit-action";
import { SingleImageInput } from "@/components/admin/single-image-input";

type CategoryFormProps = {
  category?: {
    id: number;
    name: string;
    slug: string;
    description: string;
    audience: string;
    kind: string;
    imageUrl: string;
    sortOrder: number;
    isActive: boolean;
  } | null;
};

const initialState: ActionState = { status: "idle" };

export function CategoryForm({ category }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(
    saveCategoryAction,
    initialState,
  );
  const [imageUrl, setImageUrl] = useState(category?.imageUrl ?? "");

  return (
    <form
      id="category-form"
      onSubmit={(event) => {
        event.preventDefault();
        submitAction(formAction, event.currentTarget);
      }}
      className="max-w-[900px]"
    >
      <input type="hidden" name="categoryId" value={category?.id ?? ""} />
      <input type="hidden" name="imageUrl" value={imageUrl} />

      {state.status === "error" ? (
        <div className="mb-6 border border-danger/35 bg-danger/5 px-4 py-3 text-xs leading-relaxed text-danger">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Dados da categoria
              </h2>
            </div>
            <div className="space-y-5 p-5">
              <div>
                <label htmlFor="name" className="field-label">
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  defaultValue={category?.name ?? ""}
                  className="input"
                  placeholder="Ex.: Camisetas Plus Size"
                />
                {state.fieldErrors?.name?.[0] ? (
                  <p className="field-error">{state.fieldErrors.name[0]}</p>
                ) : null}
              </div>

              {category ? (
                <div>
                  <span className="field-label">Endereço na loja</span>
                  <p className="flex h-12 items-center border border-line bg-coal px-3 text-xs text-muted">
                    /categoria/{category.slug}
                  </p>
                </div>
              ) : null}

              <div>
                <label htmlFor="description" className="field-label">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={category?.description ?? ""}
                  className="textarea"
                  rows={4}
                  placeholder="Descrição exibida na página da categoria."
                />
                {state.fieldErrors?.description?.[0] ? (
                  <p className="field-error">
                    {state.fieldErrors.description[0]}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="audience" className="field-label">
                    Público
                  </label>
                  <select
                    id="audience"
                    name="audience"
                    required
                    defaultValue={category?.audience ?? "adulto"}
                    className="select"
                  >
                    <option value="adulto">Adulto</option>
                    <option value="plus">Plus Size</option>
                    <option value="infantil">Infantil</option>
                  </select>
                  {state.fieldErrors?.audience?.[0] ? (
                    <p className="field-error">
                      {state.fieldErrors.audience[0]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="kind" className="field-label">
                    Tipo de peça
                  </label>
                  <select
                    id="kind"
                    name="kind"
                    required
                    defaultValue={category?.kind ?? "camiseta"}
                    className="select"
                  >
                    <option value="camiseta">Camiseta</option>
                    <option value="bermuda">Bermuda</option>
                  </select>
                  {state.fieldErrors?.kind?.[0] ? (
                    <p className="field-error">{state.fieldErrors.kind[0]}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Imagem da categoria
              </h2>
            </div>
            <div className="p-5">
              <SingleImageInput
                value={imageUrl}
                onChange={setImageUrl}
                label="Imagem (opcional)"
                hint="Usada como apoio visual na navegação e na página da categoria."
              />
              {state.fieldErrors?.imageUrl?.[0] ? (
                <p className="field-error">
                  {state.fieldErrors.imageUrl[0]}
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Organização
              </h2>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label htmlFor="sortOrder" className="field-label">
                  Ordem de exibição
                </label>
                <input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  min={0}
                  max={9999}
                  required
                  defaultValue={category?.sortOrder ?? 0}
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
                  defaultChecked={category?.isActive ?? true}
                  className="mt-0.5 h-4 w-4 accent-lime"
                />
                <span>
                  Categoria ativa
                  <span className="mt-0.5 block text-[10px] text-muted">
                    Categorias inativas não aparecem na loja.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <div className="border border-line bg-surface p-5">
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
                  {category ? "Salvar categoria" : "Criar categoria"}
                </>
              )}
            </button>
            <Link
              href="/admin/categorias"
              className="btn btn-outline btn-block mt-2"
            >
              <ArrowLeft size={14} />
              Voltar
            </Link>
          </div>
        </aside>
      </div>
    </form>
  );
}



