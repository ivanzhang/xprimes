import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireAdminSession } from "@/lib/auth/admin-access";
import { requireCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { recordActivity } from "@/lib/repositories/activity-repository";
import { createPaper } from "@/lib/repositories/paper-repository";
import { paperInputSchema } from "@/lib/validators/paper";

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

export async function POST(request: Request): Promise<Response> {
  try {
    const identity = await requireAdminSession();
    const payload = await request.json();
    const input = paperInputSchema.parse(payload);
    const { db } = await requireCloudflareRuntimeContext();

    if (!db) {
      throw new Error("CLOUDFLARE_DB_UNAVAILABLE");
    }

    const created = await createPaper(db, input, identity.email);

    await recordActivity(db, {
      entityType: "paper",
      entityId: created.id,
      action: "create",
      operatorEmail: identity.email,
      payloadSnapshot: created,
    });
    revalidatePublicPaperPages();

    return Response.json({ ok: true, item: created }, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}
