"use client";

import { useEffect, useRef } from "react";

interface CommentsProps {
  term?: string;
}

/**
 * GitHub Issues-based comment widget via utterances.
 * - Uses GitHub OAuth (users login with GitHub to comment)
 * - Comments are stored as GitHub Issues in the repo
 * - Zero cost, zero backend
 *
 * For mathematicians who don't use GitHub, the page also shows
 * the email submission option as a fallback.
 */
export function Comments({ term }: CommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Avoid duplicate script injection
    if (container.querySelector("iframe")) return;

    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.setAttribute("repo", "ivanzhang/xprimes");
    script.setAttribute("issue-term", term ?? "pathname");
    script.setAttribute("label", "comment");
    script.setAttribute("theme", "github-light");
    script.crossOrigin = "anonymous";
    script.async = true;
    container.appendChild(script);

    return () => {
      // Clean up on unmount
      const iframe = container.querySelector("iframe");
      if (iframe) iframe.remove();
      const existingScript = container.querySelector("script");
      if (existingScript) existingScript.remove();
    };
  }, [term]);

  return (
    <section className="section">
      <p className="section-eyebrow">DISCUSSION</p>
      <h2 className="section-title">评论与讨论</h2>
      <p className="section-desc">
        使用 GitHub 账号登录即可评论。如果您没有 GitHub 账号，也可以通过邮件
        （<a href="mailto:amy@xprimes.cn">amy@xprimes.cn</a>）提交反馈。
      </p>
      <div ref={containerRef} />
    </section>
  );
}
