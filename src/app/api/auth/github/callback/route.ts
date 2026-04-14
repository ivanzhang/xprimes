import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { exchangeGitHubCode, getGitHubProfile } from "@/lib/auth/oauth";
import { findOrCreateUser, createSession } from "@/lib/auth/session";

export async function GET(request: Request): Promise<Response | never> {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const cookieStore = await cookies();
    const savedState = cookieStore.get("oauth_state")?.value;
    cookieStore.delete("oauth_state");

    if (!code || !state || state !== savedState) {
      return Response.json({ ok: false, error: "INVALID_OAUTH_STATE" }, { status: 400 });
    }

    const { env, db } = await requireCloudflareRuntimeContext();
    const { accessToken } = await exchangeGitHubCode(env, code);
    const profile = await getGitHubProfile(accessToken);

    const userId = await findOrCreateUser(db, "github", profile.id, {
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
    });

    await createSession(db, userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AUTH_FAILED";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }

  redirect("/");
}
