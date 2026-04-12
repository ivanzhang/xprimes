export interface CloudflareBindings {
  DB?: D1Database;
  ASSETS?: Fetcher;
  R2?: R2Bucket;
  ENVIRONMENT?: string;
  [key: string]: unknown;
}

export interface CloudflareRuntimeContext {
  env: CloudflareBindings;
  db: D1Database | null;
  assets: Fetcher | null;
  r2: R2Bucket | null;
  isProduction: boolean;
}

/**
 * 中文注释：统一读取 Cloudflare Worker 的绑定对象，作为后续 D1/R2 的入口。
 * 使用示例：
 * ```ts
 * export default {
 *   async fetch(request: Request, env: CloudflareEnv) {
 *     const ctx = getCloudflareContext(env);
 *     if (ctx.db) {
 *       await ctx.db.prepare("SELECT 1").first();
 *     }
 *     return new Response("ok");
 *   },
 * };
 * ```
 */
export function getCloudflareContext(env: CloudflareBindings): CloudflareRuntimeContext {
  const runtime = env.ENVIRONMENT ?? env.NODE_ENV;

  return {
    env,
    db: (env.DB as D1Database | undefined) ?? null,
    assets: (env.ASSETS as Fetcher | undefined) ?? null,
    r2: (env.R2 as R2Bucket | undefined) ?? null,
    isProduction: runtime === "production",
  };
}
