import fs from "node:fs";
import path from "node:path";
import {
  DB_TABLES,
  PAPER_STATUSES,
  REVIEW_ITEM_STATUSES,
  REVIEW_ITEM_TYPES,
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
    expect(REVIEW_ITEM_STATUSES).toEqual(["draft", "published"]);
  });

  it("定义 review_items 的类型集合", () => {
    expect(REVIEW_ITEM_TYPES).toEqual(["open", "resolved"]);
  });

  it("定义 papers 的状态集合", () => {
    expect(PAPER_STATUSES).toEqual(["draft", "published"]);
  });

  it("行类型字段可被 TypeScript 识别", () => {
    const log: LogRow = {
      id: "log_1",
      title: "日志标题",
      content: "日志正文",
      excerpt_en: "excerpt",
      published_at: "2026-04-12",
      is_pinned: 0,
      author_email: "amy@xprimes.cn",
      created_at: "2026-04-12T00:00:00.000Z",
      updated_at: "2026-04-12T00:00:00.000Z",
    };

    const paper: PaperRow = {
      id: "paper_1",
      version: "v1.0.0",
      title_zh: "中文标题",
      title_en: "English Title",
      abstract_zh: "中文摘要",
      abstract_en: "English abstract",
      pdf_key: "papers/2026/xprimes.pdf",
      pdf_filename: "xprimes.pdf",
      pdf_size: 1024,
      publish_date: "2026-04-12",
      status: "draft",
      author_email: "yiyi@xprimes.cn",
      created_at: "2026-04-12T00:00:00.000Z",
      updated_at: "2026-04-12T00:00:00.000Z",
    };

    const reviewItem: ReviewItemRow = {
      id: "review_1",
      code: "R-001",
      item_type: "open",
      title: "术语一致性",
      reference: "章节 2.1",
      question_body: "是否统一术语定义？",
      response_body: "已统一",
      status: "draft",
      updated_by: "amy@xprimes.cn",
      created_at: "2026-04-12T00:00:00.000Z",
      updated_at: "2026-04-12T00:00:00.000Z",
    };

    const activity: ActivityLogRow = {
      id: "activity_1",
      entity_type: "review_items",
      entity_id: reviewItem.id,
      action: "update",
      operator_email: "yiyi@xprimes.cn",
      payload_snapshot: "{\"status\":\"draft\"}",
      created_at: "2026-04-12T00:00:00.000Z",
    };

    expect(log.is_pinned).toBe(0);
    expect(activity.entity_id).toBe(reviewItem.id);
    expect(paper.status).toBe("draft");
  });

  it("初始化 SQL 包含四张表的建表语句", () => {
    const migrationPath = path.resolve(process.cwd(), "migrations/0001_initial.sql");
    const sql = fs.readFileSync(migrationPath, "utf8");

    expect(sql).toContain("CREATE TABLE IF NOT EXISTS logs");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS papers");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS review_items");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS activity_logs");
    expect(sql).toContain("excerpt_en");
    expect(sql).toContain("pdf_key");
    expect(sql).toContain("question_body");
    expect(sql).toContain("payload_snapshot");
    expect(sql).toContain("published_at TEXT NOT NULL");
    expect(sql).toContain("version TEXT NOT NULL UNIQUE");
    expect(sql).toContain("title_en TEXT NOT NULL");
    expect(sql).toContain("abstract_zh TEXT NOT NULL");
    expect(sql).toContain("status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published'))");
    expect(sql).toContain("reference TEXT NOT NULL");
    expect(sql).toContain("updated_by TEXT NOT NULL");
    expect(sql).toContain("payload_snapshot TEXT NOT NULL");
    expect(sql).toContain("code TEXT NOT NULL UNIQUE");
    expect(sql).toContain("item_type TEXT NOT NULL CHECK (item_type IN ('open', 'resolved'))");
  });
});
