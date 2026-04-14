import { tryGetCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import { AdminEmptyState } from "@/components/admin/empty-state";
import { CommentTable } from "@/components/admin/comment-table";

interface CommentRow {
  id: string;
  page_key: string;
  content: string;
  is_hidden: number;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
  user_provider: string;
}

export interface AdminComment {
  id: string;
  pageKey: string;
  content: string;
  isHidden: boolean;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  userProvider: string;
}

export default async function AdminCommentsPage() {
  const runtime = await tryGetCloudflareRuntimeContext();

  if (!runtime?.db) {
    return (
      <section>
        <h2>评论管理</h2>
        <AdminEmptyState title="尚未连接数据库" description="请先完成 D1 绑定。" />
      </section>
    );
  }

  let comments: AdminComment[] = [];
  try {
    const result = await runtime.db
      .prepare(
        `SELECT c.id, c.page_key, c.content, c.is_hidden, c.created_at,
                u.name AS user_name, u.email AS user_email, u.provider AS user_provider
         FROM comments c JOIN users u ON c.user_id = u.id
         ORDER BY c.created_at DESC LIMIT 500`,
      )
      .all<CommentRow>();

    comments = (result.results ?? []).map((r) => ({
      id: r.id,
      pageKey: r.page_key,
      content: r.content,
      isHidden: r.is_hidden === 1,
      createdAt: r.created_at,
      userName: r.user_name,
      userEmail: r.user_email,
      userProvider: r.user_provider,
    }));
  } catch {
    // no comments yet
  }

  return (
    <section>
      <h2>评论管理</h2>
      <p>管理用户评论。评论不会被删除，只能隐藏或显示。</p>
      <CommentTable comments={comments} />
    </section>
  );
}
