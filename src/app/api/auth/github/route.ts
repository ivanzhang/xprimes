import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { generateToken } from "@/lib/auth/session";
import { getGitHubAuthUrl } from "@/lib/auth/oauth";

export async function GET(): Promise<never> {
  const { env } = await requireCloudflareRuntimeContext();
  const state = generateToken().slice(0, 32);

  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  redirect(getGitHubAuthUrl(env, state));
}
