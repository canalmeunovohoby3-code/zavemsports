export type ShippingQuote = {
  id: string;
  label: string;
  priceCents: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
};

export type ShippingResult = {
  available: boolean;
  quotes: ShippingQuote[];
  notice: string;
};

export const SHIPPING_PENDING_LABEL = "A calcular";
export const SHIPPING_NOTICE =
  "O frete e o prazo serão informados após a confirmação do pedido, de acordo com o endereço de entrega.";

export async function calculateShipping(): Promise<ShippingResult> {
  return {
    available: false,
    quotes: [],
    notice: SHIPPING_NOTICE,
  };
}
