import { PaperList } from "@/components/site/paper-list";
import { SectionHeading } from "@/components/site/section-heading";
import { listPublishedPapers } from "@/lib/repositories/paper-repository";

// 中文注释：显式声明 ISR 周期，避免前台长期停留在构建时快照。
export const revalidate = 60;

export default function PapersPage() {
  const papers = listPublishedPapers();

  return (
    <main aria-labelledby="papers-title">
      <section>
        <h1 id="papers-title">论文版本</h1>
        <p>公开展示已发布论文版本、摘要与 PDF 下载入口；草稿阶段材料不会在此页出现。</p>
      </section>

      <section>
        <SectionHeading
          eyebrow="RELEASES"
          title="公开版本"
          description="页面以稳定版本为准，避免未定稿内容过早扩散。"
        />
        <PaperList papers={papers} />
      </section>
    </main>
  );
}
