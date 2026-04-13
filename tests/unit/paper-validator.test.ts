import { describe, expect, it } from "vitest";
import { paperInputSchema, validatePdfUpload } from "@/lib/validators/paper";

describe("paper validation", () => {
  it("要求版本号、中英文标题和中文摘要必填", () => {
    const result = paperInputSchema.safeParse({
      version: "",
      titleZh: "",
      titleEn: "",
      abstractZh: "",
      abstractEn: "",
      status: "draft",
      pdfKey: "papers/sample.pdf",
      pdfFilename: "sample.pdf",
      pdfSize: 1024,
    });

    expect(result.success).toBe(false);
  });

  it("只允许上传 pdf", () => {
    expect(() => validatePdfUpload({ type: "image/png", size: 12 })).toThrow(/PDF/);
  });

  it("限制 PDF 体积不能超过 20MB", () => {
    expect(() => validatePdfUpload({ type: "application/pdf", size: 21 * 1024 * 1024 })).toThrow(
      /20MB/,
    );
  });
});
