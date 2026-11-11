"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { updateSettings } from "@/lib/settings";
import { isValidImageReference } from "@/lib/uploads";
import {
  emailSchema,
  zodFieldErrors,
} from "@/lib/validation";
import {
  formatPhone,
  isValidWhatsAppNumber,
  onlyDigits,
} from "@/lib/format";
import type { ActionState } from "@/lib/action-state";
import { z } from "zod";

const settingsSchema = z.object({
  announcement: z.string().trim().max(120, "Anúncio muito longo.").default(""),
  bannerEyebrow: z
    .string()
    .trim()
    .max(80, "Texto muito longo.")
    .default(""),
  bannerTitle: z
    .string()
    .trim()
    .min(1, "Informe o título do banner.")
    .max(80, "Título muito longo."),
  bannerAccent: z
    .string()
    .trim()
    .min(1, "Informe o destaque do banner.")
    .max(80, "Destaque muito longo."),
  bannerText: z
    .string()
    .trim()
    .max(400, "Texto do banner muito longo.")
    .default(""),
  bannerCtaLabel: z
    .string()
    .trim()
    .min(1, "Informe o texto do botão.")
    .max(40, "Texto do botão muito longo."),
  bannerCtaHref: z
    .string()
    .trim()
    .min(1, "Informe o destino do botão.")
    .max(300, "Destino muito longo."),
  bannerImage: z.string().trim().max(1000).default(""),
  bannerImageAlt: z.string().trim().max(160).default(""),
  whatsappDisplay: z.string().trim().max(40).default(""),
  whatsappNumber: z.string().trim().max(20).default(""),
  instagramUrl: z.string().trim().max(300).default(""),
  logoUrl: z.string().trim().max(1000).default(""),
  contactEmail: z.string().trim().max(160).default(""),
});

export async function updateSettingsAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const raw = {
    announcement: String(formData.get("announcement") ?? ""),
    bannerEyebrow: String(formData.get("bannerEyebrow") ?? ""),
    bannerTitle: String(formData.get("bannerTitle") ?? ""),
    bannerAccent: String(formData.get("bannerAccent") ?? ""),
    bannerText: String(formData.get("bannerText") ?? ""),
    bannerCtaLabel: String(formData.get("bannerCtaLabel") ?? ""),
    bannerCtaHref: String(formData.get("bannerCtaHref") ?? ""),
    bannerImage: String(formData.get("bannerImage") ?? ""),
    bannerImageAlt: String(formData.get("bannerImageAlt") ?? ""),
    whatsappDisplay: String(formData.get("whatsappDisplay") ?? ""),
    whatsappNumber: onlyDigits(String(formData.get("whatsappNumber") ?? "")),
    instagramUrl: String(formData.get("instagramUrl") ?? "").trim(),
    logoUrl: String(formData.get("logoUrl") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise as configurações destacadas.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const data = parsed.data;

  if (!isValidImageReference(data.logoUrl)) {
    return {
      status: "error",
      message: "Endereço da logo inválido.",
      fieldErrors: { logoUrl: ["Use upload interno ou URL https."] },
    };
  }
  if (!isValidImageReference(data.bannerImage)) {
    return {
      status: "error",
      message: "Endereço do banner inválido.",
      fieldErrors: { bannerImage: ["Use upload interno ou URL https."] },
    };
  }

  if (
    data.bannerCtaHref &&
    !data.bannerCtaHref.startsWith("/") &&
    !data.bannerCtaHref.startsWith("https://")
  ) {
    return {
      status: "error",
      message: "O destino do botão deve ser um caminho interno ou URL https.",
      fieldErrors: {
        bannerCtaHref: ["Use /caminho ou https://..."],
      },
    };
  }

  if (data.instagramUrl) {
    try {
      const url = new URL(data.instagramUrl);
      if (
        url.protocol !== "https:" ||
        !url.hostname.includes("instagram.com")
      ) {
        throw new Error("invalid");
      }
    } catch {
      return {
        status: "error",
        message: "Informe uma URL https do Instagram.",
        fieldErrors: { instagramUrl: ["Ex.: https://instagram.com/…"] },
      };
    }
  }

  if (data.contactEmail) {
    const email = emailSchema.safeParse(data.contactEmail);
    if (!email.success) {
      return {
        status: "error",
        message: "E-mail de contato inválido.",
        fieldErrors: { contactEmail: ["Informe um e-mail válido."] },
      };
    }
  }

  if (
    data.whatsappNumber &&
    ![10, 11, 13].includes(data.whatsappNumber.length)
  ) {
    return {
      status: "error",
      message: "Informe o WhatsApp com DDD ou no formato internacional.",
      fieldErrors: {
        whatsappNumber: ["Use DDD + número, com 10, 11 ou 13 dígitos."],
      },
    };
  }

  updateSettings({
    announcement: data.announcement,
    bannerEyebrow: data.bannerEyebrow,
    bannerTitle: data.bannerTitle,
    bannerAccent: data.bannerAccent,
    bannerText: data.bannerText,
    bannerCtaLabel: data.bannerCtaLabel,
    bannerCtaHref: data.bannerCtaHref,
    bannerImage: data.bannerImage,
    bannerImageAlt: data.bannerImageAlt,
    whatsappDisplay:
      data.whatsappDisplay ||
      (data.whatsappNumber ? formatPhone(data.whatsappNumber) : ""),
    whatsappNumber: data.whatsappNumber,
    instagramUrl: data.instagramUrl,
    logoUrl: data.logoUrl,
    contactEmail: data.contactEmail,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/configuracoes");

  const whatsappWarning =
    data.whatsappNumber && !isValidWhatsAppNumber(data.whatsappNumber)
      ? " O número de WhatsApp salvo ainda não é válido para gerar o link; por isso o botão continuará oculto na loja."
      : "";

  return {
    status: "success",
    message: `Configurações salvas.${whatsappWarning}`,
  };
}
