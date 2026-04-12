import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("显示 XPrimes 标题和联系邮箱", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "XPrimes" })).toBeInTheDocument();
    expect(screen.getByText("amy@xprimes.cn")).toBeInTheDocument();
  });
});
