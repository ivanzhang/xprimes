import { AdminEmptyState } from "@/components/admin/empty-state";
import { PaperForm } from "@/components/admin/paper-form";
import { PaperTable } from "@/components/admin/paper-table";
import { listAdminPapersFromRuntime } from "@/lib/repositories/paper-repository";

export default async function AdminPapersPage() {
  const { papers, hasDatabase } = await listAdminPapersFromRuntime();

  return (
    <section aria-labelledby="admin-papers-title">
      <h2 id="admin-papers-title">论文版本管理</h2>
      <p>论文支持"草稿"与"已发布"两种状态，发布后将出现在前台 `/papers` 页面。</p>

      {hasDatabase ? (
        <>
          <PaperForm mode="create" submitLabel="保存论文" />
          <PaperTable papers={papers} />
        </>
      ) : (
        <AdminEmptyState
          title="尚未连接内容数据库"
          description="请先完成 Cloudflare D1 与 R2 绑定，再在这里管理论文版本。"
        />
      )}
    </section>
  );
}
