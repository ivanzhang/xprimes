import { tryGetCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import {
  mapLogRowToAdminItem,
  mapLogRowToPublicItem,
  type AdminLogItem,
  type PublicLogItem,
} from "@/lib/db/mappers";
import type { LogRow } from "@/lib/db/schema";
import { FALLBACK_LOG_ROWS, resolvePublicRows } from "@/lib/repositories/fallback-content";

export interface LogMutationInput {
  title: string;
  content: string;
  excerptEn: string;
  publishedAt: string;
  isPinned: boolean;
}

export interface AdminLogCollection {
  logs: AdminLogItem[];
  hasDatabase: boolean;
}

const LOG_SELECT_SQL =
  "SELECT id, title, content, excerpt_en, published_at, is_pinned, author_email, created_at, updated_at FROM logs";

function sortLogRows(left: LogRow, right: LogRow): number {
  if (left.is_pinned !== right.is_pinned) {
    return right.is_pinned - left.is_pinned;
  }

  return right.published_at.localeCompare(left.published_at);
}

function normalizeLogRow(row: LogRow): LogRow {
  return {
    ...row,
    excerpt_en: row.excerpt_en ?? null,
    is_pinned: row.is_pinned === 1 ? 1 : 0,
  };
}

function toNullableExcerpt(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

async function listLogRowsFromDb(db: D1Database): Promise<LogRow[]> {
  const result = await db
    .prepare(`${LOG_SELECT_SQL} WHERE deleted_at IS NULL ORDER BY is_pinned DESC, published_at DESC, updated_at DESC`)
    .all<LogRow>();

  return (result.results ?? []).map(normalizeLogRow);
}

async function getLogRowById(db: D1Database, id: string): Promise<LogRow | null> {
  const row = await db.prepare(`${LOG_SELECT_SQL} WHERE id = ?`).bind(id).first<LogRow>();
  return row ? normalizeLogRow(row) : null;
}

/**
 * 中文注释：公开日志仓储；当前无 D1 绑定时回退内置内容，后续任务可直接替换 rows 来源。
 * 使用示例：
 * ```ts
 * const logs = listPublicLogs();
 * ```
 */
export function listPublicLogs(rows?: LogRow[] | null): PublicLogItem[] {
  return [...resolvePublicRows(rows, FALLBACK_LOG_ROWS)]
    .sort(sortLogRows)
    .map(mapLogRowToPublicItem);
}

/**
 * 中文注释：公开页优先读取运行时 D1；若当前环境拿不到 Cloudflare 绑定，则自动回退到内置内容。
 * 使用示例：
 * ```ts
 * const logs = await listPublicLogsFromRuntime();
 * ```
 */
export async function listPublicLogsFromRuntime(): Promise<PublicLogItem[]> {
  const runtime = await tryGetCloudflareRuntimeContext();

  if (!runtime?.db) {
    return listPublicLogs();
  }

  try {
    return listPublicLogs(await listLogRowsFromDb(runtime.db));
  } catch {
    return listPublicLogs();
  }
}

/**
 * 中文注释：后台日志页需要知道当前是否已连接数据库，以便在未配置 D1 时给出明确提示。
 * 使用示例：
 * ```ts
 * const { logs, hasDatabase } = await listAdminLogsFromRuntime();
 * ```
 */
export async function listAdminLogsFromRuntime(): Promise<AdminLogCollection> {
  const runtime = await tryGetCloudflareRuntimeContext();

  if (!runtime?.db) {
    return {
      logs: [],
      hasDatabase: false,
    };
  }

  const rows = await listLogRowsFromDb(runtime.db);

  return {
    logs: rows.map(mapLogRowToAdminItem),
    hasDatabase: true,
  };
}

/**
 * 中文注释：新建日志时直接写入 D1，并返回标准化后的记录。
 * 使用示例：
 * ```ts
 * const row = await createLog(db, input, "amy@xprimes.cn");
 * ```
 */
export async function createLog(
  db: D1Database,
  input: LogMutationInput,
  authorEmail: string,
): Promise<LogRow> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const excerptEn = toNullableExcerpt(input.excerptEn);

  await db
    .prepare(
      "INSERT INTO logs (id, title, content, excerpt_en, published_at, is_pinned, author_email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      id,
      input.title,
      input.content,
      excerptEn,
      input.publishedAt,
      input.isPinned ? 1 : 0,
      authorEmail,
      now,
      now,
    )
    .run();

  return (
    (await getLogRowById(db, id)) ?? {
      id,
      title: input.title,
      content: input.content,
      excerpt_en: excerptEn,
      published_at: input.publishedAt,
      is_pinned: input.isPinned ? 1 : 0,
      author_email: authorEmail,
      created_at: now,
      updated_at: now,
    }
  );
}

/**
 * 中文注释：更新日志时保留原始作者，仅刷新正文、日期、置顶与更新时间。
 * 使用示例：
 * ```ts
 * const row = await updateLog(db, "log-id", input);
 * ```
 */
export async function updateLog(
  db: D1Database,
  id: string,
  input: LogMutationInput,
): Promise<LogRow | null> {
  const existing = await getLogRowById(db, id);

  if (!existing) {
    return null;
  }

  const excerptEn = toNullableExcerpt(input.excerptEn);
  const now = new Date().toISOString();

  await db
    .prepare(
      "UPDATE logs SET title = ?, content = ?, excerpt_en = ?, published_at = ?, is_pinned = ?, updated_at = ? WHERE id = ?",
    )
    .bind(
      input.title,
      input.content,
      excerptEn,
      input.publishedAt,
      input.isPinned ? 1 : 0,
      now,
      id,
    )
    .run();

  return (
    (await getLogRowById(db, id)) ?? {
      ...existing,
      title: input.title,
      content: input.content,
      excerpt_en: excerptEn,
      published_at: input.publishedAt,
      is_pinned: input.isPinned ? 1 : 0,
      updated_at: now,
    }
  );
}

/**
 * 中文注释：删除前先读取原记录，便于 API 层把删除快照写入审计日志。
 * 使用示例：
 * ```ts
 * const deleted = await deleteLog(db, "log-id");
 * ```
 */
export async function deleteLog(db: D1Database, id: string): Promise<LogRow | null> {
  const existing = await getLogRowById(db, id);

  if (!existing) {
    return null;
  }

  await db.prepare("UPDATE logs SET deleted_at = ? WHERE id = ?").bind(new Date().toISOString(), id).run();
  return existing;
}
