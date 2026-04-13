import { AdminEmptyState } from "@/components/admin/empty-state";
import { LogForm } from "@/components/admin/log-form";
import { LogTable } from "@/components/admin/log-table";
import { listAdminLogsFromRuntime } from "@/lib/repositories/log-repository";

/**
 * 中文注释：日志后台页优先保证“能发布、能编辑、能删除”，不在首版追求复杂 CMS 交互。
 * 使用示例：
 * ```tsx
 * <AdminLogsPage />
 * ```
 */
export default async function AdminLogsPage() {
  const { logs, hasDatabase } = await listAdminLogsFromRuntime();

  return (
    <section aria-labelledby="admin-logs-title">
      <h2 id="admin-logs-title">动态日志管理</h2>
      <p>日志没有草稿态，保存成功后会立即出现在前台 `/log` 与首页“最近动态”。</p>

      {hasDatabase ? (
        <>
          <LogForm mode="create" submitLabel="立即发布" />
          <LogTable logs={logs} />
        </>
      ) : (
        <AdminEmptyState
          title="尚未连接内容数据库"
          description="请先完成 Cloudflare D1 绑定，再在这里发布、编辑或删除日志。"
        />
      )}
    </section>
  );
}
