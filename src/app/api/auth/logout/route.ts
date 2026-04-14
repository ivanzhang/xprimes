import { redirect } from "next/navigation";
import { tryGetCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { destroySession } from "@/lib/auth/session";

export async function GET(): Promise<never> {
  const runtime = await tryGetCloudflareRuntimeContext();

  if (runtime?.db) {
    await destroySession(runtime.db);
  }

  redirect("/");
}
