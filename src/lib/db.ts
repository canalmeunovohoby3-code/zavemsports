import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { siteConfig } from "@/config/site";
import { schemaSql } from "@/lib/schema";

const globalForDb = globalThis as unknown as {
  zevenDb?: Database.Database;
};

export function getDatabasePath() {
  return path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env.DATABASE_PATH ?? path.join("data", "zeven.db"),
  );
}

function seed(db: Database.Database) {
  const now = new Date().toISOString();

  const categoryCount = db
    .prepare("SELECT COUNT(*) AS count FROM categories")
    .get() as { count: number };

  if (categoryCount.count === 0) {
    const insertCategory = db.prepare(`
      INSERT INTO categories
        (name, slug, description, audience, kind, image_url, sort_order, is_active, created_at)
      VALUES
        (@name, @slug, @description, @audience, @kind, '', @sortOrder, 1, @createdAt)
    `);

    const seedCategories = db.transaction(() => {
      for (const category of siteConfig.categories) {
        insertCategory.run({ ...category, createdAt: now });
      }
    });

    seedCategories();
  }

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
  `);

  const seedSettings = db.transaction(() => {
    for (const [key, value] of Object.entries(siteConfig.defaultSettings)) {
      insertSetting.run(key, value, now);
    }
  });

  seedSettings();

  const sectionCount = db
    .prepare("SELECT COUNT(*) AS count FROM home_sections")
    .get() as { count: number };

  if (sectionCount.count === 0) {
    const findCategory = db.prepare(
      "SELECT id FROM categories WHERE slug = ?",
    );
    const insertSection = db.prepare(`
      INSERT INTO home_sections
        (slug, title, subtitle, image_url, source_mode, source_category_id,
         source_audience, is_active, sort_order, created_at, updated_at)
      VALUES
        (@slug, @title, @subtitle, @imageUrl, @sourceMode, @sourceCategoryId,
         @sourceAudience, 1, @sortOrder, @createdAt, @createdAt)
    `);

    const sections = [
      {
        slug: "mais-vendidos",
        title: "Mais vendidos",
        subtitle: "As peças que mais saem na ZEVEN.",
        imageUrl: "",
        sourceMode: "best_sellers",
        categorySlug: null,
        sourceAudience: null,
        sortOrder: 1,
      },
      {
        slug: "novidades",
        title: "Novidades",
        subtitle: "As peças mais recentes cadastradas na loja.",
        imageUrl: "",
        sourceMode: "new_arrivals",
        categorySlug: null,
        sourceAudience: null,
        sortOrder: 2,
      },
      {
        slug: "camisetas-adulto",
        title: "Camisetas Adulto",
        subtitle: "Básicos de algodão para acompanhar o dia a dia.",
        imageUrl: "/editorial/category-camisetas.webp",
        sourceMode: "category",
        categorySlug: "camisetas-adulto",
        sourceAudience: null,
        sortOrder: 3,
      },
      {
        slug: "bermudas-adulto",
        title: "Bermudas Adulto",
        subtitle: "Modelagens confortáveis para o calor e para a rotina.",
        imageUrl: "/editorial/category-bermudas.webp",
        sourceMode: "category",
        categorySlug: "bermudas-adulto",
        sourceAudience: null,
        sortOrder: 4,
      },
      {
        slug: "plus-size",
        title: "Plus Size",
        subtitle: "Camisetas e bermudas na grade G1, G2 e G3.",
        imageUrl: "/editorial/category-plus.webp",
        sourceMode: "audience",
        categorySlug: null,
        sourceAudience: "plus",
        sortOrder: 5,
      },
      {
        slug: "infantil",
        title: "Infantil",
        subtitle: "Do 02 ao 14, para acompanhar cada fase.",
        imageUrl: "/editorial/category-infantil.webp",
        sourceMode: "audience",
        categorySlug: null,
        sourceAudience: "infantil",
        sortOrder: 6,
      },
    ] as const;

    const seedSections = db.transaction(() => {
      for (const section of sections) {
        const category = section.categorySlug
          ? (findCategory.get(section.categorySlug) as
              | { id: number }
              | undefined)
          : undefined;
        insertSection.run({
          slug: section.slug,
          title: section.title,
          subtitle: section.subtitle,
          imageUrl: section.imageUrl,
          sourceMode: section.sourceMode,
          sourceCategoryId: category?.id ?? null,
          sourceAudience: section.sourceAudience,
          sortOrder: section.sortOrder,
          createdAt: now,
        });
      }
    });

    seedSections();
  }
}

function createConnection() {
  const dbPath = getDatabasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  db.exec(schemaSql);
  seed(db);

  return db;
}

export function getDb() {
  if (!globalForDb.zevenDb) {
    globalForDb.zevenDb = createConnection();
  }
  return globalForDb.zevenDb;
}
