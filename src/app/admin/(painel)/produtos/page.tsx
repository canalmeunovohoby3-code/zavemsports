import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
  Filter,
  Package,
  Plus,
  Search,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ProductStatusBadge } from "@/components/admin/status-badge";
import { listAdminProducts, listCategories } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata = { title: "Produtos" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    categoria?: string;
    ok?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status =
    params.status === "active" || params.status === "inactive"
      ? params.status
      : undefined;
  const categoryId = params.categoria ? Number(params.categoria) : undefined;

  const categories = listCategories({
    includeInactive: true,
    countActiveOnly: false,
  });
  const products = listAdminProducts({
    query: query || undefined,
    status,
    categoryId:
      categoryId && Number.isFinite(categoryId) ? categoryId : undefined,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catálogo"
        title="Produtos"
        description="Cadastre, edite e controle o estoque de cada variação. Produtos inativos não aparecem na loja."
        actions={
          <Link href="/admin/produtos/novo" className="btn btn-lime btn-sm">
            <Plus size={14} />
            Novo produto
          </Link>
        }
      />

      {params.ok === "excluido" ? (
        <AdminNotice tone="success">
          Produto excluído. Os pedidos já registrados preservam o histórico do
          item.
        </AdminNotice>
      ) : null}

      <form
        action="/admin/produtos"
        className="flex flex-col gap-2 border border-line bg-surface p-3 md:flex-row md:items-center"
      >
        <div className="relative flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar por nome, slug ou categoria"
            aria-label="Buscar produtos"
            className="input h-10 min-h-10 pl-9 text-xs"
          />
        </div>
        <select
          name="categoria"
          defaultValue={categoryId ?? ""}
          aria-label="Filtrar por categoria"
          className="select h-10 min-h-10 text-xs md:w-[230px]"
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          aria-label="Filtrar por status"
          className="select h-10 min-h-10 text-xs md:w-[140px]"
        >
          <option value="">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <button type="submit" className="btn btn-outline btn-sm h-10">
          <Filter size={13} />
          Filtrar
        </button>
        {query || status || categoryId ? (
          <Link
            href="/admin/produtos"
            className="flex h-10 items-center text-[9px] font-semibold uppercase tracking-[0.1em] text-muted transition hover:text-lime"
          >
            Limpar
          </Link>
        ) : null}
      </form>

      <section className="border border-line bg-surface">
        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Package size={26} className="mx-auto text-line" />
            <h2 className="mt-4 font-display text-xl font-semibold uppercase tracking-[-0.02em]">
              {query || status || categoryId
                ? "Nenhum produto encontrado"
                : "Nenhum produto cadastrado"}
            </h2>
            <p className="mx-auto mt-2 max-w-[420px] text-xs leading-relaxed text-muted">
              {query || status || categoryId
                ? "Ajuste os filtros para ver outros resultados."
                : "Cadastre a primeira peça com preço, imagens e grade de tamanhos."}
            </p>
            <Link
              href="/admin/produtos/novo"
              className="btn btn-lime btn-sm mt-6"
            >
              <Plus size={14} />
              Cadastrar produto
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Destaque</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden border border-line bg-coal">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-[8px] text-line">
                              ZV
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/produtos/${product.id}`}
                            className="admin-link block max-w-[280px] truncate text-xs font-medium"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-1 max-w-[280px] truncate text-[9px] text-muted">
                            /produto/{product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-[11px] text-muted">
                      {product.categoryName}
                    </td>
                    <td className="whitespace-nowrap tabular-nums">
                      {formatPrice(product.priceCents)}
                    </td>
                    <td>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          product.totalStock === 0
                            ? "text-danger"
                            : product.totalStock <= 3
                              ? "text-warning"
                              : "text-white",
                        )}
                      >
                        {product.totalStock}
                      </span>
                    </td>
                    <td>
                      <ProductStatusBadge active={product.isActive} />
                    </td>
                    <td>
                      {product.isFeatured ? (
                        <span className="tag tag-lime">Sim</span>
                      ) : (
                        <span className="text-[10px] text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-3">
                        {product.isActive ? (
                          <Link
                            href={`/produto/${product.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted transition hover:text-lime"
                            aria-label={`Ver ${product.name} na loja`}
                          >
                            <ExternalLink size={14} />
                          </Link>
                        ) : null}
                        <Link
                          href={`/admin/produtos/${product.id}`}
                          className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-lime"
                        >
                          Editar
                          <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-[10px] text-muted">
        {products.length} produto(s) listado(s). O catálogo da loja exibe apenas
        produtos ativos e categorias ativas.
      </p>
    </div>
  );
}
