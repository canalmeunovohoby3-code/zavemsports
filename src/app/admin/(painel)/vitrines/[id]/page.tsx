import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { SectionForm } from "@/components/admin/section-form";
import {
  getHomeSectionById,
  listAdminProducts,
  listCategories,
} from "@/lib/queries";
import { deleteHomeSectionAction } from "@/app/admin/(painel)/vitrines/actions";

export const metadata: Metadata = { title: "Editar vitrine" };

export default async function EditHomeSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const sectionId = Number(id);
  if (!Number.isFinite(sectionId)) notFound();

  const section = getHomeSectionById(sectionId);
  if (!section) notFound();

  const categories = listCategories({
    includeInactive: true,
    countActiveOnly: false,
  });
  const products = listAdminProducts();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Página inicial"
        title={section.title}
        description={`Posição ${section.sortOrder} · ${section.isActive ? "publicada" : "inativa"}`}
        actions={
          <>
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
            >
              Ver loja
              <ExternalLink size={13} />
            </Link>
            <form action={deleteHomeSectionAction}>
              <input type="hidden" name="sectionId" value={section.id} />
              <ConfirmSubmit
                message={`Excluir a vitrine "${section.title}"? Os produtos continuam no catálogo. Essa ação não pode ser desfeita.`}
                className="btn btn-outline btn-sm border-danger/30 text-danger hover:border-danger hover:text-danger"
              >
                <Trash2 size={13} />
                Excluir
              </ConfirmSubmit>
            </form>
            <button
              type="submit"
              form="section-form"
              className="btn btn-lime btn-sm"
            >
              Salvar
            </button>
          </>
        }
      />

      {query.ok === "criada" ? (
        <AdminNotice tone="success" title="Vitrine criada">
          Configure os produtos e a apresentação. A seção aparece na loja
          somente se estiver ativa e possuir produtos.
        </AdminNotice>
      ) : null}
      {query.ok === "atualizada" ? (
        <AdminNotice tone="success">
          Alterações salvas e publicadas na loja.
        </AdminNotice>
      ) : null}
      {query.erro ? (
        <AdminNotice tone="error">{query.erro}</AdminNotice>
      ) : null}

      <div className="flex items-center gap-2">
        <Link
          href="/admin/vitrines"
          className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted transition hover:text-lime"
        >
          <ArrowLeft size={12} />
          Todas as vitrines
        </Link>
      </div>

      <SectionForm
        categories={categories}
        products={products}
        section={section}
      />
    </div>
  );
}
