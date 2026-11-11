import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Package,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-notice";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { getOrderById } from "@/lib/queries";
import {
  paymentMethodLabels,
  type OrderStatus,
} from "@/config/site";
import {
  formatCep,
  formatDateTime,
  formatPhone,
  formatPrice,
} from "@/lib/format";
import {
  SHIPPING_PENDING_LABEL,
  SHIPPING_NOTICE,
} from "@/lib/shipping";
import { orderStatusTransitions } from "@/lib/orders";
import { updateOrderStatusAction } from "@/app/admin/(painel)/pedidos/actions";

export const metadata: Metadata = { title: "Detalhe do pedido" };

const actionLabels: Record<OrderStatus, string> = {
  pending_payment: "Reabrir como aguardando pagamento",
  confirmed: "Confirmar pagamento",
  processing: "Iniciar preparação",
  shipped: "Marcar como enviado",
  delivered: "Marcar como entregue",
  canceled: "Cancelar pedido",
};

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) notFound();
  const order = getOrderById(orderId);
  if (!order) notFound();

  const nextStatuses = orderStatusTransitions[order.status];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={`Pedido · ${formatDateTime(order.createdAt)}`}
        title={order.orderNumber}
        description={`${order.customerName} · ${order.customerEmail}`}
        actions={
          <>
            <Link href="/admin/pedidos" className="btn btn-outline btn-sm">
              <ArrowLeft size={13} />
              Pedidos
            </Link>
            <Link
              href={`/pedido/${order.publicToken}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
            >
              Ver página do cliente
              <ExternalLink size={13} />
            </Link>
          </>
        }
      />

      {query.ok === "status" ? (
        <AdminNotice tone="success">Status atualizado com sucesso.</AdminNotice>
      ) : null}
      {query.erro ? (
        <AdminNotice tone="error">{query.erro}</AdminNotice>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="border border-line bg-surface">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
              <div className="flex items-center gap-2">
                <Package size={15} className="text-lime" />
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                  Itens
                </h2>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Tamanho</th>
                    <th>Qtd.</th>
                    <th>Unitário</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-10 shrink-0 overflow-hidden border border-line bg-coal">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
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
                          <div>
                            <p className="text-xs text-white">{item.productName}</p>
                            {item.productId ? (
                              <Link
                                href={`/admin/produtos/${item.productId}`}
                                className="mt-1 inline-flex items-center gap-1 text-[9px] text-lime"
                              >
                                Ver produto
                                <ExternalLink size={10} />
                              </Link>
                            ) : (
                              <p className="mt-1 text-[9px] text-muted">
                                Produto excluído
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-xs">{item.size}</td>
                      <td className="text-xs tabular-nums">{item.quantity}</td>
                      <td className="whitespace-nowrap text-xs tabular-nums">
                        {formatPrice(item.unitPriceCents)}
                      </td>
                      <td className="whitespace-nowrap text-xs tabular-nums">
                        {formatPrice(item.lineTotalCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-line px-5 py-4">
              <div className="ml-auto max-w-[280px] space-y-2 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Subtotal</span>
                  <span className="tabular-nums">
                    {formatPrice(order.subtotalCents)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Frete</span>
                  <span className="text-warning">
                    {SHIPPING_PENDING_LABEL}
                  </span>
                </div>
                <div className="flex justify-between gap-4 border-t border-line pt-2 text-sm font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatPrice(order.totalCents)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="border border-line bg-surface p-5">
              <div className="flex items-center gap-2">
                <UserRound size={15} className="text-lime" />
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                  Cliente
                </h2>
              </div>
              <div className="mt-4 space-y-1 text-xs leading-relaxed text-soft">
                <p>{order.customerName}</p>
                <p className="text-muted">{order.customerEmail}</p>
                <p className="text-muted">{formatPhone(order.customerPhone)}</p>
              </div>
              <Link
                href={`/admin/pedidos?q=${encodeURIComponent(order.customerEmail)}`}
                className="mt-4 inline-flex text-[9px] font-semibold uppercase tracking-[0.1em] text-lime"
              >
                Ver pedidos deste e-mail
              </Link>
            </section>

            <section className="border border-line bg-surface p-5">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-lime" />
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                  Entrega
                </h2>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-soft">
                {order.addressStreet}, {order.addressNumber}
                {order.addressComplement ? ` — ${order.addressComplement}` : ""}
                <br />
                {order.addressNeighborhood}
                <br />
                {order.addressCity} — {order.addressState}
                <br />
                CEP {formatCep(order.addressCep)}
              </p>
              <p className="mt-4 text-[10px] leading-relaxed text-muted">
                {SHIPPING_NOTICE}
              </p>
            </section>
          </div>

          {order.notes ? (
            <section className="border border-line bg-surface p-5">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Observações do cliente
              </h2>
              <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-muted">
                {order.notes}
              </p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Status e pagamento
              </h2>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.1em] text-muted">
                  Status atual
                </span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
                <span className="text-[10px] uppercase tracking-[0.1em] text-muted">
                  Forma
                </span>
                <span className="text-xs text-soft">
                  {paymentMethodLabels[order.paymentMethod]}
                </span>
              </div>
              <div className="flex items-start gap-2 border border-lime/20 bg-lime/[0.03] px-3 py-3">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-lime" />
                <p className="text-[10px] leading-relaxed text-muted">
                  Nenhuma cobrança online é processada. Confirme o pagamento
                  somente após validar o recebimento com o cliente.
                </p>
              </div>

              {nextStatuses.length > 0 ? (
                <div className="border-t border-line pt-4">
                  <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Próximas ações
                  </p>
                  <div className="space-y-2">
                    {nextStatuses.map((nextStatus) => (
                      <form key={nextStatus} action={updateOrderStatusAction}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={nextStatus}
                        />
                        {nextStatus === "canceled" ? (
                          <ConfirmSubmit
                            message="Cancelar o pedido? O estoque das variações será devolvido ao catálogo."
                            className="btn btn-outline btn-sm btn-block border-danger/30 text-danger hover:border-danger hover:text-danger"
                          >
                            {actionLabels[nextStatus]}
                          </ConfirmSubmit>
                        ) : (
                          <button
                            type="submit"
                            className={
                              nextStatus === "confirmed"
                                ? "btn btn-lime btn-sm btn-block"
                                : "btn btn-outline btn-sm btn-block"
                            }
                          >
                            {actionLabels[nextStatus]}
                          </button>
                        )}
                      </form>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="border-t border-line pt-4 text-[10px] leading-relaxed text-muted">
                  Este pedido está em um status final e não possui novas ações.
                </p>
              )}
            </div>
          </section>

          <section className="border border-line bg-surface p-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
              Histórico mínimo
            </p>
            <p className="mt-3 text-[10px] leading-relaxed text-muted">
              Criado em {formatDateTime(order.createdAt)}
              <br />
              Última atualização em {formatDateTime(order.updatedAt)}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
