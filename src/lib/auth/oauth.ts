import type { CloudflareBindings } from "@/lib/cloudflare/context";

function getEnvString(env: CloudflareBindings, key: string): string {
  const value = env[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing env: ${key}`);
  }
  return value;
}

function getSiteUrl(env: CloudflareBindings): string {
  return getEnvString(env, "SITE_URL");
}

// ==================== GitHub ====================

export function getGitHubAuthUrl(env: CloudflareBindings, state: string): string {
  const clientId = getEnvString(env, "GITHUB_CLIENT_ID");
  const redirectUri = `${getSiteUrl(env)}/api/auth/github/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state,
  });

  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeGitHubCode(
  env: CloudflareBindings,
  code: string,
): Promise<{ accessToken: string }> {
  const clientId = getEnvString(env, "GITHUB_CLIENT_ID");
  const clientSecret = getEnvString(env, "GITHUB_CLIENT_SECRET");

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const data = (await response.json()) as { access_token?: string; error?: string };

  if (!data.access_token) {
    throw new Error(data.error ?? "GitHub token exchange failed");
  }

  return { accessToken: data.access_token };
}

export async function getGitHubProfile(
  accessToken: string,
): Promise<{ id: string; name: string | null; email: string | null; avatarUrl: string | null }> {
  const [userRes, emailRes] = await Promise.all([
    fetch("https://api.github.com/user", {
      headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" },
    }),
    fetch("https://api.github.com/user/emails", {
      headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" },
    }),
  ]);

  const user = (await userRes.json()) as {
    id: number;
    login: string;
    name: string | null;
    avatar_url: string;
  };

  let email: string | null = null;
  try {
    const emails = (await emailRes.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;
    const primary = emails.find((e) => e.primary && e.verified);
    email = primary?.email ?? emails[0]?.email ?? null;
  } catch {
    // email scope might fail, that's ok
  }

  return {
    id: String(user.id),
    name: user.name ?? user.login,
    email,
    avatarUrl: user.avatar_url,
  };
}

// ==================== Google ====================

export function getGoogleAuthUrl(env: CloudflareBindings, state: string): string {
  const clientId = getEnvString(env, "GOOGLE_CLIENT_ID");
  const redirectUri = `${getSiteUrl(env)}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(
  env: CloudflareBindings,
  code: string,
): Promise<{ accessToken: string }> {
  const clientId = getEnvString(env, "GOOGLE_CLIENT_ID");
  const clientSecret = getEnvString(env, "GOOGLE_CLIENT_SECRET");
  const redirectUri = `${getSiteUrl(env)}/api/auth/google/callback`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = (await response.json()) as { access_token?: string; error?: string };

  if (!data.access_token) {
    throw new Error(data.error ?? "Google token exchange failed");
  }

  return { accessToken: data.access_token };
}

export async function getGoogleProfile(
  accessToken: string,
): Promise<{ id: string; name: string | null; email: string | null; avatarUrl: string | null }> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  const data = (await response.json()) as {
    id: string;
    email: string;
    name: string;
    picture: string;
  };

  return {
    id: data.id,
    name: data.name ?? null,
    email: data.email ?? null,
    avatarUrl: data.picture ?? null,
  };
}
