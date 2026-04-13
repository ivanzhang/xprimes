interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

/**
 * 中文注释：前台各分区共用的小标题组件，保持页面语气一致。
 * 使用示例：
 * ```tsx
 * <SectionHeading title="当前状态" description="说明站点发布节奏。" />
 * ```
 */
export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <header>
      {eyebrow ? <p>{eyebrow}</p> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  );
}
