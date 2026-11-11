import Link from "next/link";
import { ArrowUpRight, ClipboardList, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-notice";
import { StatusBadge } from "@/components/admin/status-badge";
import { listOrders } from "@/lib/queries";
import { statusLabels, type OrderStatus } from "@/config/site";
import { formatDateTime, formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata = { title: "Pedidos" };

const statuses = Object.keys(statusLabels) as OrderStatus[];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; ok?: string; erro?: string }>;
}) {
  const params = await searchParams;
  const activeStatus =
    params.status && params.status in statusLabels
      ? (params.status as OrderStatus)
      : undefined;
  const query = params.q?.trim() ?? "";
  const orders = listOrders({
    status: activeStatus,
    query: query || undefined,
    limit: 300,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Vendas"
        title="Pedidos"
        description="Pedidos registrados pela loja. A confirmação de pagamento é manual: atualize o status somente após validar o recebimento."
      />

      {params.ok === "status" ? (
        <AdminNotice tone="success">Status do pedido atualizado.</AdminNotice>
      ) : null}
      {params.erro ? (
        <AdminNotice tone="error">{params.erro}</AdminNotice>
      ) : null}

      <div className="flex flex-col gap-3 border border-line bg-surface p-3">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          <Link
            href="/admin/pedidos"
            className={cn(
              "shrink-0 border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] transition",
              !activeStatus
                ? "border-lime bg-lime text-black"
                : "border-line text-muted hover:border-white/40 hover:text-white",
            )}
          >
            Todos
          </Link>
          {statuses.map((status) => (
            <Link
              key={status}
              href={`/admin/pedidos?status=${status}`}
              className={cn(
                "shrink-0 border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] transition",
                activeStatus === status
                  ? "border-lime bg-lime text-black"
                  : "border-line text-muted hover:border-white/40 hover:text-white",
              )}
            >
              {statusLabels[status]}
            </Link>
          ))}
        </div>

        <form action="/admin/pedidos" className="flex gap-2">
          {activeStatus ? (
            <input type="hidden" name="status" value={activeStatus} />
          ) : null}
          <div className="relative flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Buscar por número, cliente ou e-mail"
              aria-label="Buscar pedidos"
              className="input h-10 min-h-10 pl-9 text-xs"
            />
          </div>
          <button type="submit" className="btn btn-outline btn-sm h-10">
            Buscar
          </button>
        </form>
      </div>

      <section className="border border-line bg-surface">
        {orders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ClipboardList size={26} className="mx-auto text-line" />
            <h2 className="mt-4 font-display text-xl font-semibold uppercase tracking-[-0.02em]">
              Nenhum pedido encontrado
            </h2>
            <p className="mt-2 text-xs text-muted">
              {query || activeStatus
                ? "Ajuste os filtros para ver outros resultados."
                : "Os pedidos aparecerão aqui quando forem finalizados na loja."}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Itens</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="admin-link text-xs font-medium"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="mt-1 text-[9px] text-muted">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </td>
                    <td>
                      <p className="text-xs text-white">{order.customerName}</p>
                      <p className="mt-1 text-[9px] text-muted">
                        {order.customerEmail}
                      </p>
                      <p className="mt-0.5 text-[9px] text-muted">
                        {order.city} — {order.state}
                      </p>
                    </td>
                    <td className="text-xs tabular-nums text-muted">
                      {order.itemCount}
                    </td>
                    <td className="whitespace-nowrap text-xs tabular-nums">
                      {formatPrice(order.totalCents)}
                    </td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-lime"
                      >
                        Abrir
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
