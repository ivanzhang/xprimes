interface ContactCardProps {
  title?: string;
  description?: string;
  primaryEmail?: string;
  secondaryEmail?: string;
}

/**
 * 中文注释：统一展示站点公开联系方式，避免多页重复维护邮箱信息。
 * 使用示例：
 * ```tsx
 * <ContactCard />
 * ```
 */
export function ContactCard({
  title = "联系方式",
  description = "研究交流、结构化反馈与版本勘误建议，均可通过邮件联系。",
  primaryEmail = "amy@xprimes.cn",
  secondaryEmail = "yiyi@xprimes.cn",
}: ContactCardProps) {
  return (
    <section aria-labelledby="contact-card-title">
      <h2 id="contact-card-title">{title}</h2>
      <p>{description}</p>
      <address>
        <p>
          <span>公开联系邮箱：</span>
          <a href={`mailto:${primaryEmail}`}>{primaryEmail}</a>
        </p>
        <p>
          <span>辅助联系邮箱：</span>
          <a href={`mailto:${secondaryEmail}`}>{secondaryEmail}</a>
        </p>
      </address>
    </section>
  );
}
