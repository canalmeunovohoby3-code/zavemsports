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
