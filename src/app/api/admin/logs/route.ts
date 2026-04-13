import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireAdminIdentity } from "@/lib/auth/admin-access";
import { requireCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { recordActivity } from "@/lib/repositories/activity-repository";
import { createLog } from "@/lib/repositories/log-repository";
import { logInputSchema } from "@/lib/validators/log";

function createErrorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json(
      {
        ok: false,
        error: "INVALID_LOG_INPUT",
        issues: error.flatten(),
      },
      { status: 400 },
    );
  }

  if (error instanceof SyntaxError) {
    return Response.json(
      {
        ok: false,
        error: "INVALID_JSON",
      },
      { status: 400 },
    );
  }

  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED_ADMIN") {
      return Response.json({ ok: false, error: error.message }, { status: 401 });
    }

    if (
      error.message === "CLOUDFLARE_RUNTIME_UNAVAILABLE"
      || error.message === "CLOUDFLARE_DB_UNAVAILABLE"
    ) {
      return Response.json({ ok: false, error: error.message }, { status: 503 });
    }
  }

  return Response.json({ ok: false, error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
}

function revalidatePublicLogPages(): void {
  revalidatePath("/");
  revalidatePath("/log");
}

/**
 * 中文注释：日志没有草稿态，后台创建成功后立即可被前台 `/log` 与首页最近动态读取。
 * 使用示例：
 * ```bash
 * curl -X POST http://localhost:3000/api/admin/logs \
 *   -H 'content-type: application/json' \
 *   -H 'cf-access-authenticated-user-email: amy@xprimes.cn' \
 *   -d '{"title":"首条日志","content":"今天开始发布官网动态。","publishedAt":"2026-04-12","isPinned":true}'
 * ```
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const identity = requireAdminIdentity(request);
    const payload = await request.json();
    const input = logInputSchema.parse(payload);
    const { db } = await requireCloudflareRuntimeContext();

    if (!db) {
      throw new Error("CLOUDFLARE_DB_UNAVAILABLE");
    }

    const created = await createLog(db, input, identity.email);

    await recordActivity(db, {
      entityType: "log",
      entityId: created.id,
      action: "create",
      operatorEmail: identity.email,
      payloadSnapshot: created,
    });
    revalidatePublicLogPages();

    return Response.json({ ok: true, item: created }, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
