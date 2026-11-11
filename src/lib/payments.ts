import type { PaymentMethod } from "@/config/site";

export type PaymentProviderId = "none" | "mercadopago" | "stripe";

export type PaymentIntentInput = {
  orderNumber: string;
  amountCents: number;
  method: PaymentMethod;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
};

export type PaymentIntentResult =
  | {
      status: "pending";
      providerReference: string;
      redirectUrl?: string;
    }
  | {
      status: "not_configured";
    };

export type PaymentAdapter = {
  id: Exclude<PaymentProviderId, "none">;
  label: string;
  createPayment: (input: PaymentIntentInput) => Promise<PaymentIntentResult>;
};

export function getPaymentAdapter(): PaymentAdapter | null {
  return null;
}

export type PaymentProviderStatus = {
  id: PaymentProviderId;
  configured: boolean;
  label: string;
};

export const PAYMENT_PENDING_NOTICE =
  "O pedido será registrado como Aguardando pagamento. Nenhuma cobrança é realizada neste site; a loja entrará em contato pelos dados informados para concluir o PIX ou o cartão.";

export function getPaymentProviderStatus(): PaymentProviderStatus {
  const provider = (process.env.PAYMENT_PROVIDER ?? "none") as PaymentProviderId;

  if (provider === "mercadopago") {
    return {
      id: provider,
      configured: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
      label: "Mercado Pago",
    };
  }

  if (provider === "stripe") {
    return {
      id: provider,
      configured: Boolean(process.env.STRIPE_SECRET_KEY),
      label: "Stripe",
    };
  }

  return {
    id: "none",
    configured: false,
    label: "Pagamento combinado com a loja",
  };
}
