import { z } from "zod";

const LOG_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 中文注释：日志后台统一校验规则，保证 API 与表单共享同一份输入契约。
 * 使用示例：
 * ```ts
 * const input = logInputSchema.parse({
 *   title: "首条日志",
 *   content: "今天开始发布官网动态。",
 *   publishedAt: "2026-04-12",
 *   isPinned: false,
 * });
 * ```
 */
export const logInputSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空"),
  content: z.string().trim().min(1, "正文不能为空"),
  publishedAt: z
    .string()
    .trim()
    .regex(LOG_DATE_PATTERN, "发布时间必须是 YYYY-MM-DD 格式"),
  excerptEn: z.string().trim().optional().default(""),
  isPinned: z.boolean().default(false),
});

export type LogInput = z.infer<typeof logInputSchema>;
