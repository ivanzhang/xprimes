import { tryGetCloudflareRuntimeContext } from "@/lib/cloudflare/context";
import type { ReviewItemRow } from "@/lib/db/schema";
import {
  mapReviewRowsToSections,
  type PublicReviewSections,
} from "@/lib/db/mappers";
import { FALLBACK_REVIEW_ROWS, resolvePublicRows } from "@/lib/repositories/fallback-content";
import type { ReviewInput } from "@/lib/validators/review";

export interface AdminReviewItem {
  id: string;
  code: string;
  itemType: "open" | "resolved";
  title: string;
  reference: string;
  questionBody: string;
  responseBody: string | null;
  status: "draft" | "published";
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  updatedAtLabel: string;
}

export interface AdminReviewCollection {
  items: AdminReviewItem[];
  hasDatabase: boolean;
}

const REVIEW_SELECT_SQL =
  "SELECT id, code, item_type, title, reference, question_body, response_body, status, updated_by, created_at, updated_at FROM review_items";

function mapRowToAdminItem(row: ReviewItemRow): AdminReviewItem {
  return {
    id: row.id,
    code: row.code,
    itemType: row.item_type,
    title: row.title,
    reference: row.reference,
    questionBody: row.question_body,
    responseBody: row.response_body,
    status: row.status,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedAtLabel: row.updated_at || "待定",
  };
}

async function listReviewRowsFromDb(db: D1Database): Promise<ReviewItemRow[]> {
  const result = await db
    .prepare(`${REVIEW_SELECT_SQL} WHERE deleted_at IS NULL ORDER BY updated_at DESC`)
    .all<ReviewItemRow>();

  return result.results ?? [];
}

async function getReviewRowById(db: D1Database, id: string): Promise<ReviewItemRow | null> {
  const row = await db.prepare(`${REVIEW_SELECT_SQL} WHERE id = ?`).bind(id).first<ReviewItemRow>();
  return row ?? null;
}

export function listPublishedReviewSections(rows?: ReviewItemRow[] | null): PublicReviewSections {
  return mapReviewRowsToSections(resolvePublicRows(rows, FALLBACK_REVIEW_ROWS));
}

export async function listPublishedReviewSectionsFromRuntime(): Promise<PublicReviewSections> {
  const runtime = await tryGetCloudflareRuntimeContext();

  if (!runtime?.db) {
    return listPublishedReviewSections();
  }

  try {
    return listPublishedReviewSections(await listReviewRowsFromDb(runtime.db));
  } catch {
    return listPublishedReviewSections();
  }
}

export async function listAdminReviewItemsFromRuntime(): Promise<AdminReviewCollection> {
  const runtime = await tryGetCloudflareRuntimeContext();

  if (!runtime?.db) {
    return { items: [], hasDatabase: false };
  }

  const rows = await listReviewRowsFromDb(runtime.db);

  return {
    items: rows.map(mapRowToAdminItem),
    hasDatabase: true,
  };
}

export async function createReviewItem(
  db: D1Database,
  input: ReviewInput,
  operatorEmail: string,
): Promise<ReviewItemRow> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      "INSERT INTO review_items (id, code, item_type, title, reference, question_body, response_body, status, updated_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      id,
      input.code,
      input.itemType,
      input.title,
      input.reference,
      input.questionBody,
      input.responseBody || null,
      input.status,
      operatorEmail,
      now,
      now,
    )
    .run();

  return (
    (await getReviewRowById(db, id)) ?? {
      id,
      code: input.code,
      item_type: input.itemType,
      title: input.title,
      reference: input.reference,
      question_body: input.questionBody,
      response_body: input.responseBody || null,
      status: input.status,
      updated_by: operatorEmail,
      created_at: now,
      updated_at: now,
    }
  );
}

export async function updateReviewItem(
  db: D1Database,
  id: string,
  input: ReviewInput,
): Promise<ReviewItemRow | null> {
  const existing = await getReviewRowById(db, id);

  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();

  await db
    .prepare(
      "UPDATE review_items SET code = ?, item_type = ?, title = ?, reference = ?, question_body = ?, response_body = ?, status = ?, updated_at = ? WHERE id = ?",
    )
    .bind(
      input.code,
      input.itemType,
      input.title,
      input.reference,
      input.questionBody,
      input.responseBody || null,
      input.status,
      now,
      id,
    )
    .run();

  return (
    (await getReviewRowById(db, id)) ?? {
      ...existing,
      code: input.code,
      item_type: input.itemType,
      title: input.title,
      reference: input.reference,
      question_body: input.questionBody,
      response_body: input.responseBody || null,
      status: input.status,
      updated_at: now,
    }
  );
}

export async function deleteReviewItem(
  db: D1Database,
  id: string,
): Promise<ReviewItemRow | null> {
  const existing = await getReviewRowById(db, id);

  if (!existing) {
    return null;
  }

  await db.prepare("UPDATE review_items SET deleted_at = ? WHERE id = ?").bind(new Date().toISOString(), id).run();

  return existing;
}
