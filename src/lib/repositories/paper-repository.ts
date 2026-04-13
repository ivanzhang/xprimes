import type { PaperRow } from "@/lib/db/schema";
import { mapPaperRowToPublicItem, type PublicPaperItem } from "@/lib/db/mappers";
import { FALLBACK_PAPER_ROWS, resolvePublicRows } from "@/lib/repositories/fallback-content";

function sortPaperRows(left: PaperRow, right: PaperRow): number {
  const leftDate = left.publish_date ?? "";
  const rightDate = right.publish_date ?? "";

  if (leftDate !== rightDate) {
    return rightDate.localeCompare(leftDate);
  }

  return right.version.localeCompare(left.version);
}

/**
 * 中文注释：仅向前台暴露已发布论文；缺少数据源时返回空数组而不是报错。
 * 使用示例：
 * ```ts
 * const papers = listPublishedPapers();
 * ```
 */
export function listPublishedPapers(rows?: PaperRow[] | null): PublicPaperItem[] {
  return [...resolvePublicRows(rows, FALLBACK_PAPER_ROWS)]
    .filter((row) => row.status === "published")
    .sort(sortPaperRows)
    .map(mapPaperRowToPublicItem);
}
