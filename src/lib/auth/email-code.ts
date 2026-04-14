import type { CloudflareBindings } from "@/lib/cloudflare/context";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const CODE_LENGTH = 6;

function generateCode(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const num = (bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3]) >>> 0;
  return String(num % 1_000_000).padStart(CODE_LENGTH, "0");
}

export async function createEmailCode(db: D1Database, email: string): Promise<string> {
  const code = generateCode();
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  // Invalidate previous codes for this email
  await db
    .prepare("UPDATE email_codes SET used = 1 WHERE email = ? AND used = 0")
    .bind(email)
    .run();

  await db
    .prepare(
      "INSERT INTO email_codes (id, email, code, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(id, email, code, expiresAt, new Date().toISOString())
    .run();

  return code;
}

export async function verifyEmailCode(
  db: D1Database,
  email: string,
  code: string,
): Promise<boolean> {
  const row = await db
    .prepare(
      "SELECT id FROM email_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > ?",
    )
    .bind(email, code, new Date().toISOString())
    .first<{ id: string }>();

  if (!row) return false;

  await db
    .prepare("UPDATE email_codes SET used = 1 WHERE id = ?")
    .bind(row.id)
    .run();

  return true;
}

/**
 * Send verification code via email.
 * Uses Resend API if RESEND_API_KEY is configured,
 * otherwise returns the code in the response (dev mode).
 */
export async function sendEmailCode(
  env: CloudflareBindings,
  email: string,
  code: string,
): Promise<{ sent: boolean; devCode?: string }> {
  const resendKey = env.RESEND_API_KEY;

  if (typeof resendKey === "string" && resendKey.length > 0) {
    const fromEmail = typeof env.EMAIL_FROM === "string" ? env.EMAIL_FROM : "noreply@xprimes.cn";

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${resendKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: `XPrimes <${fromEmail}>`,
        to: [email],
        subject: `XPrimes 登录验证码：${code}`,
        text: `您的 XPrimes 登录验证码是：${code}\n\n验证码 10 分钟内有效。\n\n如果这不是您的操作，请忽略此邮件。`,
      }),
    });

    return { sent: true };
  }

  // Dev mode: return code in response
  return { sent: false, devCode: code };
}
