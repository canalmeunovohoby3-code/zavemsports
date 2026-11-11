import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import Database from "better-sqlite3";
import { hash } from "bcryptjs";

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function fail(message) {
  console.error(`\n${message}\n`);
  process.exitCode = 1;
}

async function promptHidden(question) {
  if (!stdin.isTTY) {
    const rl = createInterface({ input: stdin, output: stdout });
    const answer = await rl.question(question);
    rl.close();
    return answer;
  }

  return new Promise((resolve) => {
    stdout.write(question);
    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";

    const cleanup = () => {
      stdin.removeListener("data", onData);
      stdin.setRawMode(wasRaw);
      stdin.pause();
    };

    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === "\u0003") {
          cleanup();
          stdout.write("\n");
          process.exit(130);
        }
        if (char === "\r" || char === "\n") {
          cleanup();
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u007f" || char === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            stdout.write("\b \b");
          }
          continue;
        }
        if (char >= " ") {
          value += char;
          stdout.write("*");
        }
      }
    };

    stdin.on("data", onData);
  });
}

async function main() {
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
      .prepare("SELECT COUNT(*) AS count FROM users")
      .get();
    if (Number(existing.count) > 0) {
      fail(
        "Já existe um administrador cadastrado. Use /admin/login ou altere a senha pela área Conta e segurança.",
      );
      return;
    }

    let name = argument("name") ?? process.env.ADMIN_NAME;
    let email = argument("email") ?? process.env.ADMIN_EMAIL;
    let password = process.env.ADMIN_PASSWORD;

    if (!name || !email) {
      const rl = createInterface({ input: stdin, output: stdout });
      if (!name) {
        name = (await rl.question("Nome do administrador: ")).trim();
      }
      if (!email) {
        email = (await rl.question("E-mail do administrador: ")).trim();
      }
      rl.close();
    }

    name = String(name ?? "").trim();
    email = String(email ?? "").trim().toLowerCase();

    if (name.length < 3) {
      fail("Informe um nome com pelo menos 3 caracteres.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fail("Informe um e-mail válido.");
      return;
    }

    if (!password) {
      password = await promptHidden("Senha (mínimo 10 caracteres): ");
      const confirmation = await promptHidden("Confirme a senha: ");
      if (password !== confirmation) {
        fail("As senhas não coincidem.");
        return;
      }
    }

    if (password.length < 10) {
      fail("A senha deve ter pelo menos 10 caracteres.");
      return;
    }

    const passwordHash = await hash(password, 12);
    const now = new Date().toISOString();

    db.prepare(
      "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, 'admin', ?)",
    ).run(name, email, passwordHash, now);

    console.log("\nAdministrador criado com sucesso.");
    console.log(`Nome: ${name}`);
    console.log(`E-mail: ${email}`);
    console.log("Acesse /admin/login com a senha definida.");
    console.log(
      "A senha não é exibida nem armazenada em texto puro; guarde-a em local seguro.",
    );
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error("\nNão foi possível criar o administrador.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
