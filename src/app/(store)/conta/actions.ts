"use server";

import {
  findStoreOrderForTracking,
  isStoreDemoMode,
} from "@/lib/storefront";
import { trackOrderSchema, zodFieldErrors } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

export async function trackOrderAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (isStoreDemoMode()) {
    return {
      status: "error",
      message:
        "A consulta de pedidos está indisponível no modo de demonstração.",
    };
  }

  const parsed = trackOrderSchema.safeParse({
    orderNumber: String(formData.get("orderNumber") ?? ""),
    email: String(formData.get("email") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os dados informados.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const order = await findStoreOrderForTracking(
    parsed.data.orderNumber,
    parsed.data.email,
  );

  if (!order) {
    return {
      status: "error",
      message:
        "Não encontramos um pedido com esse número e e-mail. Confira os dados e tente novamente.",
    };
  }

  return {
    status: "success",
    token: order.publicToken,
    message: "Pedido localizado.",
  };
}
