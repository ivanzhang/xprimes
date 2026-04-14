import type { PublicLogItem } from "@/lib/db/mappers";

interface LogListProps {
  logs: PublicLogItem[];
}

export function LogList({ logs }: LogListProps) {
  if (logs.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <h3 className="card-title">暂无动态</h3>
        <p className="card-body">新的研究推进与版本说明将在确认后发布。</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {logs.map((log) => (
        <article
          key={log.id}
          className={`timeline-item${log.isPinned ? " pinned" : ""}`}
        >
          <p className="timeline-date">
            <time dateTime={log.publishedAt}>{log.publishedAtLabel}</time>
            {log.isPinned ? <span className="badge badge-pinned" style={{ marginLeft: 8 }}>置顶</span> : null}
          </p>
          <h3 className="timeline-title">{log.title}</h3>
          <p className="timeline-content">{log.content}</p>
          {log.excerptEn ? (
            <p className="timeline-content" style={{ fontStyle: "italic", marginTop: 4 }}>
              {log.excerptEn}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
