import { describe, expect, it } from "vitest";
import { logInputSchema } from "@/lib/validators/log";

describe("logInputSchema", () => {
  it("要求标题、正文和发布时间必填", () => {
    const result = logInputSchema.safeParse({
      title: "",
      content: "",
      publishedAt: "",
      isPinned: false,
    });

    expect(result.success).toBe(false);
  });

  it("接受合法日志并填充默认字段", () => {
    const result = logInputSchema.parse({
      title: "发布首条日志",
      content: "今天开始建立官方网站。",
      publishedAt: "2026-04-12",
      isPinned: true,
    });

    expect(result.title).toBe("发布首条日志");
    expect(result.excerptEn).toBe("");
    expect(result.isPinned).toBe(true);
  });

  it("拒绝非 YYYY-MM-DD 格式的发布时间", () => {
    const result = logInputSchema.safeParse({
      title: "日期格式错误",
      content: "这里应该失败。",
      publishedAt: "2026/04/12",
      isPinned: false,
    });

    expect(result.success).toBe(false);
  });
});
