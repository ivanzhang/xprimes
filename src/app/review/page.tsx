import { ContactCard } from "@/components/site/contact-card";
import { ReviewList } from "@/components/site/review-list";
import { SectionHeading } from "@/components/site/section-heading";
import { listPublishedReviewSections } from "@/lib/repositories/review-repository";

const REVIEW_PROTOCOL = [
  "Each critique should reference a specific definition, lemma, or theorem.",
  "Ambiguous or non-specific objections will not be tracked.",
  "All responses will point to explicit sections or revisions.",
];

export default function ReviewPage() {
  const sections = listPublishedReviewSections();

  return (
    <main aria-labelledby="review-title">
      <section>
        <h1 id="review-title">反质疑</h1>
        <p>本页用于结构化记录问题、质疑与回应尝试；目标是降低讨论成本，而不是制造对抗语气。</p>
      </section>

      <section>
        <SectionHeading
          eyebrow="REVIEW"
          title="Review & Discussion"
          description="欢迎逐条验证与指出问题，所有公开条目都应具备编号、定位与可追溯说明。"
        />
        <p>
          All feedback is welcome, but each item should remain specific, referenceable and
          suitable for archival follow-up.
        </p>
      </section>

      <section aria-labelledby="review-protocol-title">
        <h2 id="review-protocol-title">Review Protocol</h2>
        <ul>
          {REVIEW_PROTOCOL.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <ReviewList sections={sections} />
      </section>

      <section aria-labelledby="submit-feedback-title">
        <h2 id="submit-feedback-title">Submit Feedback</h2>
        <p>如需提交结构化反馈，请通过邮件提供引用位置、问题描述与必要上下文。</p>
        <pre>{`Subject: XPrimes Review - [Short Title]

Reference:
Definition / Lemma / Theorem

Comment:
Clear and specific statement`}</pre>
      </section>

      <ContactCard title="反馈邮箱" description="结构化质疑、版本勘误与补充材料可发送至以下邮箱。" />
    </main>
  );
}
