"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { statusLabels, type OrderStatus } from "@/config/site";
import { updateOrderStatus } from "@/lib/orders";

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const orderId = Number(formData.get("orderId") ?? 0);
  const status = String(formData.get("status") ?? "") as OrderStatus;

  if (!orderId || !(status in statusLabels)) {
    redirect("/admin/pedidos?erro=Status%20inv%C3%A1lido.");
  }

  const result = updateOrderStatus(orderId, status);
  if (!result.ok) {
    redirect(
      `/admin/pedidos/${orderId}?erro=${encodeURIComponent(result.error ?? "Não foi possível atualizar.")}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/catalogo");
  revalidatePath("/");
  redirect(`/admin/pedidos/${orderId}?ok=status`);
}
