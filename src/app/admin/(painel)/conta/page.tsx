import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PasswordForm } from "@/components/admin/password-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Conta e segurança" };

export default async function AdminAccountPage() {
  const admin = await requireAdmin();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Segurança"
        title="Conta e segurança"
        description="Gerencie o acesso administrativo da loja. A sessão expira automaticamente após 7 dias."
        actions={
          <Link href="/admin" className="btn btn-outline btn-sm">
            <ArrowLeft size={13} />
            Voltar ao painel
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <PasswordForm />

        <aside className="space-y-4">
          <section className="border border-line bg-surface p-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-lime">
              Administrador
            </p>
            <p className="mt-4 text-sm text-white">{admin.name}</p>
            <p className="mt-1 text-xs text-muted">{admin.email}</p>
            <div className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-[10px] uppercase tracking-[0.1em] text-muted">
              <ShieldCheck size={13} className="text-lime" />
              Acesso protegido por sessão
            </div>
          </section>

          <section className="border border-line bg-surface p-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
              Boas práticas
            </p>
            <ul className="mt-3 space-y-2 text-[10px] leading-relaxed text-muted">
              <li>Use uma senha exclusiva para o painel.</li>
              <li>Não compartilhe credenciais por canais públicos.</li>
              <li>
                A recuperação de senha é feita diretamente no servidor, com
                acesso ao banco de dados.
              </li>
              <li>
                Em produção, mantenha HTTPS ativo para proteger o cookie de
                sessão.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
