"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  createProduct,
  deleteProduct,
  getCategoryById,
  getProductById,
  updateProduct,
} from "@/lib/queries";
import {
  parsePriceToCents,
} from "@/lib/format";
import {
  productImageSchema,
  productSchema,
  variantSchema,
  zodFieldErrors,
} from "@/lib/validation";
import { isValidImageReference } from "@/lib/uploads";
import type { ActionState } from "@/lib/action-state";
import { z } from "zod";

export async function saveProductAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const productIdRaw = String(formData.get("productId") ?? "");
  const productId = productIdRaw ? Number(productIdRaw) : null;
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = Number(formData.get("categoryId") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  const price = String(formData.get("price") ?? "");
  const compareAt = String(formData.get("compareAt") ?? "").trim();
  const isActive = formData.get("isActive") === "on";
  const isFeatured = formData.get("isFeatured") === "on";

  const priceCents = parsePriceToCents(price);
  if (priceCents == null || priceCents <= 0) {
    return {
      status: "error",
      message: "Informe um preço válido.",
      fieldErrors: { price: ["Informe um preço maior que zero."] },
    };
  }

  let compareAtCents: number | null = null;
  if (compareAt) {
    const parsedCompare = parsePriceToCents(compareAt);
    if (parsedCompare == null || parsedCompare <= 0) {
      return {
        status: "error",
        message: "Preço anterior inválido.",
        fieldErrors: { compareAt: ["Informe um valor válido ou deixe vazio."] },
      };
    }
    if (parsedCompare <= priceCents) {
      return {
        status: "error",
        message: "O preço anterior deve ser maior que o preço atual.",
        fieldErrors: {
          compareAt: ["Deve ser maior que o preço atual."],
        },
      };
    }
    compareAtCents = parsedCompare;
  }

  let images: Array<{ url: string; alt: string }>;
  try {
    const rawImages = JSON.parse(String(formData.get("images") ?? "[]"));
    const parsedImages = z.array(productImageSchema).max(10).safeParse(rawImages);
    if (!parsedImages.success) {
      return { status: "error", message: "Revise as imagens do produto." };
    }
    images = parsedImages.data.filter((image) => image.url);
    if (images.some((image) => !isValidImageReference(image.url))) {
      return {
        status: "error",
        message:
          "Uma das imagens possui endereço inválido. Use upload interno ou URL https.",
        fieldErrors: { images: ["Endereço de imagem inválido."] },
      };
    }
  } catch {
    return { status: "error", message: "Não foi possível ler as imagens." };
  }

  let variants: Array<{ size: string; stock: number; sku: string }>;
  try {
    const rawVariants = JSON.parse(String(formData.get("variants") ?? "[]"));
    const parsedVariants = z
      .array(variantSchema)
      .min(1)
      .max(40)
      .safeParse(rawVariants);
    if (!parsedVariants.success) {
      return {
        status: "error",
        message: "Revise a grade de tamanhos e o estoque.",
        fieldErrors: { variants: ["Revise os tamanhos."] },
      };
    }
    variants = parsedVariants.data.map((variant) => ({
      size: variant.size.trim(),
      stock: variant.stock,
      sku: variant.sku.trim(),
    }));

    const normalized = new Set<string>();
    for (const variant of variants) {
      const key = variant.size.toLowerCase();
      if (normalized.has(key)) {
        return {
          status: "error",
          message: `O tamanho "${variant.size}" está duplicado.`,
          fieldErrors: { variants: ["Remova tamanhos duplicados."] },
        };
      }
      normalized.add(key);
    }
  } catch {
    return { status: "error", message: "Não foi possível ler os tamanhos." };
  }

  const parsed = productSchema.safeParse({
    name,
    categoryId,
    description,
    details,
    priceCents,
    compareAtCents,
    isActive,
    isFeatured,
    images,
    variants,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os dados do produto.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const category = getCategoryById(categoryId);
  if (!category) {
    return {
      status: "error",
      message: "Selecione uma categoria válida.",
      fieldErrors: { categoryId: ["Categoria inválida."] },
    };
  }

  let savedId: number;
  if (productId) {
    const existing = getProductById(productId);
    if (!existing) {
      return { status: "error", message: "Produto não encontrado." };
    }
    updateProduct(productId, parsed.data);
    savedId = productId;
  } else {
    savedId = createProduct(parsed.data);
  }

  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/produtos");
  revalidatePath(`/categoria/${category.slug}`);
  revalidatePath(`/admin/produtos/${savedId}`);

  redirect(`/admin/produtos/${savedId}?ok=${productId ? "atualizado" : "criado"}`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("productId") ?? 0);
  if (!id) return;
  const product = getProductById(id);
  deleteProduct(id);
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/produtos");
  if (product) revalidatePath(`/categoria/${product.categorySlug}`);
  redirect("/admin/produtos?ok=excluido");
}
