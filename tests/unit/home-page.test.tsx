import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import RootLayout from "@/app/layout";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("显示 XPrimes 标题和联系邮箱", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "XPrimes" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "amy@xprimes.cn",
      }),
    ).toHaveAttribute("href", "mailto:amy@xprimes.cn");
  });

  it("根布局输出最小站点标识", () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <HomePage />
      </RootLayout>,
    );

    expect(markup).toContain('lang="zh-CN"');
    expect(markup).toContain('data-site="xprimes"');
  });
});
