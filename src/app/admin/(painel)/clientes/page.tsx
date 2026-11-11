import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listCustomers } from "@/lib/queries";
import { formatDateTime, formatPhone, formatPrice } from "@/lib/format";

export const metadata = { title: "Clientes" };

export default function AdminCustomersPage() {
  const customers = listCustomers();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Relacionamento"
        title="Clientes"
        description="Contatos criados a partir dos pedidos finalizados. Os dados de endereço ficam registrados em cada pedido."
      />

      <section className="border border-line bg-surface">
        {customers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users size={26} className="mx-auto text-line" />
            <h2 className="mt-4 font-display text-xl font-semibold uppercase tracking-[-0.02em]">
              Nenhum cliente cadastrado
            </h2>
            <p className="mt-2 text-xs text-muted">
              Os clientes aparecem aqui após a finalização do primeiro pedido.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>Pedidos</th>
                  <th>Valor em pedidos</th>
                  <th>Último pedido</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <p className="text-xs font-medium text-white">
                        {customer.name}
                      </p>
                      <p className="mt-1 text-[10px] text-muted">
                        {customer.email}
                      </p>
                    </td>
                    <td className="whitespace-nowrap text-xs text-muted">
                      {formatPhone(customer.phone)}
                    </td>
                    <td className="text-xs tabular-nums">
                      {customer.orderCount}
                    </td>
                    <td className="whitespace-nowrap text-xs tabular-nums">
                      {formatPrice(customer.totalSpentCents)}
                    </td>
                    <td className="whitespace-nowrap text-[10px] text-muted">
                      {customer.lastOrderAt
                        ? formatDateTime(customer.lastOrderAt)
                        : "—"}
                    </td>
                    <td>
                      <Link
                        href={`/admin/pedidos?q=${encodeURIComponent(customer.email)}`}
                        className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-lime"
                      >
                        Ver pedidos
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

      <p className="text-[10px] leading-relaxed text-muted">
        O valor considera pedidos não cancelados, incluindo os que aguardam
        confirmação de pagamento.
      </p>
    </div>
  );
}
