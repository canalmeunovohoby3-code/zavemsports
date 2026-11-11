import { siteConfig } from "@/config/site";
import { getDb } from "@/lib/db";
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

type SettingRow = { key: string; value: string };

const keyMap: Record<string, keyof StoreSettings> = {
  announcement: "announcement",
  banner_eyebrow: "bannerEyebrow",
  banner_title: "bannerTitle",
  banner_accent: "bannerAccent",
  banner_text: "bannerText",
  banner_cta_label: "bannerCtaLabel",
  banner_cta_href: "bannerCtaHref",
  banner_image: "bannerImage",
  banner_image_alt: "bannerImageAlt",
  whatsapp_display: "whatsappDisplay",
  whatsapp_number: "whatsappNumber",
  instagram_url: "instagramUrl",
  logo_url: "logoUrl",
  contact_email: "contactEmail",
};

const reverseKeyMap = Object.fromEntries(
  Object.entries(keyMap).map(([dbKey, settingKey]) => [settingKey, dbKey]),
) as Record<keyof StoreSettings, string>;

const fallbacks: StoreSettings = {
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

export function getSettings(): StoreSettings {
  const rows = getDb()
    .prepare("SELECT key, value FROM settings")
    .all() as SettingRow[];

  const settings = { ...fallbacks };

  for (const row of rows) {
    const key = keyMap[row.key];
    if (key) settings[key] = row.value;
  }

  return settings;
}

export function getWhatsAppHref(settings: StoreSettings, message?: string) {
  return buildWhatsAppLink(settings.whatsappNumber, message);
}

export function isWhatsAppPending(settings: StoreSettings) {
  return !isValidWhatsAppNumber(settings.whatsappNumber);
}

export function getNormalizedWhatsApp(settings: StoreSettings) {
  return normalizeWhatsAppNumber(settings.whatsappNumber);
}

export function updateSettings(values: Partial<StoreSettings>) {
  const db = getDb();
  const statement = db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);
  const now = new Date().toISOString();

  const run = db.transaction(() => {
    for (const [key, value] of Object.entries(values)) {
      if (value == null) continue;
      const dbKey = reverseKeyMap[key as keyof StoreSettings];
      if (!dbKey) continue;
      statement.run(dbKey, value, now);
    }
  });

  run();
}
