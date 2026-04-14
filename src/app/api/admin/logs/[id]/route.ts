import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireAdminSession } from "@/lib/auth/admin-access";
import { requireCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { recordActivity } from "@/lib/repositories/activity-repository";
import { deleteLog, updateLog } from "@/lib/repositories/log-repository";
import { logInputSchema } from "@/lib/validators/log";

interface RouteContext {
  params?: Promise<Record<string, string | string[] | undefined>>;
}

async function resolveLogId(context: RouteContext): Promise<string> {
  const params = await context.params;
  const id = params?.id;

  if (typeof id !== "string" || id.trim().length === 0) {
    throw new Error("INVALID_LOG_ID");
  }

  return id;
}

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
    return Response.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED_ADMIN") {
      return Response.json({ ok: false, error: error.message }, { status: 401 });
    }

    if (error.message === "INVALID_LOG_ID") {
      return Response.json({ ok: false, error: error.message }, { status: 400 });
    }

    if (error.message === "LOG_NOT_FOUND") {
      return Response.json({ ok: false, error: error.message }, { status: 404 });
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
 * 中文注释：更新日志会直接覆盖前台公开内容，不经过草稿阶段。
 * 使用示例：
 * ```bash
 * curl -X PATCH http://localhost:3000/api/admin/logs/log-1 \
 *   -H 'content-type: application/json' \
 *   -H 'cf-access-authenticated-user-email: amy@xprimes.cn' \
 *   -d '{"title":"更新标题","content":"更新内容","publishedAt":"2026-04-13","isPinned":false}'
 * ```
 */
export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  try {
    const identity = await requireAdminSession();
    const logId = await resolveLogId(context);
    const payload = await request.json();
    const input = logInputSchema.parse(payload);
    const { db } = await requireCloudflareRuntimeContext();

    if (!db) {
      throw new Error("CLOUDFLARE_DB_UNAVAILABLE");
    }

    const updated = await updateLog(db, logId, input);

    if (!updated) {
      throw new Error("LOG_NOT_FOUND");
    }

    await recordActivity(db, {
      entityType: "log",
      entityId: updated.id,
      action: "update",
      operatorEmail: identity.email,
      payloadSnapshot: updated,
    });
    revalidatePublicLogPages();

    return Response.json({ ok: true, item: updated }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * 中文注释：删除日志后同步写入审计记录，便于后续追踪谁删除了哪条公开说明。
 * 使用示例：
 * ```bash
 * curl -X DELETE http://localhost:3000/api/admin/logs/log-1 \
 *   -H 'cf-access-authenticated-user-email: amy@xprimes.cn'
 * ```
 */
export async function DELETE(request: Request, context: RouteContext): Promise<Response> {
  try {
    const identity = await requireAdminSession();
    const logId = await resolveLogId(context);
    const { db } = await requireCloudflareRuntimeContext();

    if (!db) {
      throw new Error("CLOUDFLARE_DB_UNAVAILABLE");
    }

    const deleted = await deleteLog(db, logId);

    if (!deleted) {
      throw new Error("LOG_NOT_FOUND");
    }

    await recordActivity(db, {
      entityType: "log",
      entityId: deleted.id,
      action: "delete",
      operatorEmail: identity.email,
      payloadSnapshot: deleted,
    });
    revalidatePublicLogPages();

    return Response.json({ ok: true, item: deleted }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
