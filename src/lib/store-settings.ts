import { siteConfig } from "@/config/site";
import {
  buildWhatsAppLink,
  isValidWhatsAppNumber,
  normalizeWhatsAppNumber,
} from "@/lib/format";

export type StoreSettings = {
  announcement: string;
  bannerEyebrow: string;
  bannerTitle: string;
  bannerAccent: string;
  bannerText: string;
  bannerCtaLabel: string;
  bannerCtaHref: string;
  bannerImage: string;
  bannerImageAlt: string;
  whatsappDisplay: string;
  whatsappNumber: string;
  instagramUrl: string;
  logoUrl: string;
  contactEmail: string;
};

export const defaultStoreSettings: StoreSettings = {
  announcement: siteConfig.defaultSettings.announcement,
  bannerEyebrow: siteConfig.defaultSettings.banner_eyebrow,
  bannerTitle: siteConfig.defaultSettings.banner_title,
  bannerAccent: siteConfig.defaultSettings.banner_accent,
  bannerText: siteConfig.defaultSettings.banner_text,
  bannerCtaLabel: siteConfig.defaultSettings.banner_cta_label,
  bannerCtaHref: siteConfig.defaultSettings.banner_cta_href,
  bannerImage: siteConfig.defaultSettings.banner_image,
  bannerImageAlt: siteConfig.defaultSettings.banner_image_alt,
  whatsappDisplay: siteConfig.defaultSettings.whatsapp_display,
  whatsappNumber: siteConfig.defaultSettings.whatsapp_number,
  instagramUrl: siteConfig.defaultSettings.instagram_url,
  logoUrl: siteConfig.defaultSettings.logo_url,
  contactEmail: siteConfig.defaultSettings.contact_email,
};

export function getWhatsAppHref(
  settings: StoreSettings,
  message?: string,
) {
  return buildWhatsAppLink(settings.whatsappNumber, message);
}

export function isWhatsAppPending(settings: StoreSettings) {
  return !isValidWhatsAppNumber(settings.whatsappNumber);
}

export function getNormalizedWhatsApp(settings: StoreSettings) {
  return normalizeWhatsAppNumber(settings.whatsappNumber);
}
