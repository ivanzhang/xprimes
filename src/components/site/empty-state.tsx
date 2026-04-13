interface EmptyStateProps {
  title: string;
  description: string;
}

/**
 * 中文注释：统一公开页面空态文案，避免多个列表重复拼装相同结构。
 * 使用示例：
 * ```tsx
 * <EmptyState title="尚无公开版本" description="待正式版本发布后展示。" />
 * ```
 */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div aria-live="polite">
      <p>{title}</p>
      <p>{description}</p>
    </div>
  );
}
