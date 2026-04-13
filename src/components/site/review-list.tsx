import type { PublicReviewItem, PublicReviewSections } from "@/lib/db/mappers";
import { EmptyState } from "@/components/site/empty-state";

interface ReviewListProps {
  sections: PublicReviewSections;
}

function ReviewItems({ items }: { items: PublicReviewItem[] }) {
  return (
    <div>
      {items.map((item) => (
        <article key={item.id}>
          <p>{item.code}</p>
          <h4>{item.title}</h4>
          <p>Reference: {item.reference}</p>
          <p>{item.questionBody}</p>
          {item.responseBody ? <p>Response: {item.responseBody}</p> : null}
          <p>Updated: {item.updatedAtLabel}</p>
        </article>
      ))}
    </div>
  );
}

/**
 * 中文注释：反质疑页保持 open / resolved 双分区，便于后续直接接入后台发布流。
 * 使用示例：
 * ```tsx
 * <ReviewList sections={listPublishedReviewSections()} />
 * ```
 */
export function ReviewList({ sections }: ReviewListProps) {
  return (
    <div>
      <section aria-labelledby="review-open-title">
        <h3 id="review-open-title">Open Questions</h3>
        {sections.openItems.length > 0 ? (
          <ReviewItems items={sections.openItems} />
        ) : (
          <EmptyState
            title="暂无开放问题"
            description="如有需要进一步核查的条目，会在确认编号后公开列出。"
          />
        )}
      </section>

      <section aria-labelledby="review-resolved-title">
        <h3 id="review-resolved-title">Addressed Critiques</h3>
        {sections.resolvedItems.length > 0 ? (
          <ReviewItems items={sections.resolvedItems} />
        ) : (
          <EmptyState
            title="暂无已回应条目"
            description="已完成回应的问题将在修订版本或公开说明准备好后归档到此处。"
          />
        )}
      </section>
    </div>
  );
}
