"use client";

import { useState } from "react";

const NAV_LINKS = [
  { href: "/papers", label: "论文" },
  { href: "/log", label: "动态" },
  { href: "/review", label: "审读" },
] as const;

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="/" className="site-logo">
          <span>X</span>Primes
        </a>

        <button
          className="nav-toggle"
          aria-label={isOpen ? "关闭导航" : "打开导航"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? "✕" : "☰"}
        </button>

        <nav className={`site-nav ${isOpen ? "open" : ""}`} aria-label="主导航">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com/ivanzhang/xprimes"
            className="nav-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
