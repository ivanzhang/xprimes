export interface ActivityRecordInput {
  entityType: string;
  entityId: string;
  action: string;
  operatorEmail: string;
  payloadSnapshot: unknown;
}

/**
 * 中文注释：统一写入审计日志，后续论文与反质疑模块也可复用同一入口。
 * 使用示例：
 * ```ts
 * await recordActivity(db, {
 *   entityType: "log",
 *   entityId: "log-1",
 *   action: "create",
 *   operatorEmail: "amy@xprimes.cn",
 *   payloadSnapshot: { title: "首条日志" },
 * });
 * ```
 */
export async function recordActivity(
  db: D1Database,
  input: ActivityRecordInput,
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO activity_logs (id, entity_type, entity_id, action, operator_email, payload_snapshot, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      crypto.randomUUID(),
      input.entityType,
      input.entityId,
      input.action,
      input.operatorEmail,
      JSON.stringify(input.payloadSnapshot),
      new Date().toISOString(),
    )
    .run();
}
