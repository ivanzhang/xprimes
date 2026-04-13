import { LogList } from "@/components/site/log-list";
import { SectionHeading } from "@/components/site/section-heading";
import { listPublicLogs } from "@/lib/repositories/log-repository";
import { listPublishedPapers } from "@/lib/repositories/paper-repository";
import { listPublishedReviewSections } from "@/lib/repositories/review-repository";

export default function HomePage() {
  const latestLogs = listPublicLogs().slice(0, 2);
  const papers = listPublishedPapers();
  const reviewSections = listPublishedReviewSections();
  const reviewCount = reviewSections.openItems.length + reviewSections.resolvedItems.length;

  return (
    <main aria-labelledby="home-title">
      <section>
        <p>Research Archive</p>
        <h1 id="home-title">XPrimes</h1>
        <p>一个以中文为主、用于研究留痕、版本发布与结构化审读的数学项目官方网站。</p>
        <p>
          Work in progress. Materials are released incrementally for transparency and
          review.
        </p>
        <p>
          <span>主联系邮箱：</span>
          <a href="mailto:amy@xprimes.cn">amy@xprimes.cn</a>
        </p>
      </section>

      <section>
        <SectionHeading
          eyebrow="BACKGROUND"
          title="项目背景"
          description="围绕素数分布结构原则展开的持续研究，以克制发布、逐步留痕与可追溯讨论为基本方法。"
        />
        <p>
          站点当前优先承载项目背景说明、论文版本入口、动态日志与反质疑协议，便于在正式外部验证前保留公开记录。
        </p>
      </section>

      <section>
        <SectionHeading
          eyebrow="STATUS"
          title="当前状态"
          description="先完成资料整理与最小发布，再逐步补充正式版本与结构化回应。"
        />
        <ul>
          <li>已发布论文版本：{papers.length}</li>
          <li>公开审读条目：{reviewCount}</li>
          <li>最近动态条目：{latestLogs.length}</li>
        </ul>
      </section>

      <section>
        <SectionHeading
          eyebrow="ENTRY"
          title="快速入口"
          description="面向公开读者的四个核心页面，均以稳定、可扩展的结构为先。"
        />
        <nav aria-label="公开页面入口">
          <p>
            <a href="/papers">论文版本</a>
          </p>
          <p>
            <a href="/log">动态日志</a>
          </p>
          <p>
            <a href="/review">反质疑</a>
          </p>
        </nav>
      </section>

      <section>
        <SectionHeading
          eyebrow="LATEST"
          title="最近动态"
          description="记录关键变更、版本准备与公开说明，避免信息散落。"
        />
        <LogList logs={latestLogs} />
      </section>

      <section>
        <SectionHeading
          eyebrow="CONTACT"
          title="联系方式"
          description="页首保留主联系邮箱，辅助邮箱用于补充材料或协同沟通。"
        />
        <p>
          辅助联系邮箱：
          <a href="mailto:yiyi@xprimes.cn">yiyi@xprimes.cn</a>
        </p>
      </section>
    </main>
  );
}
