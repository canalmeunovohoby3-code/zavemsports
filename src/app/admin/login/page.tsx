import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/login-form";
import { hasAdminUser, redirectIfAuthenticated } from "@/lib/auth";

export const metadata = { title: "Entrar" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await redirectIfAuthenticated();

  if (!(await hasAdminUser())) {
    return (
      <AuthShell>
        <div>
          <p className="eyebrow">Painel ZEVEN</p>
          <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-[-0.04em]">
            Acesso inicial
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Nenhum administrador foi configurado ainda. A criação é feita
            diretamente no servidor, por segurança.
          </p>
          <div className="mt-6 border border-line bg-surface p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-lime">
              No terminal do projeto
            </p>
            <code className="mt-2 block break-all text-xs text-white">
              npm run admin:create
            </code>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              O comando solicita nome, e-mail e senha, e cria o primeiro acesso.
              Esta página não permite cadastro público.
            </p>
          </div>
          <p className="mt-5 text-[10px] leading-relaxed text-muted">
            Depois de criar o acesso, recarregue esta página para entrar.
          </p>
        </div>
      </AuthShell>
    );
  }

  const { ok } = await searchParams;
  const notice =
    ok === "senha"
      ? "Senha alterada com sucesso. Entre novamente com a nova senha."
      : undefined;

  return (
    <AuthShell>
      <LoginForm notice={notice} />
    </AuthShell>
  );
}
