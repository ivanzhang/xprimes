import { tryGetCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";

export const ADMIN_ALLOWLIST = ["amy@xprimes.cn", "yiyi@xprimes.cn"] as const;

export type AdminEmail = (typeof ADMIN_ALLOWLIST)[number];

export interface AdminIdentity {
  email: AdminEmail;
  userId: string;
  name: string | null;
}

const ADMIN_ALLOWLIST_SET = new Set<string>(ADMIN_ALLOWLIST);

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  const normalized = normalizeEmail(email);
  return normalized !== null && ADMIN_ALLOWLIST_SET.has(normalized);
}

function sessionToAdmin(user: SessionUser): AdminIdentity | null {
  const normalized = normalizeEmail(user.email);
  if (!normalized || !ADMIN_ALLOWLIST_SET.has(normalized)) return null;
  return { email: normalized as AdminEmail, userId: user.id, name: user.name };
}

/**
 * Try to get admin identity from session cookie.
 * Returns null if not logged in or not an admin email.
 */
export async function getAdminFromSession(): Promise<AdminIdentity | null> {
  const runtime = await tryGetCloudflareRuntimeContext();
  if (!runtime?.db) return null;

  const user = await getSessionUser(runtime.db);
  if (!user) return null;

  return sessionToAdmin(user);
}

/**
 * Require admin identity; throws UNAUTHORIZED_ADMIN if not valid.
 * Used by API routes — reads session from cookie.
 */
export async function requireAdminSession(): Promise<AdminIdentity> {
  const admin = await getAdminFromSession();
  if (!admin) throw new Error("UNAUTHORIZED_ADMIN");
  return admin;
}

/**
 * Legacy compat: require admin from request.
 * Now reads session cookie instead of CF Access header.
 */
export function requireAdminIdentity(_requestOrHeaders: unknown): AdminIdentity {
  // This sync version can't read cookies in server components.
  // Use requireAdminSession() (async) instead.
  throw new Error("UNAUTHORIZED_ADMIN");
}
