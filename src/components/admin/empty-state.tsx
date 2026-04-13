interface AdminEmptyStateProps {
  title: string;
  description: string;
}

/**
 * 中文注释：统一后台空态与受控提示，避免未授权、无内容等场景重复拼装。
 * 使用示例：
 * ```tsx
 * <AdminEmptyState title="后台访问受限" description="请先完成管理员登录。" />
 * ```
 */
export function AdminEmptyState({ title, description }: AdminEmptyStateProps) {
  return (
    <section aria-live="polite">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
