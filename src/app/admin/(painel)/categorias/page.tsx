import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Layers, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ProductStatusBadge } from "@/components/admin/status-badge";
import { listCategories } from "@/lib/queries";
import { audienceLabels } from "@/config/site";

export const metadata = { title: "Categorias" };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const params = await searchParams;
  const categories = listCategories({
    includeInactive: true,
    countActiveOnly: false,
  });

  const okMessages: Record<string, string> = {
    criada: "Categoria criada com sucesso.",
    atualizada: "Categoria atualizada com sucesso.",
    excluida: "Categoria excluída.",
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Organização"
        title="Categorias"
        description="As categorias organizam o menu, as páginas de linha e os filtros da loja. Categorias com produtos não podem ser excluídas."
        actions={
          <Link href="/admin/categorias/nova" className="btn btn-lime btn-sm">
            <Plus size={14} />
            Nova categoria
          </Link>
        }
      />

      {params.ok && okMessages[params.ok] ? (
        <AdminNotice tone="success">{okMessages[params.ok]}</AdminNotice>
      ) : null}
      {params.erro ? (
        <AdminNotice tone="error">{params.erro}</AdminNotice>
      ) : null}

      <section className="border border-line bg-surface">
        {categories.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Layers size={26} className="mx-auto text-line" />
            <p className="mt-4 text-xs text-muted">
              Nenhuma categoria cadastrada.
            </p>
            <Link
              href="/admin/categorias/nova"
              className="btn btn-lime btn-sm mt-6"
            >
              <Plus size={14} />
              Criar categoria
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Público</th>
                  <th>Tipo</th>
                  <th>Produtos</th>
                  <th>Ordem</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-12 shrink-0 overflow-hidden border border-line bg-coal">
                          {category.imageUrl ? (
                            <Image
                              src={category.imageUrl}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-[8px] text-line">
                              ZV
                            </span>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/admin/categorias/${category.id}`}
                            className="admin-link text-xs font-medium"
                          >
                            {category.name}
                          </Link>
                          <p className="mt-1 text-[9px] text-muted">
                            /categoria/{category.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-[11px] text-muted">
                      {audienceLabels[category.audience]}
                    </td>
                    <td className="text-[11px] capitalize text-muted">
                      {category.kind}
                    </td>
                    <td className="text-xs tabular-nums">
                      {category.productCount}
                    </td>
                    <td className="text-xs tabular-nums text-muted">
                      {category.sortOrder}
                    </td>
                    <td>
                      <ProductStatusBadge active={category.isActive} />
                    </td>
                    <td>
                      <Link
                        href={`/admin/categorias/${category.id}`}
                        className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-lime"
                      >
                        Editar
                        <ArrowUpRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
