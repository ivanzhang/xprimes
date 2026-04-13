import { validatePdfUpload } from "@/lib/validators/paper";

export interface UploadedPaperFile {
  key: string;
  filename: string;
  size: number;
  contentType: string;
}

function sanitizeFilename(filename: string): string {
  const normalized = filename.trim().toLowerCase();
  const withPdfSuffix = normalized.endsWith(".pdf") ? normalized : `${normalized}.pdf`;
  const safeFilename = withPdfSuffix.replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
  return safeFilename.replace(/^-|-$/g, "") || "paper.pdf";
}

/**
 * 中文注释：统一上传论文 PDF 到 R2，并返回后续写入 D1 所需的文件元数据。
 * 使用示例：
 * ```ts
 * const uploaded = await uploadPaperPdf(r2, file, "amy@xprimes.cn");
 * console.log(uploaded.key);
 * ```
 */
export async function uploadPaperPdf(
  r2: R2Bucket,
  file: File,
  operatorEmail: string,
): Promise<UploadedPaperFile> {
  validatePdfUpload(file);

  const filename = sanitizeFilename(file.name || `${operatorEmail}-paper.pdf`);
  const key = `papers/${crypto.randomUUID()}-${filename}`;

  await r2.put(key, file, {
    httpMetadata: {
      contentType: file.type,
    },
    customMetadata: {
      uploadedBy: operatorEmail,
    },
  });

  return {
    key,
    filename,
    size: file.size,
    contentType: file.type,
  };
}

/**
 * 中文注释：替换论文 PDF 时需要显式删除旧对象，避免 R2 中堆积孤儿文件。
 * 使用示例：
 * ```ts
 * await deletePaperPdf(r2, "papers/sample.pdf");
 * ```
 */
export async function deletePaperPdf(r2: R2Bucket, key: string): Promise<void> {
  await r2.delete(key);
}
