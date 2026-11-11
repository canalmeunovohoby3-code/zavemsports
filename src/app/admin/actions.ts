"use server";

import { redirect } from "next/navigation";
import {
  canAttemptLogin,
  clearLoginFailures,
  createFirstAdmin,
  createSession,
  destroySession,
  recordLoginFailure,
  verifyCredentials,
} from "@/lib/auth";
import { loginSchema, setupSchema, zodFieldErrors } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";
import { hasAdminUser } from "@/lib/auth";

export async function loginAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Informe e-mail e senha válidos.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  if (!canAttemptLogin(parsed.data.email)) {
    return {
      status: "error",
      message:
        "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
    };
  }

  const admin = await verifyCredentials(
    parsed.data.email,
    parsed.data.password,
  );

  if (!admin) {
    recordLoginFailure(parsed.data.email);
    return {
      status: "error",
      message: "E-mail ou senha incorretos.",
    };
  }

  clearLoginFailures(parsed.data.email);
  await createSession(admin.id);
  redirect("/admin");
}

export async function setupAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (await hasAdminUser()) {
    return {
      status: "error",
      message: "O administrador já foi configurado. Faça login para continuar.",
    };
  }

  const parsed = setupSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os dados para criar o acesso.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const userId = await createFirstAdmin({
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (!userId) {
    return {
      status: "error",
      message: "O administrador já foi configurado. Faça login para continuar.",
    };
  }

  await createSession(userId);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
