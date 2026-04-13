import type { LogRow, PaperRow, ReviewItemRow } from "@/lib/db/schema";

// 中文注释：当前 D1 绑定尚未接入时，前台先使用最小公开内容完成页面落地。
export const FALLBACK_LOG_ROWS: LogRow[] = [
  {
    id: "log-2026-04-12-site-launch",
    title: "项目站点建立并开始留痕",
    content:
      "完成首版官网骨架与公开页面结构，后续研究日志、论文版本与结构化审读条目将按时间顺序逐步发布。",
    excerpt_en: "The public site is now live and ready for incremental research updates.",
    published_at: "2026-04-12",
    is_pinned: 1,
    author_email: "amy@xprimes.cn",
    created_at: "2026-04-12T00:00:00.000Z",
    updated_at: "2026-04-12T00:00:00.000Z",
  },
];

export const FALLBACK_PAPER_ROWS: PaperRow[] = [];

export const FALLBACK_REVIEW_ROWS: ReviewItemRow[] = [];

/**
 * 中文注释：统一处理“有上游数据就用上游，没有就回退内置内容”的策略。
 * 使用示例：
 * ```ts
 * const rows = resolvePublicRows(customRows, FALLBACK_LOG_ROWS);
 * ```
 */
export function resolvePublicRows<T>(rows: T[] | null | undefined, fallbackRows: T[]): T[] {
  return rows ?? fallbackRows;
}
