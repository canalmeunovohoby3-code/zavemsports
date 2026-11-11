import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, CircleAlert, Clock3, Package } from "lucide-react";
import {
  paymentMethodLabels,
  statusLabels,
  type OrderStatus,
} from "@/config/site";
import { getOrderByToken } from "@/lib/queries";
import { formatCep, formatDateTime, formatPrice } from "@/lib/format";
import { SHIPPING_NOTICE, SHIPPING_PENDING_LABEL } from "@/lib/shipping";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Pedido",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const steps: Array<{ status: OrderStatus; label: string }> = [
  { status: "pending_payment", label: "Pedido registrado" },
  { status: "confirmed", label: "Pagamento confirmado" },
  { status: "processing", label: "Em preparação" },
  { status: "shipped", label: "Enviado" },
  { status: "delivered", label: "Entregue" },
];

function statusIndex(status: OrderStatus) {
  return steps.findIndex((step) => step.status === status);
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const order = getOrderByToken(token);
  if (!order) notFound();

  const isCanceled = order.status === "canceled";
  const currentIndex = statusIndex(order.status);

  return (
    <div className="shell py-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted">
          Pedido <span className="font-medium text-[#555]">{order.orderNumber}</span>
        </p>
        <span
          className={cn(
            "tag",
            isCanceled
              ? "tag-danger"
              : order.status === "pending_payment"
                ? "tag-warning"
                : order.status === "delivered"
                  ? "tag-success"
                  : "tag-lime",
          )}
        >
          {statusLabels[order.status]}
        </span>
      </div>

      <header className="mt-7 grid gap-6 border-b border-line pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <span className="eyebrow">Pedido recebido</span>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-ink">
            Pedido registrado.
          </h1>
          <p className="mt-4 max-w-[560px] text-sm leading-relaxed text-muted">
            Seu pedido foi registrado em {formatDateTime(order.createdAt)}.
            Nenhuma cobrança automática foi realizada. A loja entrará em contato
            pelo e-mail ou telefone informados para confirmar o pagamento e o
            frete.
          </p>
        </div>
        <div className="border border-line bg-[#f7f7f5] p-5 md:min-w-[220px]">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
            Total dos produtos
          </p>
          <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-ink">
            {formatPrice(order.totalCents)}
          </p>
          <p className="mt-1 text-[10px] text-[var(--color-warning)]">
            Frete: {SHIPPING_PENDING_LABEL}
          </p>
        </div>
      </header>

      {isCanceled ? (
        <div className="mt-6 flex items-start gap-3 border border-[#efc9c4] bg-[#fdf1ef] px-4 py-3.5">
          <CircleAlert size={17} className="mt-0.5 shrink-0 text-[#a53227]" />
          <p className="text-sm leading-relaxed text-[#7a2b23]">
            Este pedido foi cancelado. Em caso de dúvidas, utilize os canais
            oficiais de atendimento informados pela loja.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line">
          <div className="grid min-w-[700px] grid-cols-5">
            {steps.map((step, index) => {
              const done = currentIndex > index;
              const active = currentIndex === index;
              return (
                <div
                  key={step.status}
                  className={cn(
                    "border-r border-line px-4 py-4 last:border-r-0",
                    active ? "bg-[#f7f7f5]" : "bg-white",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-semibold",
                        done
                          ? "border-ink bg-ink text-white"
                          : active
                            ? "border-ink bg-lime text-black"
                            : "border-line text-muted",
                      )}
                    >
                      {done ? <Check size={11} /> : index + 1}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-2.5 text-[9px] font-semibold uppercase tracking-[0.06em]",
                      done || active ? "text-ink" : "text-muted",
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
        <div>
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Package size={17} strokeWidth={1.6} />
            <h2 className="font-display text-base font-semibold text-ink">
              Itens do pedido
            </h2>
          </div>

          <ul className="divide-y divide-line border-b border-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <div className="relative h-[108px] w-[84px] shrink-0 overflow-hidden bg-[#f4f4f1]">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      sizes="84px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center px-2 text-center text-[8px] uppercase tracking-[0.1em] text-muted">
                      ZEVEN
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-display text-[15px] font-medium leading-snug text-ink">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-[10px] text-muted">
                      Tamanho {item.size} · Quantidade {item.quantity}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold tabular-nums text-ink">
                      {formatPrice(item.lineTotalCents)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {formatPrice(item.unitPriceCents)} / un.
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="border border-line bg-[#f7f7f5] p-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                Entrega
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#444]">
                {order.addressStreet}, {order.addressNumber}
                {order.addressComplement ? ` — ${order.addressComplement}` : ""}
                <br />
                {order.addressNeighborhood}
                <br />
                {order.addressCity} — {order.addressState}
                <br />
                CEP {formatCep(order.addressCep)}
              </p>
              <p className="mt-3 text-[10px] leading-relaxed text-muted">
                {SHIPPING_NOTICE}
              </p>
            </div>
            <div className="border border-line bg-[#f7f7f5] p-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                Pagamento
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-[#444]">
                <Clock3 size={14} className="text-[var(--color-warning)]" />
                {paymentMethodLabels[order.paymentMethod]}
              </div>
              <p className="mt-2.5 text-[10px] leading-relaxed text-muted">
                Status atual: {statusLabels[order.status]}. A loja entrará em
                contato pelos dados informados para concluir o pagamento.
              </p>
              <div className="mt-3 border-t border-line pt-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Contato
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[#555]">
                  {order.customerName}
                  <br />
                  {order.customerEmail}
                  <br />
                  {order.customerPhone}
                </p>
              </div>
            </div>
          </div>

          {order.notes ? (
            <div className="mt-4 border border-line bg-[#f7f7f5] p-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                Observações
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#444]">
                {order.notes}
              </p>
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="border border-line bg-[#f7f7f5] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">
              Resumo
            </p>
            <div className="mt-4 space-y-2.5 border-b border-line pb-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Subtotal</span>
                <span className="tabular-nums">
                  {formatPrice(order.subtotalCents)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Frete</span>
                <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-warning)]">
                  {SHIPPING_PENDING_LABEL}
                </span>
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-line py-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink">
                Total dos produtos
              </span>
              <span className="font-display text-xl font-semibold tabular-nums text-ink">
                {formatPrice(order.totalCents)}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <Link href="/conta" className="btn btn-outline btn-block">
                Acompanhar pedido
              </Link>
              <Link href="/catalogo" className="btn btn-lime btn-block">
                Continuar comprando
                <ArrowRight size={14} />
              </Link>
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-muted">
              Guarde o número <span className="text-[#444]">{order.orderNumber}</span>{" "}
              e o e-mail informado para consultar o pedido. Este link também pode
              ser salvo nos favoritos.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
