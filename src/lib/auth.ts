import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import { getDb } from "@/lib/db";
import { countUsers } from "@/lib/queries";

export const SESSION_COOKIE = "zeven_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
export const DEMO_SESSION_DURATION_MS = 1000 * 60 * 60 * 8;

export type AdminRole = "admin" | "demo_admin";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
};

type UserRow = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isDemoAccessAllowed() {
  return process.env.NODE_ENV === "development";
}

function resolveAdminRole(role: string): AdminRole | null {
  if (role === "admin") return "admin";
  if (role === "demo_admin" && isDemoAccessAllowed()) return "demo_admin";
  return null;
}

function cookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeMs / 1000,
  };
}

export async function createSession(
  userId: number,
  durationMs = SESSION_DURATION_MS,
) {
  const db = getDb();
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = Date.now() + durationMs;

  db.prepare(
    "DELETE FROM admin_sessions WHERE expires_at <= ?",
  ).run(Date.now());
  db.prepare(
    "INSERT INTO admin_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
  ).run(tokenHash, userId, expiresAt, new Date().toISOString());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, cookieOptions(durationMs));
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    getDb()
      .prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
      .run(hashToken(token));
  }
  store.delete(SESSION_COOKIE);
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = getDb()
    .prepare(
      `SELECT u.id, u.name, u.email, u.role, s.expires_at AS expiresAt
       FROM admin_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?`,
    )
    .get(hashToken(token)) as
    | {
        id: number;
        name: string;
        email: string;
        role: string;
        expiresAt: number;
      }
    | undefined;

  if (!row) return null;

  if (Number(row.expiresAt) <= Date.now()) {
    getDb()
      .prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
      .run(hashToken(token));
    return null;
  }

  const role = resolveAdminRole(row.role);
  if (!role) {
    if (row.role === "demo_admin") {
      getDb()
        .prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
        .run(hashToken(token));
    }
    return null;
  }

  return { id: row.id, name: row.name, email: row.email, role };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function redirectIfAuthenticated() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");
}

export async function hasAdminUser() {
  return countUsers() > 0;
}

export async function verifyCredentials(email: string, password: string) {
  const user = getDb()
    .prepare(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ? COLLATE NOCASE",
    )
    .get(email) as UserRow | undefined;

  if (!user) return null;
  const role = resolveAdminRole(user.role);
  if (!role) return null;
  const valid = await compare(password, user.password_hash);
  if (!valid) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
  } satisfies AdminUser;
}

export async function changeAdminPassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
) {
  const user = getDb()
    .prepare("SELECT password_hash FROM users WHERE id = ?")
    .get(userId) as { password_hash: string } | undefined;
  if (!user) return { ok: false as const, error: "Usuário não encontrado." };

  const valid = await compare(currentPassword, user.password_hash);
  if (!valid) {
    return { ok: false as const, error: "A senha atual não confere." };
  }

  const passwordHash = await hash(newPassword, 12);
  getDb()
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .run(passwordHash, userId);
  getDb().prepare("DELETE FROM admin_sessions WHERE user_id = ?").run(userId);
  return { ok: true as const };
}

type RateState = { failures: number; resetAt: number };

const globalForRate = globalThis as unknown as {
  zevenLoginRate?: Map<string, RateState>;
};

function rateMap() {
  if (!globalForRate.zevenLoginRate) {
    globalForRate.zevenLoginRate = new Map();
  }
  return globalForRate.zevenLoginRate;
}

export function canAttemptLogin(email: string) {
  const key = email.toLowerCase();
  const state = rateMap().get(key);
  if (!state) return true;
  if (Date.now() > state.resetAt) {
    rateMap().delete(key);
    return true;
  }
  return state.failures < 5;
}

export function recordLoginFailure(email: string) {
  const key = email.toLowerCase();
  const current = rateMap().get(key);
  if (!current || Date.now() > current.resetAt) {
    rateMap().set(key, {
      failures: 1,
      resetAt: Date.now() + 15 * 60 * 1000,
    });
    return;
  }
  current.failures += 1;
}

export function clearLoginFailures(email: string) {
  rateMap().delete(email.toLowerCase());
}
