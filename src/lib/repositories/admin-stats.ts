export interface AdminDashboardStats {
  logs: { total: number; recent7d: number };
  papers: { total: number; published: number; draft: number; recent7d: number };
  reviews: { total: number; recent7d: number };
  comments: { total: number; hidden: number; recent7d: number };
  logins: { total: number; recent7d: number; uniqueEmails: number };
}

async function count(db: D1Database, sql: string): Promise<number> {
  const row = await db.prepare(sql).first<{ c: number }>();
  return row?.c ?? 0;
}

export async function getAdminDashboardStats(db: D1Database): Promise<AdminDashboardStats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    logsTotal, logsRecent,
    papersTotal, papersPublished, papersDraft, papersRecent,
    reviewsTotal, reviewsRecent,
    commentsTotal, commentsHidden, commentsRecent,
    loginsTotal, loginsRecent, loginsUnique,
  ] = await Promise.all([
    count(db, "SELECT COUNT(*) AS c FROM logs WHERE deleted_at IS NULL"),
    count(db, `SELECT COUNT(*) AS c FROM logs WHERE deleted_at IS NULL AND updated_at > '${sevenDaysAgo}'`),
    count(db, "SELECT COUNT(*) AS c FROM papers WHERE deleted_at IS NULL"),
    count(db, "SELECT COUNT(*) AS c FROM papers WHERE deleted_at IS NULL AND status = 'published'"),
    count(db, "SELECT COUNT(*) AS c FROM papers WHERE deleted_at IS NULL AND status = 'draft'"),
    count(db, `SELECT COUNT(*) AS c FROM papers WHERE deleted_at IS NULL AND updated_at > '${sevenDaysAgo}'`),
    count(db, "SELECT COUNT(*) AS c FROM review_items WHERE deleted_at IS NULL"),
    count(db, `SELECT COUNT(*) AS c FROM review_items WHERE deleted_at IS NULL AND updated_at > '${sevenDaysAgo}'`),
    count(db, "SELECT COUNT(*) AS c FROM comments"),
    count(db, "SELECT COUNT(*) AS c FROM comments WHERE is_hidden = 1"),
    count(db, `SELECT COUNT(*) AS c FROM comments WHERE created_at > '${sevenDaysAgo}'`),
    count(db, "SELECT COUNT(*) AS c FROM admin_logins"),
    count(db, `SELECT COUNT(*) AS c FROM admin_logins WHERE created_at > '${sevenDaysAgo}'`),
    count(db, "SELECT COUNT(DISTINCT email) AS c FROM admin_logins"),
  ]);

  return {
    logs: { total: logsTotal, recent7d: logsRecent },
    papers: { total: papersTotal, published: papersPublished, draft: papersDraft, recent7d: papersRecent },
    reviews: { total: reviewsTotal, recent7d: reviewsRecent },
    comments: { total: commentsTotal, hidden: commentsHidden, recent7d: commentsRecent },
    logins: { total: loginsTotal, recent7d: loginsRecent, uniqueEmails: loginsUnique },
  };
}
