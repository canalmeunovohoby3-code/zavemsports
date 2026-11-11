import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  LayoutGrid,
  Plus,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ProductStatusBadge } from "@/components/admin/status-badge";
import { listHomeSections } from "@/lib/queries";
import {
  homeSectionModes,
  type HomeSectionMode,
} from "@/config/site";
import { cn } from "@/lib/cn";
import {
  moveHomeSectionAction,
  toggleHomeSectionAction,
} from "@/app/admin/(painel)/vitrines/actions";

export const metadata = { title: "Vitrines e seções" };

const okMessages: Record<string, string> = {
  criada: "Vitrine criada com sucesso.",
  atualizada: "Vitrine atualizada com sucesso.",
  excluida: "Vitrine excluída.",
  ordem: "Ordem das vitrines atualizada.",
  ativada: "Vitrine ativada e publicada na loja.",
  desativada: "Vitrine desativada.",
};

export default async function AdminSectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const params = await searchParams;
  const sections = listHomeSections({ includeInactive: true });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Página inicial"
        title="Vitrines e seções"
        description="Monte as seções comerciais da home, escolha os produtos, defina a ordem e publique sem alterar código."
        actions={
          <Link href="/admin/vitrines/nova" className="btn btn-lime btn-sm">
            <Plus size={14} />
            Nova vitrine
          </Link>
        }
      />

      {params.ok && okMessages[params.ok] ? (
        <AdminNotice tone="success">{okMessages[params.ok]}</AdminNotice>
      ) : null}
      {params.erro ? (
        <AdminNotice tone="error">{params.erro}</AdminNotice>
      ) : null}

      <AdminNotice tone="info" title="Como funciona">
        A página inicial exibe somente vitrines ativas, na ordem definida aqui.
        Produtos inativos ou sem estoque continuam seguindo as regras atuais da
        loja. Vitrines manuais vazias não aparecem publicamente até receberem
        produtos.
      </AdminNotice>

      <section className="border border-line bg-surface">
        {sections.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <LayoutGrid size={26} className="mx-auto text-line" />
            <h2 className="mt-4 font-display text-xl font-semibold uppercase tracking-[-0.02em]">
              Nenhuma vitrine cadastrada
            </h2>
            <p className="mx-auto mt-2 max-w-[420px] text-xs leading-relaxed text-muted">
              Crie a primeira seção para montar a página inicial da loja.
            </p>
            <Link
              href="/admin/vitrines/nova"
              className="btn btn-lime btn-sm mt-6"
            >
              <Plus size={14} />
              Criar vitrine
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ordem</th>
                  <th>Vitrine</th>
                  <th>Modo</th>
                  <th>Produtos</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sections.map((section, index) => (
                  <tr key={section.id}>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 text-xs tabular-nums text-muted">
                          {section.sortOrder}
                        </span>
                        <form action={moveHomeSectionAction}>
                          <input
                            type="hidden"
                            name="sectionId"
                            value={section.id}
                          />
                          <input type="hidden" name="direction" value="up" />
                          <button
                            type="submit"
                            disabled={index === 0}
                            aria-label={`Mover ${section.title} para cima`}
                            className="flex h-7 w-7 items-center justify-center border border-line text-muted transition hover:text-lime disabled:opacity-30"
                          >
                            <ArrowUp size={11} />
                          </button>
                        </form>
                        <form action={moveHomeSectionAction}>
                          <input
                            type="hidden"
                            name="sectionId"
                            value={section.id}
                          />
                          <input type="hidden" name="direction" value="down" />
                          <button
                            type="submit"
                            disabled={index === sections.length - 1}
                            aria-label={`Mover ${section.title} para baixo`}
                            className="flex h-7 w-7 items-center justify-center border border-line text-muted transition hover:text-lime disabled:opacity-30"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </form>
                      </div>
                    </td>
                    <td>
                      <Link
                        href={`/admin/vitrines/${section.id}`}
                        className="admin-link text-xs font-medium"
                      >
                        {section.title}
                      </Link>
                      {section.subtitle ? (
                        <p className="mt-1 max-w-[380px] truncate text-[10px] text-muted">
                          {section.subtitle}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[9px] text-muted">
                        {section.imageUrl
                          ? "Com imagem de apresentação"
                          : "Sem imagem de apresentação"}
                      </p>
                    </td>
                    <td className="text-[10px] text-muted">
                      {
                        homeSectionModes[
                          section.sourceMode as HomeSectionMode
                        ].label
                      }
                    </td>
                    <td>
                      {section.sourceMode === "manual" ? (
                        <>
                          <span className="text-xs tabular-nums">
                            {section.productIds.length}
                          </span>
                          <p className="mt-1 text-[9px] text-muted">
                            selecionado(s)
                          </p>
                        </>
                      ) : (
                        <span className="tag">Automático</span>
                      )}
                    </td>
                    <td>
                      <ProductStatusBadge active={section.isActive} />
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <form action={toggleHomeSectionAction}>
                          <input
                            type="hidden"
                            name="sectionId"
                            value={section.id}
                          />
                          <button
                            type="submit"
                            className={cn(
                              "text-[9px] font-semibold uppercase tracking-[0.08em] transition",
                              section.isActive
                                ? "text-muted hover:text-danger"
                                : "text-lime hover:text-white",
                            )}
                          >
                            {section.isActive ? "Desativar" : "Ativar"}
                          </button>
                        </form>
                        <Link
                          href={`/admin/vitrines/${section.id}`}
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
    </div>
  );
}
