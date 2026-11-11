import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById, listCategories } from "@/lib/queries";
import { deleteProductAction } from "@/app/admin/(painel)/produtos/actions";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const { ok } = await searchParams;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const product = getProductById(productId);
  if (!product) notFound();

  const categories = listCategories({
    includeInactive: true,
    countActiveOnly: false,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={product.categoryName}
        title={product.name}
        description={`/produto/${product.slug}`}
        actions={
          <>
            {product.isActive ? (
              <Link
                href={`/produto/${product.slug}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
              >
                Ver na loja
                <ExternalLink size={13} />
              </Link>
            ) : null}
            <form action={deleteProductAction}>
              <input type="hidden" name="productId" value={product.id} />
              <ConfirmSubmit
                message="Excluir este produto? Essa ação remove imagens e estoque. Pedidos existentes preservam o histórico."
                className="btn btn-outline btn-sm border-danger/30 text-danger hover:border-danger hover:text-danger"
              >
                <Trash2 size={13} />
                Excluir
              </ConfirmSubmit>
            </form>
            <button
              type="submit"
              form="product-form"
              className="btn btn-lime btn-sm"
            >
              Salvar
            </button>
          </>
        }
      />

      {ok === "criado" ? (
        <AdminNotice tone="success" title="Produto criado">
          O produto foi cadastrado. Revise as imagens e a grade antes de ativá-lo
          na loja.
        </AdminNotice>
      ) : null}
      {ok === "atualizado" ? (
        <AdminNotice tone="success">Alterações salvas com sucesso.</AdminNotice>
      ) : null}
      {product.isActive && product.totalStock === 0 ? (
        <AdminNotice tone="warning" title="Produto ativo sem estoque">
          Todas as variações estão com estoque zero. A loja exibirá o produto
          como esgotado e bloqueará a compra.
        </AdminNotice>
      ) : null}
      {product.isActive && product.images.length === 0 ? (
        <AdminNotice tone="info" title="Produto sem imagens">
          A página usará um espaço visual reservado. Adicione imagens para
          apresentar a peça na loja.
        </AdminNotice>
      ) : null}

      <div className="flex items-center gap-2">
        <Link
          href="/admin/produtos"
          className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted transition hover:text-lime"
        >
          <ArrowLeft size={12} />
          Todos os produtos
        </Link>
      </div>

      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          description: product.description,
          details: product.details,
          priceCents: product.priceCents,
          compareAtCents: product.compareAtCents,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          images: product.images.map((image) => ({
            url: image.url,
            alt: image.alt,
          })),
          variants: product.variants.map((variant) => ({
            size: variant.size,
            stock: variant.stock,
            sku: variant.sku,
          })),
        }}
      />
    </div>
  );
}
