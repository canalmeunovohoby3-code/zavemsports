"use server";

import { redirect } from "next/navigation";
import {
  canAttemptLogin,
  clearLoginFailures,
  createSession,
  DEMO_SESSION_DURATION_MS,
  destroySession,
  recordLoginFailure,
  verifyCredentials,
} from "@/lib/auth";
import { loginSchema, zodFieldErrors } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

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
  await createSession(
    admin.id,
    admin.role === "demo_admin" ? DEMO_SESSION_DURATION_MS : undefined,
  );
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
