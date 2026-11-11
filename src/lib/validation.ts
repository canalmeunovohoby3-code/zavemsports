import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Informe o e-mail.")
  .max(160, "E-mail muito longo.")
  .email("Informe um e-mail válido.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe a senha.").max(200),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z
      .string()
      .min(10, "A nova senha deve ter pelo menos 10 caracteres.")
      .max(200),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome da categoria.")
    .max(80, "Nome muito longo."),
  description: z
    .string()
    .trim()
    .max(500, "Descrição muito longa.")
    .default(""),
  audience: z.enum(["adulto", "plus", "infantil"], {
    message: "Selecione o público.",
  }),
  kind: z.enum(["camiseta", "bermuda"], {
    message: "Selecione o tipo de peça.",
  }),
  imageUrl: z.string().trim().max(500).default(""),
  sortOrder: z.coerce
    .number()
    .int("Ordem inválida.")
    .min(0, "Ordem inválida.")
    .max(9999, "Ordem inválida."),
  isActive: z.boolean().default(true),
});

export const homeSectionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Informe o título da vitrine.")
    .max(80, "Título muito longo."),
  subtitle: z
    .string()
    .trim()
    .max(300, "Subtítulo muito longo.")
    .default(""),
  imageUrl: z.string().trim().max(1000).default(""),
  sourceMode: z.enum(
    ["manual", "best_sellers", "new_arrivals", "category", "audience"],
    { message: "Selecione um modo de exibição." },
  ),
  sourceCategoryId: z.number().int().positive().nullable().default(null),
  sourceAudience: z
    .enum(["adulto", "plus", "infantil"])
    .nullable()
    .default(null),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce
    .number()
    .int("Ordem inválida.")
    .min(0, "Ordem inválida.")
    .max(9999, "Ordem inválida."),
  productIds: z.array(z.number().int().positive()).max(24).default([]),
});

export const variantSchema = z.object({
  size: z
    .string()
    .trim()
    .min(1, "Informe o tamanho.")
    .max(20, "Tamanho muito longo."),
  stock: z.coerce
    .number()
    .int("Estoque inválido.")
    .min(0, "Estoque não pode ser negativo.")
    .max(999999, "Estoque inválido."),
  sku: z.string().trim().max(60, "SKU muito longo.").default(""),
});

export const productImageSchema = z.object({
  url: z.string().trim().min(1).max(1000),
  alt: z.string().trim().max(160).default(""),
});

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do produto.")
    .max(160, "Nome muito longo."),
  categoryId: z.coerce.number().int().positive("Selecione a categoria."),
  description: z.string().trim().max(5000, "Descrição muito longa.").default(""),
  details: z.string().trim().max(5000, "Detalhes muito longos.").default(""),
  priceCents: z.coerce
    .number()
    .int()
    .min(1, "Informe um preço maior que zero.")
    .max(100000000, "Preço inválido."),
  compareAtCents: z
    .union([z.coerce.number().int().min(0).max(100000000), z.null()])
    .default(null),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(productImageSchema).max(10).default([]),
  variants: z
    .array(variantSchema)
    .min(1, "Cadastre pelo menos um tamanho.")
    .max(40, "Muitos tamanhos cadastrados."),
});

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo.")
    .max(120, "Nome muito longo."),
  customerEmail: emailSchema,
  customerPhone: z
    .string()
    .trim()
    .min(10, "Informe um telefone com DDD.")
    .max(20, "Telefone inválido."),
  addressCep: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "Informe um CEP válido com 8 dígitos."),
  addressStreet: z
    .string()
    .trim()
    .min(3, "Informe a rua.")
    .max(160, "Endereço muito longo."),
  addressNumber: z
    .string()
    .trim()
    .min(1, "Informe o número.")
    .max(30, "Número inválido."),
  addressComplement: z
    .string()
    .trim()
    .max(120, "Complemento muito longo.")
    .default(""),
  addressNeighborhood: z
    .string()
    .trim()
    .min(2, "Informe o bairro.")
    .max(120, "Bairro muito longo."),
  addressCity: z
    .string()
    .trim()
    .min(2, "Informe a cidade.")
    .max(120, "Cidade muito longa."),
  addressState: z
    .string()
    .trim()
    .length(2, "Use a sigla do estado com 2 letras.")
    .transform((value) => value.toUpperCase()),
  notes: z.string().trim().max(500, "Observações muito longas.").default(""),
  paymentMethod: z.enum(["pix", "credit_card"], {
    message: "Selecione a forma de pagamento.",
  }),
});

export const orderItemsSchema = z
  .array(
    z.object({
      variantId: z.number().int().positive(),
      quantity: z.number().int().min(1).max(10),
    }),
  )
  .min(1, "Seu carrinho está vazio.")
  .max(50, "Muitos itens no carrinho.");

export const trackOrderSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .min(3, "Informe o número do pedido.")
    .max(40),
  email: emailSchema,
});

export type FieldErrors = Record<string, string[] | undefined>;

export function zodFieldErrors(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors as FieldErrors;
}
