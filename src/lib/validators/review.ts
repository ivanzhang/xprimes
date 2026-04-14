import { z } from "zod";

export const reviewInputSchema = z.object({
  code: z.string().trim().min(1, "条目编号不能为空"),
  itemType: z.enum(["open", "resolved"]),
  title: z.string().trim().min(1, "条目标题不能为空"),
  reference: z.string().trim().min(1, "引用来源不能为空"),
  questionBody: z.string().trim().min(1, "质疑内容不能为空"),
  responseBody: z.string().trim().optional().default(""),
  status: z.enum(["draft", "published"]),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;
