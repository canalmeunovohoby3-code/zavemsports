"use server";

import { OrderError, placeOrder } from "@/lib/orders";
import { onlyDigits } from "@/lib/format";
import {
  checkoutSchema,
  orderItemsSchema,
  zodFieldErrors,
} from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

export async function placeOrderAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const accepted = formData.get("accepted") === "on";
  if (!accepted) {
    return {
      status: "error",
      message: "Confirme que você está ciente das condições do pedido.",
      fieldErrors: {
        accepted: ["Confirme para continuar."],
      },
    };
  }

  let items: Array<{ variantId: number; quantity: number }>;
  try {
    const parsed = JSON.parse(String(formData.get("items") ?? "[]"));
    const result = orderItemsSchema.safeParse(parsed);
    if (!result.success) {
      return {
        status: "error",
        message: "Sua sacola precisa ser revista antes de continuar.",
      };
    }
    items = result.data;
  } catch {
    return {
      status: "error",
      message: "Não foi possível ler sua sacola. Tente novamente.",
    };
  }

  const rawData = {
    customerName: String(formData.get("customerName") ?? ""),
    customerEmail: String(formData.get("customerEmail") ?? ""),
    customerPhone: onlyDigits(String(formData.get("customerPhone") ?? "")),
    addressCep: onlyDigits(String(formData.get("addressCep") ?? "")),
    addressStreet: String(formData.get("addressStreet") ?? ""),
    addressNumber: String(formData.get("addressNumber") ?? ""),
    addressComplement: String(formData.get("addressComplement") ?? ""),
    addressNeighborhood: String(formData.get("addressNeighborhood") ?? ""),
    addressCity: String(formData.get("addressCity") ?? ""),
    addressState: String(formData.get("addressState") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    paymentMethod: String(formData.get("paymentMethod") ?? ""),
  };

  if (rawData.customerPhone.length < 10 || rawData.customerPhone.length > 11) {
    return {
      status: "error",
      message: "Informe um telefone válido com DDD.",
      fieldErrors: {
        customerPhone: ["Informe um telefone com DDD."],
      },
    };
  }

  const parsed = checkoutSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos destacados para continuar.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const expectedSubtotalCents = Number(
    formData.get("expectedSubtotalCents") ?? NaN,
  );
  if (!Number.isInteger(expectedSubtotalCents)) {
    return {
      status: "error",
      message: "Valor do pedido inválido. Revise a sacola.",
    };
  }

  try {
    const order = placeOrder({
      ...parsed.data,
      items,
      expectedSubtotalCents,
    });
    return {
      status: "success",
      message: "Pedido registrado.",
      token: order.publicToken,
    };
  } catch (error) {
    if (error instanceof OrderError) {
      return {
        status: "error",
        message: error.message,
      };
    }
    console.error("Erro ao registrar pedido", error);
    return {
      status: "error",
      message:
        "Não foi possível registrar o pedido agora. Tente novamente em instantes.",
    };
  }
}
