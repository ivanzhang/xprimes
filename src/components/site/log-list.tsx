import type { PublicLogItem } from "@/lib/db/mappers";
import { EmptyState } from "@/components/site/empty-state";

interface LogListProps {
  logs: PublicLogItem[];
}

/**
 * 中文注释：日志列表同时处理置顶标记与空态，供首页与日志页复用。
 * 使用示例：
 * ```tsx
 * <LogList logs={listPublicLogs()} />
 * ```
 */
export function LogList({ logs }: LogListProps) {
  if (logs.length === 0) {
    return (
      <EmptyState
        title="暂无动态"
        description="新的研究推进、版本说明与校对记录将在确认后发布。"
      />
    );
  }

  return (
    <div>
      {logs.map((log) => (
        <article key={log.id}>
          <p>
            <time dateTime={log.publishedAt}>{log.publishedAtLabel}</time>
            {log.isPinned ? <span> · 置顶</span> : null}
          </p>
          <h3>{log.title}</h3>
          <p>{log.content}</p>
          {log.excerptEn ? <p>{log.excerptEn}</p> : null}
        </article>
      ))}
    </div>
  );
}
