import fs from "node:fs";
import path from "node:path";
import {
  DB_TABLES,
  REVIEW_ITEM_STATUSES,
  type ActivityLogRow,
  type LogRow,
  type PaperRow,
  type ReviewItemRow,
} from "@/lib/db/schema";

describe("db/schema", () => {
  it("导出首批四张核心业务表", () => {
    expect(DB_TABLES).toEqual(["logs", "papers", "review_items", "activity_logs"]);
  });

  it("定义 review_items 的状态集合", () => {
    expect(REVIEW_ITEM_STATUSES).toEqual(["pending", "approved", "rejected"]);
  });

  it("行类型字段可被 TypeScript 识别", () => {
    const log: LogRow = {
      id: "log_1",
      created_at: "2026-04-12T00:00:00.000Z",
      level: "info",
      message: "boot",
      metadata_json: null,
    };

    const paper: PaperRow = {
      id: "paper_1",
      created_at: "2026-04-12T00:00:00.000Z",
      updated_at: "2026-04-12T00:00:00.000Z",
      title: "XPrimes Note",
      source_url: null,
      summary: null,
      status: "draft",
    };

    const reviewItem: ReviewItemRow = {
      id: "review_1",
      paper_id: paper.id,
      created_at: "2026-04-12T00:00:00.000Z",
      updated_at: "2026-04-12T00:00:00.000Z",
      reviewer_email: "amy@xprimes.cn",
      status: "pending",
      note: null,
    };

    const activity: ActivityLogRow = {
      id: "activity_1",
      created_at: "2026-04-12T00:00:00.000Z",
      actor_email: "yiyi@xprimes.cn",
      action: "review_created",
      target_type: "review_item",
      target_id: reviewItem.id,
      payload_json: null,
    };

    expect(log.level).toBe("info");
    expect(activity.target_id).toBe(reviewItem.id);
  });

  it("初始化 SQL 包含四张表的建表语句", () => {
    const migrationPath = path.resolve(process.cwd(), "migrations/0001_initial.sql");
    const sql = fs.readFileSync(migrationPath, "utf8");

    expect(sql).toContain("CREATE TABLE IF NOT EXISTS logs");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS papers");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS review_items");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS activity_logs");
  });
});
