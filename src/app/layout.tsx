import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XPrimes",
  description: "XPrimes 官方站点",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      {/* 中文注释：保留最小站点标识，便于测试与后续基础壳层扩展。 */}
      <body data-site="xprimes">{children}</body>
    </html>
  );
}
