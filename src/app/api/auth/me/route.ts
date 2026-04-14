import { tryGetCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(): Promise<Response> {
  try {
    const runtime = await tryGetCloudflareRuntimeContext();

    if (!runtime?.db) {
      return Response.json({ ok: true, user: null });
    }

    const user = await getSessionUser(runtime.db);
    return Response.json({ ok: true, user });
  } catch {
    return Response.json({ ok: true, user: null });
  }
}
