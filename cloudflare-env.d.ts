/* eslint-disable @typescript-eslint/no-empty-object-type */

// 中文注释：为本地类型检查提供最小 Cloudflare 绑定与 D1/R2 类型草稿。
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run<T = unknown>(): Promise<T>;
  all<T = unknown>(): Promise<T>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface R2Bucket {}

interface Fetcher {
  fetch(request: Request | string, init?: RequestInit): Promise<Response>;
}

interface CloudflareEnv {
  DB?: D1Database;
  R2?: R2Bucket;
  ASSETS?: Fetcher;
  ENVIRONMENT?: "development" | "staging" | "production" | string;
}
