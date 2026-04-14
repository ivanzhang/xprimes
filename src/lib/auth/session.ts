import { cookies } from "next/headers";

const SESSION_COOKIE = "xp_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SessionUser {
  id: string;
  provider: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function recordAdminLogin(db: D1Database, userId: string, email: string): Promise<void> {
  await db
    .prepare("INSERT INTO admin_logins (id, user_id, email, created_at) VALUES (?, ?, ?, ?)")
    .bind(crypto.randomUUID(), userId, email, new Date().toISOString())
    .run();
}

export async function createSession(
  db: D1Database,
  userId: string,
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  await db
    .prepare("INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(token, userId, expiresAt, new Date().toISOString())
    .run();

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });

  return token;
}

export async function getSessionUser(db: D1Database): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const row = await db
    .prepare(
      `SELECT u.id, u.provider, u.email, u.name, u.avatar_url
       FROM sessions s JOIN users u ON s.user_id = u.id
       WHERE s.token = ? AND s.expires_at > ?`,
    )
    .bind(token, new Date().toISOString())
    .first<{ id: string; provider: string; email: string | null; name: string | null; avatar_url: string | null }>();

  if (!row) return null;

  return {
    id: row.id,
    provider: row.provider,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
  };
}

export async function destroySession(db: D1Database): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function findOrCreateUser(
  db: D1Database,
  provider: "github" | "google" | "email",
  providerId: string,
  profile: { email?: string | null; name?: string | null; avatarUrl?: string | null },
): Promise<string> {
  const existing = await db
    .prepare("SELECT id FROM users WHERE provider = ? AND provider_id = ?")
    .bind(provider, providerId)
    .first<{ id: string }>();

  if (existing) {
    // Update profile on each login
    await db
      .prepare("UPDATE users SET email = ?, name = ?, avatar_url = ? WHERE id = ?")
      .bind(profile.email ?? null, profile.name ?? null, profile.avatarUrl ?? null, existing.id)
      .run();
    return existing.id;
  }

  const id = crypto.randomUUID();
  await db
    .prepare(
      "INSERT INTO users (id, provider, provider_id, email, name, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      id,
      provider,
      providerId,
      profile.email ?? null,
      profile.name ?? null,
      profile.avatarUrl ?? null,
      new Date().toISOString(),
    )
    .run();

  return id;
}
