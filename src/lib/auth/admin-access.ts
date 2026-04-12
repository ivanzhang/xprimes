const ACCESS_EMAIL_HEADER = "cf-access-authenticated-user-email";

// 中文注释：后台固定管理员邮箱白名单。
export const ADMIN_ALLOWLIST = ["amy@xprimes.cn", "yiyi@xprimes.cn"] as const;

export type AdminEmail = (typeof ADMIN_ALLOWLIST)[number];

export interface AdminIdentity {
  email: AdminEmail;
}

// 中文注释：使用 Set 提升命中判断效率，避免每次线性遍历。
const ADMIN_ALLOWLIST_SET = new Set<string>(ADMIN_ALLOWLIST);

/**
 * 中文注释：从 Cloudflare Access 请求头提取并标准化邮箱。
 * 使用示例：
 * ```ts
 * const email = getAuthenticatedEmail(request);
 * if (email) console.log(email);
 * ```
 */
export function getAuthenticatedEmail(request: Request): string | null {
  const rawEmail = request.headers.get(ACCESS_EMAIL_HEADER);
  if (!rawEmail) {
    return null;
  }

  const normalized = rawEmail.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

/**
 * 中文注释：宽松模式，非管理员返回 null，适合可选鉴权场景。
 * 使用示例：
 * ```ts
 * const admin = getAdminFromRequest(request);
 * if (!admin) return new Response("forbidden", { status: 403 });
 * ```
 */
export function getAdminFromRequest(request: Request): AdminIdentity | null {
  const email = getAuthenticatedEmail(request);
  if (!email || !ADMIN_ALLOWLIST_SET.has(email)) {
    return null;
  }

  return {
    email: email as AdminEmail,
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
  const admin = getAdminFromRequest(request);
  if (!admin) {
    throw new Error("UNAUTHORIZED_ADMIN");
  }

  return admin;
}
