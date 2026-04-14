import { tryGetCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import {
  mapPaperRowToAdminItem,
  mapPaperRowToPublicItem,
  type AdminPaperItem,
  type PublicPaperItem,
} from "@/lib/db/mappers";
import type { PaperRow } from "@/lib/db/schema";
import { FALLBACK_PAPER_ROWS, resolvePublicRows } from "@/lib/repositories/fallback-content";

export interface PaperMutationInput {
  version: string;
  titleZh: string;
  titleEn: string;
  abstractZh: string;
  abstractEn: string;
  status: "draft" | "published";
  pdfKey: string;
  pdfFilename: string;
  pdfSize: number;
}

export interface AdminPaperCollection {
  papers: AdminPaperItem[];
  hasDatabase: boolean;
}

const PAPER_SELECT_SQL =
  "SELECT id, version, title_zh, title_en, abstract_zh, abstract_en, pdf_key, pdf_filename, pdf_size, publish_date, status, author_email, created_at, updated_at FROM papers";

function sortPaperRows(left: PaperRow, right: PaperRow): number {
  const leftDate = left.publish_date ?? "";
  const rightDate = right.publish_date ?? "";

  if (leftDate !== rightDate) {
    return rightDate.localeCompare(leftDate);
  }

  return right.version.localeCompare(left.version);
}

async function listPaperRowsFromDb(db: D1Database): Promise<PaperRow[]> {
  const result = await db
    .prepare(`${PAPER_SELECT_SQL} ORDER BY publish_date DESC, version DESC, updated_at DESC`)
    .all<PaperRow>();

  return result.results ?? [];
}

async function getPaperRowById(db: D1Database, id: string): Promise<PaperRow | null> {
  const row = await db.prepare(`${PAPER_SELECT_SQL} WHERE id = ?`).bind(id).first<PaperRow>();
  return row ?? null;
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

/**
 * 中文注释：公开论文页优先读取 D1，未接入 Cloudflare 运行时时回退到内置数据。
 * 使用示例：
 * ```ts
 * const papers = await listPublishedPapersFromRuntime();
 * ```
 */
export async function listPublishedPapersFromRuntime(): Promise<PublicPaperItem[]> {
  const runtime = await tryGetCloudflareRuntimeContext();

  if (!runtime?.db) {
    return listPublishedPapers();
  }

  try {
    return listPublishedPapers(await listPaperRowsFromDb(runtime.db));
  } catch {
    return listPublishedPapers();
  }
}

/**
 * 中文注释：后台论文页需要知道数据库是否可用，并返回包含草稿在内的完整列表。
 * 使用示例：
 * ```ts
 * const { papers, hasDatabase } = await listAdminPapersFromRuntime();
 * ```
 */
export async function listAdminPapersFromRuntime(): Promise<AdminPaperCollection> {
  const runtime = await tryGetCloudflareRuntimeContext();

  if (!runtime?.db) {
    return {
      papers: [],
      hasDatabase: false,
    };
  }

  const rows = await listPaperRowsFromDb(runtime.db);

  return {
    papers: rows.sort(sortPaperRows).map(mapPaperRowToAdminItem),
    hasDatabase: true,
  };
}

/**
 * 中文注释：新建论文记录时由服务端统一决定发布时间，避免前台读到不一致的状态。
 * 使用示例：
 * ```ts
 * const paper = await createPaper(db, input, "amy@xprimes.cn");
 * ```
 */
export async function createPaper(
  db: D1Database,
  input: PaperMutationInput,
  authorEmail: string,
): Promise<PaperRow> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const publishDate = input.status === "published" ? now.slice(0, 10) : null;

  await db
    .prepare(
      "INSERT INTO papers (id, version, title_zh, title_en, abstract_zh, abstract_en, pdf_key, pdf_filename, pdf_size, publish_date, status, author_email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      id,
      input.version,
      input.titleZh,
      input.titleEn,
      input.abstractZh,
      input.abstractEn || null,
      input.pdfKey,
      input.pdfFilename,
      input.pdfSize,
      publishDate,
      input.status,
      authorEmail,
      now,
      now,
    )
    .run();

  return (
    (await getPaperRowById(db, id)) ?? {
      id,
      version: input.version,
      title_zh: input.titleZh,
      title_en: input.titleEn,
      abstract_zh: input.abstractZh,
      abstract_en: input.abstractEn || null,
      pdf_key: input.pdfKey,
      pdf_filename: input.pdfFilename,
      pdf_size: input.pdfSize,
      publish_date: publishDate,
      status: input.status,
      author_email: authorEmail,
      created_at: now,
      updated_at: now,
    }
  );
}

/**
 * 中文注释：更新论文时保留原作者；若从草稿切到发布，则首次补齐发布日期。
 * 使用示例：
 * ```ts
 * const paper = await updatePaper(db, "paper-id", input);
 * ```
 */
export async function deletePaper(
  db: D1Database,
  id: string,
): Promise<PaperRow | null> {
  const existing = await getPaperRowById(db, id);

  if (!existing) {
    return null;
  }

  await db.prepare("DELETE FROM papers WHERE id = ?").bind(id).run();

  return existing;
}

export async function updatePaper(
  db: D1Database,
  id: string,
  input: PaperMutationInput,
): Promise<PaperRow | null> {
  const existing = await getPaperRowById(db, id);

  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();
  const publishDate = input.status === "published"
    ? existing.publish_date ?? now.slice(0, 10)
    : null;

  await db
    .prepare(
      "UPDATE papers SET version = ?, title_zh = ?, title_en = ?, abstract_zh = ?, abstract_en = ?, pdf_key = ?, pdf_filename = ?, pdf_size = ?, publish_date = ?, status = ?, updated_at = ? WHERE id = ?",
    )
    .bind(
      input.version,
      input.titleZh,
      input.titleEn,
      input.abstractZh,
      input.abstractEn || null,
      input.pdfKey,
      input.pdfFilename,
      input.pdfSize,
      publishDate,
      input.status,
      now,
      id,
    )
    .run();

  return (
    (await getPaperRowById(db, id)) ?? {
      ...existing,
      version: input.version,
      title_zh: input.titleZh,
      title_en: input.titleEn,
      abstract_zh: input.abstractZh,
      abstract_en: input.abstractEn || null,
      pdf_key: input.pdfKey,
      pdf_filename: input.pdfFilename,
      pdf_size: input.pdfSize,
      publish_date: publishDate,
      status: input.status,
      updated_at: now,
    }
  );
}
