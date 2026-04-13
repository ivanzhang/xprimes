import { getCloudflareContext as getOpenNextCloudflareContext } from "@opennextjs/cloudflare";

export type CloudflareBindings = CloudflareEnv & {
  DB?: D1Database;
  ASSETS?: Fetcher;
  R2?: R2Bucket;
  ENVIRONMENT?: string;
  NODE_ENV?: string;
  [key: string]: unknown;
};

export interface CloudflareRuntimeContext {
  env: CloudflareBindings;
  db: D1Database | null;
  assets: Fetcher | null;
  r2: R2Bucket | null;
  isProduction: boolean;
}

export interface CloudflareRuntimeContextWithDb extends CloudflareRuntimeContext {
  db: D1Database;
}

const MISSING_RUNTIME_ERROR_MARKERS = [
  "initOpenNextCloudflareForDev",
  "`getCloudflareContext` has been called",
  "__wrangler",
  "getPlatformProxy",
] as const;

/**
 * 中文注释：统一读取 Cloudflare Worker 的绑定对象，作为后续 D1/R2 的入口。
 * 使用示例：
 * ```ts
 * const runtime = getCloudflareContext(env);
 * if (runtime.db) {
 *   await runtime.db.prepare("SELECT 1").first();
 * }
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

function isMissingRuntimeContextError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return MISSING_RUNTIME_ERROR_MARKERS.some((marker) => error.message.includes(marker));
}

/**
 * 中文注释：在 Next 运行时中懒加载 Cloudflare 上下文；拿不到运行时就返回 null，供公开页回退。
 * 使用示例：
 * ```ts
 * const runtime = await tryGetCloudflareRuntimeContext();
 * if (!runtime?.db) {
 *   return [];
 * }
 * ```
 */
export async function tryGetCloudflareRuntimeContext(): Promise<CloudflareRuntimeContext | null> {
  try {
    const { env } = await getOpenNextCloudflareContext({ async: true });
    return getCloudflareContext(env as CloudflareBindings);
  } catch (error) {
    if (isMissingRuntimeContextError(error)) {
      return null;
    }

    throw error;
  }
}

/**
 * 中文注释：后台 API 需要强制拿到 Cloudflare 运行时与 D1 绑定，缺失时直接抛受控错误。
 * 使用示例：
 * ```ts
 * const runtime = await requireCloudflareRuntimeContext();
 * const rows = await runtime.db.prepare("SELECT * FROM logs").all();
 * ```
 */
export async function requireCloudflareRuntimeContext(): Promise<CloudflareRuntimeContextWithDb> {
  const runtime = await tryGetCloudflareRuntimeContext();

  if (!runtime) {
    throw new Error("CLOUDFLARE_RUNTIME_UNAVAILABLE");
  }

  if (!runtime.db) {
    throw new Error("CLOUDFLARE_DB_UNAVAILABLE");
  }

  return {
    ...runtime,
    db: runtime.db,
  };
}
