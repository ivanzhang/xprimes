import type { PublicPaperItem } from "@/lib/db/mappers";
import { EmptyState } from "@/components/site/empty-state";

interface PaperListProps {
  papers: PublicPaperItem[];
}

/**
 * 中文注释：论文列表专门处理“尚无公开版本”的学术化空态与下载入口。
 * 使用示例：
 * ```tsx
 * <PaperList papers={listPublishedPapers()} />
 * ```
 */
export function PaperList({ papers }: PaperListProps) {
  if (papers.length === 0) {
    return (
      <EmptyState
        title="尚无公开版本"
        description="正式论文版本将在完成内部校读与必要整理后按版本顺序公开。"
      />
    );
  }

  return (
    <div>
      {papers.map((paper) => (
        <article key={paper.id}>
          <p>{paper.version}</p>
          <h3>{paper.title}</h3>
          <p>{paper.subtitle}</p>
          <p>发布日期：{paper.publishDateLabel}</p>
          <p>{paper.abstract}</p>
          {paper.abstractEn ? <p>{paper.abstractEn}</p> : null}
          <p>
            <a href={paper.downloadUrl}>{paper.downloadLabel}</a>
          </p>
        </article>
      ))}
    </div>
  );
}
