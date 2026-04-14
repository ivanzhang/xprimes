import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireAdminSession } from "@/lib/auth/admin-access";
import { requireCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { recordActivity } from "@/lib/repositories/activity-repository";
import { updatePaper, deletePaper } from "@/lib/repositories/paper-repository";
import { paperInputSchema } from "@/lib/validators/paper";

interface RouteContext {
  params?: Promise<Record<string, string | string[] | undefined>>;
}

async function resolvePaperId(context: RouteContext): Promise<string> {
  const params = await context.params;
  const id = params?.id;

  if (typeof id !== "string" || id.trim().length === 0) {
    throw new Error("INVALID_PAPER_ID");
  }

  return id;
}

function createErrorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json(
      { ok: false, error: "INVALID_PAPER_INPUT", issues: error.flatten() },
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

    if (error.message === "INVALID_PAPER_ID") {
      return Response.json({ ok: false, error: error.message }, { status: 400 });
    }

    if (error.message === "PAPER_NOT_FOUND") {
      return Response.json({ ok: false, error: error.message }, { status: 404 });
    }

    if (
      error.message === "CLOUDFLARE_RUNTIME_UNAVAILABLE" ||
      error.message === "CLOUDFLARE_DB_UNAVAILABLE"
    ) {
      return Response.json({ ok: false, error: error.message }, { status: 503 });
    }
  }

  return Response.json({ ok: false, error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
}

function revalidatePublicPaperPages(): void {
  revalidatePath("/");
  revalidatePath("/papers");
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  try {
    const identity = await requireAdminSession();
    const paperId = await resolvePaperId(context);
    const payload = await request.json();
    const input = paperInputSchema.parse(payload);
    const { db } = await requireCloudflareRuntimeContext();

    if (!db) {
      throw new Error("CLOUDFLARE_DB_UNAVAILABLE");
    }

    const updated = await updatePaper(db, paperId, input);

    if (!updated) {
      throw new Error("PAPER_NOT_FOUND");
    }

    await recordActivity(db, {
      entityType: "paper",
      entityId: updated.id,
      action: "update",
      operatorEmail: identity.email,
      payloadSnapshot: updated,
    });
    revalidatePublicPaperPages();

    return Response.json({ ok: true, item: updated }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteContext): Promise<Response> {
  try {
    const identity = await requireAdminSession();
    const paperId = await resolvePaperId(context);
    const { db } = await requireCloudflareRuntimeContext();

    if (!db) {
      throw new Error("CLOUDFLARE_DB_UNAVAILABLE");
    }

    const deleted = await deletePaper(db, paperId);

    if (!deleted) {
      throw new Error("PAPER_NOT_FOUND");
    }

    await recordActivity(db, {
      entityType: "paper",
      entityId: deleted.id,
      action: "delete",
      operatorEmail: identity.email,
      payloadSnapshot: deleted,
    });
    revalidatePublicPaperPages();

    return Response.json({ ok: true, item: deleted }, { status: 200 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
