"use server";

import { redirect } from "next/navigation";
import { changeAdminPassword, destroySession, requireAdmin } from "@/lib/auth";
import { changePasswordSchema, zodFieldErrors } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

export async function changePasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos de senha.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return {
      status: "error",
      message: "A nova senha deve ser diferente da senha atual.",
      fieldErrors: { newPassword: ["Escolha uma senha diferente."] },
    };
  }

  const result = await changeAdminPassword(
    admin.id,
    parsed.data.currentPassword,
    parsed.data.newPassword,
  );

  if (!result.ok) {
    return {
      status: "error",
      message: result.error,
      fieldErrors: { currentPassword: [result.error] },
    };
  }

  await destroySession();
  redirect("/admin/login?ok=senha");
}
