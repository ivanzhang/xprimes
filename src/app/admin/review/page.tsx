import { AdminEmptyState } from "@/components/admin/empty-state";
import { ReviewForm } from "@/components/admin/review-form";
import { ReviewTable } from "@/components/admin/review-table";
import { listAdminReviewItemsFromRuntime } from "@/lib/repositories/review-repository";

export default async function AdminReviewPage() {
  const { items, hasDatabase } = await listAdminReviewItemsFromRuntime();

  return (
    <section aria-labelledby="admin-review-title">
      <h2 id="admin-review-title">反质疑条目管理</h2>
      <p>条目支持"草稿"与"已发布"两种状态，发布后将出现在前台 `/review` 页面。</p>

      {hasDatabase ? (
        <>
          <ReviewForm mode="create" submitLabel="保存条目" />
          <ReviewTable items={items} />
        </>
      ) : (
        <AdminEmptyState
          title="尚未连接内容数据库"
          description="请先完成 Cloudflare D1 绑定，再在这里管理反质疑条目。"
        />
      )}
    </section>
  );
}
