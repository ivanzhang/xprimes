import { z } from "zod";
import { requireCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { getSessionUser } from "@/lib/auth/session";

const commentSchema = z.object({
  pageKey: z.string().min(1),
  content: z.string().trim().min(1, "评论内容不能为空").max(2000, "评论不能超过 2000 字"),
});

interface CommentRow {
  id: string;
  page_key: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string | null;
  user_avatar: string | null;
  user_provider: string;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const pageKey = url.searchParams.get("page");

    if (!pageKey) {
      return Response.json({ ok: false, error: "MISSING_PAGE_KEY" }, { status: 400 });
    }

    const { db } = await requireCloudflareRuntimeContext();

    const result = await db
      .prepare(
        `SELECT c.id, c.page_key, c.user_id, c.content, c.created_at,
                u.name AS user_name, u.avatar_url AS user_avatar, u.provider AS user_provider
         FROM comments c JOIN users u ON c.user_id = u.id
         WHERE c.page_key = ?
         ORDER BY c.created_at ASC
         LIMIT 200`,
      )
      .bind(pageKey)
      .all<CommentRow>();

    const comments = (result.results ?? []).map((row) => ({
      id: row.id,
      content: row.content,
      createdAt: row.created_at,
      user: {
        name: row.user_name,
        avatar: row.user_avatar,
        provider: row.user_provider,
      },
    }));

    return Response.json({ ok: true, comments });
  } catch {
    return Response.json({ ok: true, comments: [] });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { db } = await requireCloudflareRuntimeContext();
    const user = await getSessionUser(db);

    if (!user) {
      return Response.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const payload = await request.json();
    const { pageKey, content } = commentSchema.parse(payload);

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db
      .prepare("INSERT INTO comments (id, page_key, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(id, pageKey, user.id, content, now)
      .run();

    return Response.json({
      ok: true,
      comment: {
        id,
        content,
        createdAt: now,
        user: { name: user.name, avatar: user.avatarUrl, provider: user.provider },
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { ok: false, error: "INVALID_COMMENT", issues: error.flatten() },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
