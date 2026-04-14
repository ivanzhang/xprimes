import { z } from "zod";
import { requireCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { createEmailCode, sendEmailCode } from "@/lib/auth/email-code";

const emailSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json();
    const { email } = emailSchema.parse(payload);
    const { env, db } = await requireCloudflareRuntimeContext();

    const code = await createEmailCode(db, email);
    const result = await sendEmailCode(env, email, code);

    if (result.sent) {
      return Response.json({ ok: true, message: "验证码已发送到您的邮箱。" });
    }

    // Dev mode: return code for testing
    return Response.json({
      ok: true,
      message: "邮件服务未配置，验证码仅在开发模式下直接返回。",
      devCode: result.devCode,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { ok: false, error: "INVALID_EMAIL", issues: error.flatten() },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
