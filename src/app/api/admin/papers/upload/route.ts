import { requireAdminSession } from "@/lib/auth/admin-access";
import { requireCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { uploadPaperPdf } from "@/lib/r2/paper-storage";

function createErrorResponse(error: unknown): Response {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED_ADMIN") {
      return Response.json({ ok: false, error: error.message }, { status: 401 });
    }

    if (error.message === "MISSING_PDF_FILE") {
      return Response.json({ ok: false, error: error.message }, { status: 400 });
    }

    if (error.message === "只能上传 PDF 文件" || error.message === "PDF 文件不能超过 20MB") {
      return Response.json({ ok: false, error: "INVALID_PDF_UPLOAD", message: error.message }, { status: 400 });
    }

    if (
      error.message === "CLOUDFLARE_RUNTIME_UNAVAILABLE"
      || error.message === "CLOUDFLARE_R2_UNAVAILABLE"
    ) {
      return Response.json({ ok: false, error: error.message }, { status: 503 });
    }
  }

  return Response.json({ ok: false, error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
}

/**
 * 中文注释：论文上传接口只负责把 PDF 放到 R2，并返回后续写入 D1 所需的文件元数据。
 * 使用示例：
 * ```bash
 * curl -X POST http://localhost:3000/api/admin/papers/upload \
 *   -H 'cf-access-authenticated-user-email: amy@xprimes.cn' \
 *   -F 'file=@./sample-paper.pdf'
 * ```
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const identity = await requireAdminSession();
    const runtime = await requireCloudflareRuntimeContext();
    const r2 = runtime.r2;

    if (!r2) {
      throw new Error("CLOUDFLARE_R2_UNAVAILABLE");
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new Error("MISSING_PDF_FILE");
    }

    const uploaded = await uploadPaperPdf(r2, file, identity.email);

    return Response.json(
      {
        ok: true,
        file: uploaded,
      },
      { status: 201 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
