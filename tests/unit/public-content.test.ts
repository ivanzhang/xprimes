import { render, screen } from "@testing-library/react";
import HomePage, { revalidate as homePageRevalidate } from "@/app/page";
import LogPage, { revalidate as logPageRevalidate } from "@/app/log/page";
import PapersPage, { revalidate as papersPageRevalidate } from "@/app/papers/page";
import ReviewPage, { revalidate as reviewPageRevalidate } from "@/app/review/page";
import {
  mapPaperRowToPublicItem,
  mapReviewRowsToSections,
} from "@/lib/db/mappers";
import { listPublicLogs } from "@/lib/repositories/log-repository";
import { listPublishedPapers } from "@/lib/repositories/paper-repository";
import { listPublishedReviewSections } from "@/lib/repositories/review-repository";

describe("public content", () => {
  it("将论文行映射为前台论文卡片", () => {
    const item = mapPaperRowToPublicItem({
      id: "paper-1",
      version: "v0.1",
      title_zh: "分布刚性原理：结构初稿",
      title_en: "Distribution Rigidity: Initial Draft",
      abstract_zh: "这是一个用于测试的中文摘要。",
      abstract_en: "This is a test abstract.",
      pdf_key: "papers/v0.1.pdf",
      pdf_filename: "xprimes-v0.1.pdf",
      pdf_size: 2048,
      publish_date: "2026-04-12",
      status: "published",
      author_email: "amy@xprimes.cn",
      created_at: "2026-04-12T00:00:00.000Z",
      updated_at: "2026-04-12T00:00:00.000Z",
    });

    expect(item.version).toBe("v0.1");
    expect(item.publishDateLabel).toBe("2026-04-12");
    expect(item.downloadLabel).toContain("PDF");
    expect(item.downloadUrl).toBe("/papers/v0.1.pdf");
  });

  it("按 open 和 resolved 分组已发布反质疑条目", () => {
    const sections = mapReviewRowsToSections([
      {
        id: "review-1",
        code: "Q-001",
        item_type: "open",
        title: "定义 2.1 的收敛范围",
        reference: "Definition 2.1",
        question_body: "请说明大范围 n 下的收敛条件。",
        response_body: null,
        status: "published",
        updated_by: "amy@xprimes.cn",
        created_at: "2026-04-12T00:00:00.000Z",
        updated_at: "2026-04-12T00:00:00.000Z",
      },
      {
        id: "review-2",
        code: "R-001",
        item_type: "resolved",
        title: "边界条件说明",
        reference: "Theorem 1",
        question_body: "原始写法对边界情况表述不足。",
        response_body: "已在 v0.2 第 3.2 节补充。",
        status: "published",
        updated_by: "amy@xprimes.cn",
        created_at: "2026-04-12T00:00:00.000Z",
        updated_at: "2026-04-13T00:00:00.000Z",
      },
      {
        id: "review-3",
        code: "Q-002",
        item_type: "open",
        title: "草稿条目不应公开",
        reference: "Lemma 2",
        question_body: "这条只是草稿。",
        response_body: null,
        status: "draft",
        updated_by: "amy@xprimes.cn",
        created_at: "2026-04-12T00:00:00.000Z",
        updated_at: "2026-04-12T00:00:00.000Z",
      },
    ]);

    expect(sections.openItems).toHaveLength(1);
    expect(sections.resolvedItems).toHaveLength(1);
    expect(sections.openItems[0]?.code).toBe("Q-001");
    expect(sections.resolvedItems[0]?.code).toBe("R-001");
  });

  it("在无 DB 绑定时优雅回退到内置公开内容", () => {
    expect(listPublicLogs()).toHaveLength(1);
    expect(listPublicLogs()[0]?.title).toContain("站点");
    expect(listPublishedPapers()).toEqual([]);
    expect(listPublishedReviewSections()).toEqual({
      openItems: [],
      resolvedItems: [],
    });
  });

  it("仅在未接数据源时使用 fallback，null 视为错误输入", () => {
    expect(() => listPublicLogs(null)).toThrowError("PUBLIC_CONTENT_SOURCE_NULL");
    expect(() => listPublishedPapers(null)).toThrowError("PUBLIC_CONTENT_SOURCE_NULL");
    expect(() => listPublishedReviewSections(null)).toThrowError("PUBLIC_CONTENT_SOURCE_NULL");
  });

  it("四个公开页面声明统一的数据新鲜度策略", () => {
    expect(homePageRevalidate).toBe(60);
    expect(papersPageRevalidate).toBe(60);
    expect(logPageRevalidate).toBe(60);
    expect(reviewPageRevalidate).toBe(60);
  });

  it("首页展示项目定位、快速入口与联系邮箱", async () => {
    render(await HomePage());

    expect(screen.getByRole("heading", { name: "XPrimes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "论文版本" })).toHaveAttribute("href", "/papers");
    expect(screen.getByRole("link", { name: "动态日志" })).toHaveAttribute("href", "/log");
    expect(screen.getByRole("link", { name: "反质疑" })).toHaveAttribute("href", "/review");
    expect(screen.getAllByRole("link", { name: "amy@xprimes.cn" })[0]).toHaveAttribute(
      "href",
      "mailto:amy@xprimes.cn",
    );
  });

  it("公开页面展示论文空态、日志回退内容与 Review Protocol", async () => {
    render(await PapersPage());
    expect(screen.getByText("尚无公开版本")).toBeInTheDocument();

    render(await LogPage());
    expect(screen.getByText("项目站点建立并开始留痕")).toBeInTheDocument();

    render(await ReviewPage());
    expect(screen.getByRole("heading", { name: "Review Protocol" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open Questions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Addressed Critiques" })).toBeInTheDocument();
  });
});
