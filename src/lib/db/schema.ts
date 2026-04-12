export const DB_TABLES = ["logs", "papers", "review_items", "activity_logs"] as const;

export type DbTableName = (typeof DB_TABLES)[number];

export const REVIEW_ITEM_STATUSES = ["draft", "published"] as const;

export type ReviewItemStatus = (typeof REVIEW_ITEM_STATUSES)[number];

export const PAPER_STATUSES = ["draft", "published"] as const;

export type PaperStatus = (typeof PAPER_STATUSES)[number];

export interface LogRow {
  id: string;
  title: string;
  content: string;
  excerpt_en: string | null;
  published_at: string;
  is_pinned: 0 | 1;
  author_email: string;
  created_at: string;
  updated_at: string;
}

export interface PaperRow {
  id: string;
  version: string;
  title_zh: string;
  title_en: string;
  abstract_zh: string;
  abstract_en: string | null;
  pdf_key: string;
  pdf_filename: string;
  pdf_size: number;
  publish_date: string | null;
  status: PaperStatus;
  author_email: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewItemRow {
  id: string;
  code: string;
  item_type: string;
  title: string;
  reference: string;
  question_body: string;
  response_body: string | null;
  status: ReviewItemStatus;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogRow {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  operator_email: string;
  payload_snapshot: string;
  created_at: string;
}

/**
 * 中文注释：提供统一表名入口，避免业务层写死字符串。
 * 使用示例：
 * ```ts
 * import { TABLE_NAME } from "@/lib/db/schema";
 * const sql = `SELECT * FROM ${TABLE_NAME.reviewItems} LIMIT 10`;
 * ```
 */
export const TABLE_NAME = {
  logs: "logs",
  papers: "papers",
  reviewItems: "review_items",
  activityLogs: "activity_logs",
} as const;
