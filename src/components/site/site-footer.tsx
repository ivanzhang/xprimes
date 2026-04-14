export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="footer-brand">XPrimes</p>
          <p>素数分布结构研究 · 分布刚性原理</p>
        </div>

        <div className="footer-links">
          <a href="/papers">论文版本</a>
          <a href="/log">动态日志</a>
          <a href="/review">审读反馈</a>
          <a href="mailto:amy@xprimes.cn">联系我们</a>
          <a
            href="https://github.com/ivanzhang/xprimes"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>

        <p className="footer-copy">
          © {new Date().getFullYear()} XPrimes. 研究材料按版本递增发布，欢迎结构化审读与反馈。
        </p>
      </div>
    </footer>
  );
}
