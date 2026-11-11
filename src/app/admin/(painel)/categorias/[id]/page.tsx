import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-notice";
import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { getCategoryById } from "@/lib/queries";
import { deleteCategoryAction } from "@/app/admin/(painel)/categorias/actions";

export const metadata: Metadata = { title: "Editar categoria" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isFinite(categoryId)) notFound();
  const category = getCategoryById(categoryId);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Categorias"
        title={category.name}
        description={`/categoria/${category.slug}`}
        actions={
          <>
            {category.isActive ? (
              <Link
                href={`/categoria/${category.slug}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
              >
                Ver na loja
                <ExternalLink size={13} />
              </Link>
            ) : null}
            <form action={deleteCategoryAction}>
              <input type="hidden" name="categoryId" value={category.id} />
              <ConfirmSubmit
                message="Excluir esta categoria? Só é possível excluir categorias sem produtos vinculados."
                className="btn btn-outline btn-sm border-danger/30 text-danger hover:border-danger hover:text-danger"
              >
                <Trash2 size={13} />
                Excluir
              </ConfirmSubmit>
            </form>
          </>
        }
      />

      {category.productCount > 0 ? (
        <AdminNotice tone="info" title="Categoria com produtos vinculados">
          Esta categoria possui {category.productCount} produto(s) ativo(s).
          Para excluí-la, mova ou exclua os produtos primeiro.
        </AdminNotice>
      ) : null}

      <div className="flex items-center gap-2">
        <Link
          href="/admin/categorias"
          className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted transition hover:text-lime"
        >
          <ArrowLeft size={12} />
          Todas as categorias
        </Link>
      </div>

      <CategoryForm
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          audience: category.audience,
          kind: category.kind,
          imageUrl: category.imageUrl,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        }}
      />
    </div>
  );
}
