import { redirect } from "next/navigation";
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
    redirect("/admin/setup");
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
