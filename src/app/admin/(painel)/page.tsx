import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  ClipboardList,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  TriangleAlert,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-notice";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  getDashboardStats,
  listLowStock,
  listOrders,
} from "@/lib/queries";
import { getSettings, isWhatsAppPending } from "@/lib/settings";
import { formatDateTime, formatPrice } from "@/lib/format";

export const metadata = { title: "Visão geral" };

export default function AdminDashboardPage() {
  const stats = getDashboardStats();
  const orders = listOrders({ limit: 6 });
  const lowStock = listLowStock(6);
  const settings = getSettings();
  const whatsappPending = isWhatsAppPending(settings);

  const pendingSettings = [
    {
      label: "WhatsApp com número válido",
      done: !whatsappPending,
      href: "/admin/configuracoes",
    },
    {
      label: "Logo oficial cadastrada",
      done: Boolean(settings.logoUrl),
      href: "/admin/configuracoes",
    },
    {
      label: "Instagram configurado",
      done: Boolean(settings.instagramUrl),
      href: "/admin/configuracoes",
    },
    {
      label: "Banner da loja configurado",
      done: Boolean(settings.bannerImage),
      href: "/admin/configuracoes",
    },
  ];
  const pendingCount = pendingSettings.filter((item) => !item.done).length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Painel"
        title="Visão geral"
        description="Acompanhe catálogo, pedidos e pendências da loja. Todos os números são calculados a partir dos dados reais cadastrados."
        actions={
          <>
            <Link href="/admin/produtos/novo" className="btn btn-lime btn-sm">
              <Plus size={14} />
              Novo produto
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
            >
              Ver loja
              <ArrowUpRight size={13} />
            </Link>
          </>
        }
      />

      {stats.totalProducts === 0 ? (
        <AdminNotice tone="info" title="A loja ainda não tem produtos">
          O catálogo será exibido na loja somente depois que você cadastrar os
          produtos e as variações de tamanho. Comece criando a primeira peça.
          <div className="mt-3">
            <Link
              href="/admin/produtos/novo"
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-lime"
            >
              Cadastrar primeiro produto
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </AdminNotice>
      ) : null}

      {pendingCount > 0 ? (
        <AdminNotice tone="warning" title="Configurações pendentes">
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {pendingSettings
              .filter((item) => !item.done)
              .map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 text-[11px] text-soft transition hover:text-lime"
                >
                  <TriangleAlert size={12} className="text-warning" />
                  {item.label}
                  <ArrowUpRight size={11} />
                </Link>
              ))}
          </div>
        </AdminNotice>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat-card">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
            Pedidos aguardando
          </p>
          <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
            {stats.pendingOrders}
          </p>
          <p className="mt-2 text-[10px] text-muted">
            de {stats.totalOrders} pedido(s) no total
          </p>
          <Link
            href="/admin/pedidos"
            className="mt-4 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-lime"
          >
            Ver pedidos <ArrowUpRight size={11} />
          </Link>
        </div>
        <div className="stat-card">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
            Vendas confirmadas
          </p>
          <p className="mt-4 font-display text-2xl font-semibold tabular-nums">
            {formatPrice(stats.confirmedRevenueCents)}
          </p>
          <p className="mt-2 text-[10px] leading-relaxed text-muted">
            Pedidos com pagamento confirmado ou em andamento.
          </p>
        </div>
        <div className="stat-card">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
            Produtos ativos
          </p>
          <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
            {stats.activeProducts}
          </p>
          <p className="mt-2 text-[10px] text-muted">
            {stats.totalProducts} cadastrado(s)
          </p>
          <Link
            href="/admin/produtos"
            className="mt-4 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-lime"
          >
            Gerenciar <ArrowUpRight size={11} />
          </Link>
        </div>
        <div className="stat-card">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
            Estoque baixo
          </p>
          <p className="mt-4 font-display text-4xl font-semibold tabular-nums">
            {stats.lowStockVariants}
          </p>
          <p className="mt-2 text-[10px] text-muted">
            Variações com até 3 unidades
          </p>
          <p className="mt-4 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
            <Users size={11} />
            {stats.customers} cliente(s)
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <section className="border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="flex items-center gap-2">
              <ClipboardList size={15} className="text-lime" />
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Pedidos recentes
              </h2>
            </div>
            <Link
              href="/admin/pedidos"
              className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted transition hover:text-lime"
            >
              Ver todos
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <ShoppingBag size={22} className="mx-auto text-line" />
              <p className="mt-3 text-xs text-muted">
                Nenhum pedido registrado ainda.
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="admin-link font-medium"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="mt-1 text-[10px] text-muted">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </td>
                      <td>
                        <p className="text-white">{order.customerName}</p>
                        <p className="mt-1 text-[10px] text-muted">
                          {order.itemCount} item(ns)
                        </p>
                      </td>
                      <td className="tabular-nums">{formatPrice(order.totalCents)}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="flex items-center gap-2">
              <Boxes size={15} className="text-lime" />
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                Estoque baixo
              </h2>
            </div>
            <Link
              href="/admin/produtos"
              className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted transition hover:text-lime"
            >
              Ver produtos
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Package size={22} className="mx-auto text-line" />
              <p className="mt-3 text-xs text-muted">
                Nenhuma variação com estoque baixo.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.map((item) => (
                <li key={item.variantId}>
                  <Link
                    href={`/admin/produtos/${item.productId}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-raised"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs text-white">
                        {item.productName}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-muted">
                        Tamanho {item.size}
                      </p>
                    </div>
                    <span
                      className={
                        item.stock === 0
                          ? "tag tag-danger"
                          : "tag tag-warning"
                      }
                    >
                      {item.stock} un.
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            href: "/admin/produtos/novo",
            icon: Plus,
            title: "Cadastrar produto",
            text: "Nome, imagens, preço e grade.",
          },
          {
            href: "/admin/categorias",
            icon: Package,
            text: "Organize as linhas da loja.",
            title: "Categorias",
          },
          {
            href: "/admin/configuracoes",
            icon: Settings,
            text: "Banner, logo, WhatsApp e Instagram.",
            title: "Configurações",
          },
          {
            href: "/admin/pedidos",
            icon: ClipboardList,
            text: "Acompanhe pagamentos e entregas.",
            title: "Pedidos",
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center justify-between border border-line bg-surface p-4 transition hover:border-lime/40 hover:bg-raised"
            >
              <div className="flex items-start gap-3">
                <Icon size={17} className="mt-0.5 text-lime" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white">
                    {action.title}
                  </p>
                  <p className="mt-1 text-[10px] text-muted">{action.text}</p>
                </div>
              </div>
              <ArrowUpRight
                size={14}
                className="shrink-0 text-muted transition group-hover:text-lime"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
