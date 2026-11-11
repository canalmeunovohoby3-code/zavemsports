export const siteConfig = {
  name: "ZEVEN SPORTS",
  shortName: "ZEVEN",
  description:
    "Camisetas de algodão, bermudas, tamanhos plus size e linha infantil. Essenciais ZEVEN SPORTS para acompanhar o seu ritmo.",
  locale: "pt-BR",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  colors: {
    black: "#000000",
    lime: "#ACFA04",
  },
  whatsapp: {
    display: "(16) 99774-070",
    number: "1699774070",
    pendingNote:
      "Número informado pela loja, com confirmação pendente. O link será liberado após a validação.",
  },
  instagram: {
    url: "",
    handle: "",
  },
  logo: {
    url: "/brand/logo-zeven.png",
    alt: "ZEVEN SPORTS",
  },
  sizePresets: {
    plus: ["G1", "G2", "G3"],
    kids: ["02", "04", "06", "08", "10", "12", "14"],
  },
  categories: [
    {
      name: "Camisetas Adulto",
      slug: "camisetas-adulto",
      audience: "adulto",
      kind: "camiseta",
      description:
        "Camisetas básicas de algodão para acompanhar o dia a dia e o treino.",
      sortOrder: 1,
    },
    {
      name: "Bermudas Adulto",
      slug: "bermudas-adulto",
      audience: "adulto",
      kind: "bermuda",
      description: "Bermudas para vestir com liberdade e seguir em movimento.",
      sortOrder: 2,
    },
    {
      name: "Camisetas Plus Size",
      slug: "camisetas-plus-size",
      audience: "plus",
      kind: "camiseta",
      description:
        "Camisetas plus size disponíveis na grade G1, G2 e G3.",
      sortOrder: 3,
    },
    {
      name: "Bermudas Plus Size",
      slug: "bermudas-plus-size",
      audience: "plus",
      kind: "bermuda",
      description:
        "Bermudas plus size disponíveis na grade G1, G2 e G3.",
      sortOrder: 4,
    },
    {
      name: "Camisetas Infantil",
      slug: "camisetas-infantil",
      audience: "infantil",
      kind: "camiseta",
      description:
        "Camisetas infantis disponíveis nos tamanhos 02 ao 14, conforme estoque.",
      sortOrder: 5,
    },
    {
      name: "Bermudas Infantil",
      slug: "bermudas-infantil",
      audience: "infantil",
      kind: "bermuda",
      description:
        "Bermudas infantis disponíveis nos tamanhos 02 ao 14, conforme estoque.",
      sortOrder: 6,
    },
  ] as const,
  defaultSettings: {
    announcement: "ZEVEN SPORTS — ESSENCIAIS PARA O SEU DIA A DIA",
    banner_eyebrow: "ZEVEN SPORTS · ESSENCIAIS",
    banner_title: "O essencial",
    banner_accent: "em movimento.",
    banner_text:
      "Camisetas de algodão, bermudas e uma grade pensada para diferentes corpos. Básicos para o dia a dia, do adulto ao infantil.",
    banner_cta_label: "Ver produtos",
    banner_cta_href: "/catalogo",
    banner_image: "",
    banner_image_alt: "",
    whatsapp_display: "(16) 99774-070",
    whatsapp_number: "1699774070",
    instagram_url: "",
    logo_url: "/brand/logo-zeven.png",
    contact_email: "",
  },
} as const;

export type Audience = "adulto" | "plus" | "infantil";
export type CategoryKind = "camiseta" | "bermuda";

export const audienceLabels: Record<Audience, string> = {
  adulto: "Adulto",
  plus: "Plus Size",
  infantil: "Infantil",
};

export const statusLabels = {
  pending_payment: "Aguardando pagamento",
  confirmed: "Pagamento confirmado",
  processing: "Em preparação",
  shipped: "Enviado",
  delivered: "Entregue",
  canceled: "Cancelado",
} as const;

export type OrderStatus = keyof typeof statusLabels;

export const paymentMethodLabels = {
  pix: "PIX",
  credit_card: "Cartão de crédito",
} as const;

export type PaymentMethod = keyof typeof paymentMethodLabels;

