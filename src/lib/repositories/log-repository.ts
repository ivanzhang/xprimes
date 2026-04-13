import type { LogRow } from "@/lib/db/schema";
import { mapLogRowToPublicItem, type PublicLogItem } from "@/lib/db/mappers";
import { FALLBACK_LOG_ROWS, resolvePublicRows } from "@/lib/repositories/fallback-content";

function sortLogRows(left: LogRow, right: LogRow): number {
  if (left.is_pinned !== right.is_pinned) {
    return right.is_pinned - left.is_pinned;
  }

  return right.published_at.localeCompare(left.published_at);
}

/**
 * 中文注释：公开日志仓储；当前无 D1 绑定时回退内置内容，后续任务可直接替换 rows 来源。
 * 使用示例：
 * ```ts
 * const logs = listPublicLogs();
 * ```
 */
export function listPublicLogs(rows?: LogRow[] | null): PublicLogItem[] {
  return [...resolvePublicRows(rows, FALLBACK_LOG_ROWS)].sort(sortLogRows).map(mapLogRowToPublicItem);
}
