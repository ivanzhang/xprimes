export default function HomePage() {
  return (
    <main aria-labelledby="home-title">
      {/* 中文注释：Task 1 首页仅提供最小品牌与联系信息，满足首轮验收。 */}
      <section>
        <h1 id="home-title">XPrimes</h1>
        <p>
          <span>主联系邮箱：</span>
          <a href="mailto:amy@xprimes.cn">amy@xprimes.cn</a>
        </p>
      </section>
    </main>
  );
}
