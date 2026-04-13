import type { LogRow, PaperRow, ReviewItemRow } from "@/lib/db/schema";

export interface PublicLogItem {
  id: string;
  title: string;
  content: string;
  excerptEn: string | null;
  publishedAt: string;
  publishedAtLabel: string;
  isPinned: boolean;
  authorEmail: string;
}

export interface AdminLogItem extends PublicLogItem {
  createdAt: string;
  createdAtLabel: string;
  updatedAt: string;
  updatedAtLabel: string;
}

export interface PublicPaperItem {
  id: string;
  version: string;
  title: string;
  subtitle: string;
  abstract: string;
  abstractEn: string | null;
  publishDate: string | null;
  publishDateLabel: string;
  downloadLabel: string;
  downloadUrl: string;
  pdfFilename: string;
  authorEmail: string;
}

export interface AdminPaperItem extends PublicPaperItem {
  status: "draft" | "published";
  pdfSize: number;
  createdAt: string;
  updatedAt: string;
  updatedAtLabel: string;
}

export interface PublicReviewItem {
  id: string;
  code: string;
  type: "open" | "resolved";
  title: string;
  reference: string;
  questionBody: string;
  responseBody: string | null;
  updatedAt: string;
  updatedAtLabel: string;
}

export interface PublicReviewSections {
  openItems: PublicReviewItem[];
  resolvedItems: PublicReviewItem[];
}

function formatDateLabel(value: string | null | undefined, emptyLabel = "待定"): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : emptyLabel;
}

/**
 * 中文注释：将日志表记录转换为前台列表可直接消费的视图模型。
 * 使用示例：
 * ```ts
 * const item = mapLogRowToPublicItem(row);
 * console.log(item.publishedAtLabel);
 * ```
 */
export function mapLogRowToPublicItem(row: LogRow): PublicLogItem {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    excerptEn: row.excerpt_en,
    publishedAt: row.published_at,
    publishedAtLabel: formatDateLabel(row.published_at),
    isPinned: row.is_pinned === 1,
    authorEmail: row.author_email,
  };
}

/**
 * 中文注释：后台日志列表需要额外展示创建与更新时间，便于管理员快速核对变更轨迹。
 * 使用示例：
 * ```ts
 * const item = mapLogRowToAdminItem(row);
 * console.log(item.updatedAtLabel);
 * ```
 */
export function mapLogRowToAdminItem(row: LogRow): AdminLogItem {
  const publicItem = mapLogRowToPublicItem(row);

  return {
    ...publicItem,
    createdAt: row.created_at,
    createdAtLabel: formatDateLabel(row.created_at),
    updatedAt: row.updated_at,
    updatedAtLabel: formatDateLabel(row.updated_at),
  };
}

/**
 * 中文注释：论文前台仅保留展示所需字段，并生成稳定下载地址。
 * 使用示例：
 * ```ts
 * const paper = mapPaperRowToPublicItem(row);
 * console.log(paper.downloadUrl);
 * ```
 */
export function mapPaperRowToPublicItem(row: PaperRow): PublicPaperItem {
  return {
    id: row.id,
    version: row.version,
    title: row.title_zh,
    subtitle: row.title_en,
    abstract: row.abstract_zh,
    abstractEn: row.abstract_en,
    publishDate: row.publish_date,
    publishDateLabel: formatDateLabel(row.publish_date, "待发布"),
    downloadLabel: `下载 PDF（${row.pdf_filename}）`,
    downloadUrl: `/${row.pdf_key.replace(/^\/+/, "")}`,
    pdfFilename: row.pdf_filename,
    authorEmail: row.author_email,
  };
}

/**
 * 中文注释：后台论文列表额外带出状态、文件大小和更新时间，方便管理员识别草稿与已发布版本。
 * 使用示例：
 * ```ts
 * const paper = mapPaperRowToAdminItem(row);
 * console.log(paper.status);
 * ```
 */
export function mapPaperRowToAdminItem(row: PaperRow): AdminPaperItem {
  const publicItem = mapPaperRowToPublicItem(row);

  return {
    ...publicItem,
    status: row.status,
    pdfSize: row.pdf_size,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedAtLabel: formatDateLabel(row.updated_at),
  };
}

/**
 * 中文注释：反质疑条目统一转换后再分区，避免页面层直接依赖数据库字段命名。
 * 使用示例：
 * ```ts
 * const sections = mapReviewRowsToSections(rows);
 * console.log(sections.openItems.length);
 * ```
 */
export function mapReviewRowsToSections(rows: ReviewItemRow[]): PublicReviewSections {
  const publishedItems = rows
    .filter((row) => row.status === "published")
    .map<PublicReviewItem>((row) => ({
      id: row.id,
      code: row.code,
      type: row.item_type,
      title: row.title,
      reference: row.reference,
      questionBody: row.question_body,
      responseBody: row.response_body,
      updatedAt: row.updated_at,
      updatedAtLabel: formatDateLabel(row.updated_at),
    }))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  return {
    openItems: publishedItems.filter((item) => item.type === "open"),
    resolvedItems: publishedItems.filter((item) => item.type === "resolved"),
  };
}
