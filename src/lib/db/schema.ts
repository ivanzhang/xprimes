export const DB_TABLES = ["logs", "papers", "review_items", "activity_logs"] as const;

export type DbTableName = (typeof DB_TABLES)[number];

export const REVIEW_ITEM_STATUSES = ["pending", "approved", "rejected"] as const;

export type ReviewItemStatus = (typeof REVIEW_ITEM_STATUSES)[number];

export const PAPER_STATUSES = ["draft", "published", "archived"] as const;

export type PaperStatus = (typeof PAPER_STATUSES)[number];

export interface LogRow {
  id: string;
  created_at: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  metadata_json: string | null;
}

export interface PaperRow {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  source_url: string | null;
  summary: string | null;
  status: PaperStatus;
}

export interface ReviewItemRow {
  id: string;
  paper_id: string;
  created_at: string;
  updated_at: string;
  reviewer_email: string;
  status: ReviewItemStatus;
  note: string | null;
}

export interface ActivityLogRow {
  id: string;
  created_at: string;
  actor_email: string;
  action: string;
  target_type: string;
  target_id: string;
  payload_json: string | null;
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
