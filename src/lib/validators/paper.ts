import { z } from "zod";

const PAPER_FILE_SIZE_LIMIT = 20 * 1024 * 1024;

/**
 * 中文注释：论文表单的核心字段校验，要求版本号、标题、摘要和 PDF 元数据完整可追踪。
 * 使用示例：
 * ```ts
 * const input = paperInputSchema.parse({
 *   version: "v0.1",
 *   titleZh: "结构初稿",
 *   titleEn: "Initial Draft",
 *   abstractZh: "中文摘要",
 *   abstractEn: "English abstract",
 *   status: "draft",
 *   pdfKey: "papers/sample.pdf",
 *   pdfFilename: "sample.pdf",
 *   pdfSize: 1024,
 * });
 * ```
 */
export const paperInputSchema = z.object({
  version: z.string().trim().min(1, "版本号不能为空"),
  titleZh: z.string().trim().min(1, "中文标题不能为空"),
  titleEn: z.string().trim().min(1, "英文标题不能为空"),
  abstractZh: z.string().trim().min(1, "中文摘要不能为空"),
  abstractEn: z.string().trim().optional().default(""),
  status: z.enum(["draft", "published"]),
  pdfKey: z.string().trim().min(1, "请先上传 PDF 文件"),
  pdfFilename: z.string().trim().min(1, "PDF 文件名不能为空"),
  pdfSize: z.number().int().positive("PDF 文件大小不能为空"),
});

export type PaperInput = z.infer<typeof paperInputSchema>;

/**
 * 中文注释：PDF 上传限制集中在这里，避免后台页面和 API 各自维护不同规则。
 * 使用示例：
 * ```ts
 * validatePdfUpload({ type: "application/pdf", size: 1024 });
 * ```
 */
export function validatePdfUpload(file: { type: string; size: number }): void {
  if (file.type !== "application/pdf") {
    throw new Error("只能上传 PDF 文件");
  }

  if (file.size > PAPER_FILE_SIZE_LIMIT) {
    throw new Error("PDF 文件不能超过 20MB");
  }
}
