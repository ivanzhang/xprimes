import { z } from "zod";
import { requireCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { verifyEmailCode } from "@/lib/auth/email-code";
import { findOrCreateUser, createSession, recordAdminLogin } from "@/lib/auth/session";
import { isAllowedAdminEmail } from "@/lib/auth/admin-access";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "验证码为 6 位数字"),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json();
    const { email, code } = verifySchema.parse(payload);
    const { db } = await requireCloudflareRuntimeContext();

    const valid = await verifyEmailCode(db, email, code);

    if (!valid) {
      return Response.json(
        { ok: false, error: "INVALID_CODE", message: "验证码无效或已过期。" },
        { status: 400 },
      );
    }

    const userId = await findOrCreateUser(db, "email", email, {
      email,
      name: email.split("@")[0],
      avatarUrl: null,
    });

    await createSession(db, userId);

    if (isAllowedAdminEmail(email)) {
      await recordAdminLogin(db, userId, email);
    }

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { ok: false, error: "INVALID_INPUT", issues: error.flatten() },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
