import { LogList } from "@/components/site/log-list";
import { SectionHeading } from "@/components/site/section-heading";
import { listPublicLogs } from "@/lib/repositories/log-repository";

// 中文注释：动态日志需要较快反映新发布内容，因此使用显式 revalidate。
export const revalidate = 60;

export default function LogPage() {
  const logs = listPublicLogs();

  return (
    <main aria-labelledby="log-title">
      <section>
        <h1 id="log-title">动态日志</h1>
        <p>按时间记录研究推进、术语调整、版本准备与公开说明，优先强调可追溯性。</p>
      </section>

      <section>
        <SectionHeading
          eyebrow="TIMELINE"
          title="公开记录"
          description="日志默认按置顶与发布时间排序，便于读者快速把握站点进展。"
        />
        <LogList logs={logs} />
      </section>
    </main>
  );
}
