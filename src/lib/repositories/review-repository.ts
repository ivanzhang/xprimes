import type { ReviewItemRow } from "@/lib/db/schema";
import { mapReviewRowsToSections, type PublicReviewSections } from "@/lib/db/mappers";
import { FALLBACK_REVIEW_ROWS, resolvePublicRows } from "@/lib/repositories/fallback-content";

/**
 * 中文注释：公开反质疑仓储；当前先接受外部 rows 或回退内置数据，避免无绑定时页面崩溃。
 * 使用示例：
 * ```ts
 * const sections = listPublishedReviewSections();
 * ```
 */
export function listPublishedReviewSections(rows?: ReviewItemRow[] | null): PublicReviewSections {
  return mapReviewRowsToSections(resolvePublicRows(rows, FALLBACK_REVIEW_ROWS));
}
