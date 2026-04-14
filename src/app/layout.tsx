import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata: Metadata = {
  title: "XPrimes — 素数分布结构研究",
  description:
    "围绕素数分布结构原则展开的持续研究，论文发布、动态日志与结构化审读的数学项目官方网站。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body data-site="xprimes">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
