import { requireAdminSession } from "@/lib/auth/admin-access";
import { requireCloudflareRuntimeContext } from "@/lib/cloudflare/context";

interface RouteContext {
  params?: Promise<Record<string, string | string[] | undefined>>;
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  try {
    await requireAdminSession();
    const params = await context.params;
    const id = params?.id;
    if (typeof id !== "string") {
      return Response.json({ ok: false, error: "INVALID_ID" }, { status: 400 });
    }

    const { db } = await requireCloudflareRuntimeContext();
    const payload = (await request.json()) as { isHidden?: boolean };
    const isHidden = payload.isHidden ? 1 : 0;

    await db.prepare("UPDATE comments SET is_hidden = ? WHERE id = ?").bind(isHidden, id).run();

    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR";
    if (msg === "UNAUTHORIZED_ADMIN") {
      return Response.json({ ok: false, error: msg }, { status: 401 });
    }
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
