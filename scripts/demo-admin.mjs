import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import Database from "better-sqlite3";
import { hash } from "bcryptjs";

const DEMO_EMAIL = "demo@zeven.local";
const DEMO_NAME = "Demonstração ZEVEN";
const command = process.argv[2] ?? "create";

function fail(message) {
  console.error(`\n${message}\n`);
  process.exitCode = 1;
}

const remoteEnvironment =
  process.env.VERCEL ||
  process.env.NETLIFY ||
  process.env.RENDER ||
  process.env.RAILWAY_ENVIRONMENT;

if (process.env.NODE_ENV === "production" || remoteEnvironment) {
  fail(
    "O acesso de demonstração é exclusivo do ambiente local de desenvolvimento. Ele não é criado em produção.",
  );
  process.exit();
}

if (command !== "create" && command !== "remove") {
  fail("Uso: npm run admin:demo (criar/rotacionar) ou npm run admin:demo:remove.");
  process.exit();
}

const dbPath = path.resolve(
  process.cwd(),
  process.env.DATABASE_PATH ?? path.join("data", "zeven.db"),
);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL
  );
`);

try {
  const existing = db
    .prepare("SELECT id, role FROM users WHERE email = ? COLLATE NOCASE")
    .get(DEMO_EMAIL);

  if (command === "remove") {
    if (!existing || existing.role !== "demo_admin") {
      console.log("Nenhum acesso de demonstração ativo para remover.");
      process.exitCode = 0;
    } else {
      db.prepare("DELETE FROM admin_sessions WHERE user_id = ?").run(
        existing.id,
      );
      db.prepare("DELETE FROM users WHERE id = ?").run(existing.id);
      console.log("Acesso de demonstração removido.");
      console.log(`E-mail removido: ${DEMO_EMAIL}`);
      console.log("As sessões abertas com esse acesso também foram encerradas.");
    }
  } else {
    if (existing && existing.role !== "demo_admin") {
      fail(
        `Já existe um usuário ${DEMO_EMAIL} com outro papel. Remova-o manualmente antes de usar a demonstração.`,
      );
    } else {
      const password = randomBytes(18).toString("base64url");
      const passwordHash = await hash(password, 12);
      const now = new Date().toISOString();

      if (existing) {
        db.prepare(
          "UPDATE users SET name = ?, password_hash = ?, role = 'demo_admin' WHERE id = ?",
        ).run(DEMO_NAME, passwordHash, existing.id);
        db.prepare("DELETE FROM admin_sessions WHERE user_id = ?").run(
          existing.id,
        );
      } else {
        db.prepare(
          "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, 'demo_admin', ?)",
        ).run(DEMO_NAME, DEMO_EMAIL, passwordHash, now);
      }

      console.log("\nAcesso de demonstração pronto.");
      console.log("Endereço: http://localhost:3000/admin/login");
      console.log(`E-mail: ${DEMO_EMAIL}`);
      console.log(`Senha temporária: ${password}`);
      console.log("Sessão: até 8 horas.");
      console.log(
        "Este acesso só é aceito com NODE_ENV=development; em produção ele é bloqueado.",
      );
      console.log("Para encerrar: npm run admin:demo:remove");
      console.log(
        "A senha não é salva em texto puro e não está no código ou no repositório.",
      );
    }
  }
} finally {
  db.close();
}
