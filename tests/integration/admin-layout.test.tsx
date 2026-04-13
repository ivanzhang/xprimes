import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminHomePage from "@/app/admin/page";
import AdminLayout from "@/app/admin/layout";
import { requireAdminIdentity } from "@/lib/auth/admin-access";

const { headersMock } = vi.hoisted(() => ({
  headersMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

describe("admin layout", () => {
  beforeEach(() => {
    headersMock.mockReset();
  });

  it("在缺少 Access 邮箱时拒绝管理员身份", () => {
    const request = new Request("https://xprimes.cn/admin");

    expect(() => requireAdminIdentity(request)).toThrowError("UNAUTHORIZED_ADMIN");
  });

  it("允许白名单邮箱通过严格守卫", () => {
    const request = new Request("https://xprimes.cn/admin", {
      headers: {
        "cf-access-authenticated-user-email": "amy@xprimes.cn",
      },
    });

    expect(requireAdminIdentity(request)).toEqual({ email: "amy@xprimes.cn" });
  });

  it("未授权时在后台布局中显示受控提示而非误判为已登录", async () => {
    headersMock.mockResolvedValue(new Headers());

    render(
      await AdminLayout({
        children: <div>不应展示的后台内容</div>,
      }),
    );

    expect(screen.getByRole("heading", { name: "后台访问受限" })).toBeInTheDocument();
    expect(screen.getByText("需要使用管理员邮箱完成 Access 登录后才能进入后台。"))
      .toBeInTheDocument();
    expect(screen.queryByText("不应展示的后台内容")).not.toBeInTheDocument();
  });

  it("已授权时渲染后台壳层、导航与三个管理入口", async () => {
    headersMock.mockResolvedValue(
      new Headers({
        "cf-access-authenticated-user-email": "yiyi@xprimes.cn",
      }),
    );

    render(
      await AdminLayout({
        children: <AdminHomePage />,
      }),
    );

    expect(screen.getByRole("heading", { name: "内容后台" })).toBeInTheDocument();
    expect(screen.getByText("当前管理员：yiyi@xprimes.cn")).toBeInTheDocument();

    const nav = screen.getByRole("navigation", { name: "后台导航" });
    expect(within(nav).getByRole("link", { name: "管理首页" })).toHaveAttribute(
      "href",
      "/admin",
    );
    expect(within(nav).getByRole("link", { name: "动态日志管理" })).toHaveAttribute(
      "href",
      "/admin/logs",
    );
    expect(within(nav).getByRole("link", { name: "论文版本管理" })).toHaveAttribute(
      "href",
      "/admin/papers",
    );
    expect(within(nav).getByRole("link", { name: "反质疑条目管理" })).toHaveAttribute(
      "href",
      "/admin/review",
    );

    expect(screen.getByRole("heading", { name: "动态日志管理" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "论文版本管理" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "反质疑条目管理" })).toBeInTheDocument();
  });
});
