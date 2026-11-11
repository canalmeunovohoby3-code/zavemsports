import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();
  const settings = getSettings();

  return (
    <AdminShell
      user={{ name: admin.name, email: admin.email }}
      logoUrl={settings.logoUrl}
    >
      {children}
    </AdminShell>
  );
}
