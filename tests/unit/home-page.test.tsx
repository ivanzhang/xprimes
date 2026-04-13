import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import RootLayout from "@/app/layout";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("显示带语义标识的首页标题和联系邮箱", async () => {
    render(await HomePage());

    expect(screen.getByRole("main")).toHaveAttribute("aria-labelledby", "home-title");
    expect(screen.getByRole("heading", { name: "XPrimes" })).toHaveAttribute("id", "home-title");
    expect(screen.getByText("主联系邮箱：")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "amy@xprimes.cn",
      }),
    ).toHaveAttribute("href", "mailto:amy@xprimes.cn");
  });

  it("根布局输出最小站点标识", async () => {
    const page = await HomePage();
    const markup = renderToStaticMarkup(
      <RootLayout>
        {page}
      </RootLayout>,
    );

    expect(markup).toContain('lang="zh-CN"');
    expect(markup).toContain('data-site="xprimes"');
  });
});
