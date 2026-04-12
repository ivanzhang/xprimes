const ACCESS_EMAIL_HEADER = "cf-access-authenticated-user-email";

// 中文注释：后台固定管理员邮箱白名单。
export const ADMIN_ALLOWLIST = ["amy@xprimes.cn", "yiyi@xprimes.cn"] as const;

export type AdminEmail = (typeof ADMIN_ALLOWLIST)[number];

export interface AdminIdentity {
  email: AdminEmail;
}

// 中文注释：使用 Set 提升命中判断效率，避免每次线性遍历。
const ADMIN_ALLOWLIST_SET = new Set<string>(ADMIN_ALLOWLIST);

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

/**
 * 中文注释：从 Cloudflare Access 请求头提取并标准化邮箱。
 * 使用示例：
 * ```ts
 * const email = getAuthenticatedEmail(request);
 * if (email) console.log(email);
 * ```
 */
export function getAuthenticatedEmail(request: Request): string | null {
  return normalizeEmail(request.headers.get(ACCESS_EMAIL_HEADER));
}

/**
 * 中文注释：主接口，判断邮箱是否属于后台白名单。
 * 使用示例：
 * ```ts
 * if (isAllowedAdminEmail("amy@xprimes.cn")) {
 *   console.log("允许访问后台");
 * }
 * ```
 */
export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  const normalized = normalizeEmail(email);
  return normalized !== null && ADMIN_ALLOWLIST_SET.has(normalized);
}

function getAllowedAdminEmail(email: string | null | undefined): AdminEmail | null {
  const normalized = normalizeEmail(email);
  if (!normalized || !ADMIN_ALLOWLIST_SET.has(normalized)) {
    return null;
  }

  return normalized as AdminEmail;
}

/**
 * 中文注释：主接口，从请求中解析管理员身份，非管理员返回 null。
 * 使用示例：
 * ```ts
 * const admin = getAdminIdentity(request);
 * if (!admin) return new Response("forbidden", { status: 403 });
 * ```
 */
export function getAdminIdentity(request: Request): AdminIdentity | null {
  const email = getAllowedAdminEmail(getAuthenticatedEmail(request));
  if (!email) {
    return null;
  }

  return {
    email,
  };
}

/**
 * 中文注释：严格模式，未通过白名单直接抛错，适合后台守卫。
 * 使用示例：
 * ```ts
 * const admin = requireAdmin(request);
 * console.log(`当前管理员: ${admin.email}`);
 * ```
 */
export function requireAdmin(request: Request): AdminIdentity {
  const admin = getAdminIdentity(request);
  if (!admin) {
    throw new Error("UNAUTHORIZED_ADMIN");
  }

  return admin;
}
