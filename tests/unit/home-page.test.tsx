import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("渲染 XPrimes 标题和主邮箱", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "XPrimes" })).toBeInTheDocument();
    expect(screen.getByText("amy@xprimes.cn")).toBeInTheDocument();
  });
});
