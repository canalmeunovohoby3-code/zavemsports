import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/auth-shell";
import { SetupForm } from "@/components/admin/setup-form";
import { hasAdminUser, redirectIfAuthenticated } from "@/lib/auth";

export const metadata = { title: "Configurar acesso" };

export default async function AdminSetupPage() {
  await redirectIfAuthenticated();

  if (await hasAdminUser()) {
    redirect("/admin/login");
  }

  return (
    <AuthShell>
      <SetupForm />
    </AuthShell>
  );
}
