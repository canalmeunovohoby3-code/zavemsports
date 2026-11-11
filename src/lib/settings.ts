import { getDb } from "@/lib/db";
import {
  defaultStoreSettings,
  type StoreSettings,
} from "@/lib/store-settings";

export type { StoreSettings } from "@/lib/store-settings";
export {
  getNormalizedWhatsApp,
  getWhatsAppHref,
  isWhatsAppPending,
} from "@/lib/store-settings";

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

const fallbacks: StoreSettings = defaultStoreSettings;

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
