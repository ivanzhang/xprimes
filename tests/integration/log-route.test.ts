import type { ActivityLogRow, LogRow } from "@/lib/db/schema";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface FakeDbState {
  logs: LogRow[];
  activityLogs: ActivityLogRow[];
}

type FakeDb = D1Database & { state: FakeDbState };

const { requireCloudflareRuntimeContextMock } = vi.hoisted(() => ({
  requireCloudflareRuntimeContextMock: vi.fn(),
}));

vi.mock("@/lib/cloudflare/context", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cloudflare/context")>(
    "@/lib/cloudflare/context",
  );

  return {
    ...actual,
    requireCloudflareRuntimeContext: requireCloudflareRuntimeContextMock,
  };
});

import { DELETE, PATCH } from "@/app/api/admin/logs/[id]/route";
import { POST } from "@/app/api/admin/logs/route";

function createFakeD1Database(initialState?: Partial<FakeDbState>): FakeDb {
  const state: FakeDbState = {
    logs: initialState?.logs ? [...initialState.logs] : [],
    activityLogs: initialState?.activityLogs ? [...initialState.activityLogs] : [],
  };

  class FakePreparedStatement implements D1PreparedStatement {
    private values: unknown[] = [];

    constructor(private readonly query: string) {}

    bind(...values: unknown[]) {
      this.values = values;
      return this;
    }

    async first<T = Record<string, unknown>>() {
      const result = await this.resolveRecord();
      return (result as T | null) ?? null;
    }

    async run<T = Record<string, unknown>>() {
      await this.executeMutation();

      return {
        success: true,
        meta: { changed_db: true },
        results: [],
      } as D1Result<T>;
    }

    async all<T = Record<string, unknown>>() {
      const results = await this.resolveRecords();

      return {
        success: true,
        meta: { changed_db: false },
        results: results as T[],
      } as D1Result<T>;
    }

    async raw<T = unknown[]>() {
      return [] as T[];
    }

    private normalizedQuery() {
      return this.query.replace(/\s+/g, " ").trim().toLowerCase();
    }

    private async resolveRecord() {
      const query = this.normalizedQuery();

      if (query.startsWith("select id, title, content, excerpt_en, published_at, is_pinned, author_email, created_at, updated_at from logs where id = ?")) {
        const [id] = this.values;
        return state.logs.find((log) => log.id === id) ?? null;
      }

      return null;
    }

    private async resolveRecords() {
      const query = this.normalizedQuery();

      if (query.startsWith("select id, title, content, excerpt_en, published_at, is_pinned, author_email, created_at, updated_at from logs order by")) {
        return [...state.logs].sort((left, right) => {
          if (left.is_pinned !== right.is_pinned) {
            return right.is_pinned - left.is_pinned;
          }

          return right.published_at.localeCompare(left.published_at);
        });
      }

      return [];
    }

    private async executeMutation() {
      const query = this.normalizedQuery();

      if (query.startsWith("insert into logs")) {
        const [
          id,
          title,
          content,
          excerptEn,
          publishedAt,
          isPinned,
          authorEmail,
          createdAt,
          updatedAt,
        ] = this.values;

        state.logs.push({
          id: String(id),
          title: String(title),
          content: String(content),
          excerpt_en: excerptEn ? String(excerptEn) : null,
          published_at: String(publishedAt),
          is_pinned: Number(isPinned) as 0 | 1,
          author_email: String(authorEmail),
          created_at: String(createdAt),
          updated_at: String(updatedAt),
        });
        return;
      }

      if (query.startsWith("update logs set")) {
        const [title, content, excerptEn, publishedAt, isPinned, updatedAt, id] = this.values;
        const current = state.logs.find((log) => log.id === id);

        if (!current) {
          return;
        }

        current.title = String(title);
        current.content = String(content);
        current.excerpt_en = excerptEn ? String(excerptEn) : null;
        current.published_at = String(publishedAt);
        current.is_pinned = Number(isPinned) as 0 | 1;
        current.updated_at = String(updatedAt);
        return;
      }

      if (query.startsWith("delete from logs where id = ?")) {
        const [id] = this.values;
        state.logs = state.logs.filter((log) => log.id !== id);
        return;
      }

      if (query.startsWith("insert into activity_logs")) {
        const [id, entityType, entityId, action, operatorEmail, payloadSnapshot, createdAt] = this.values;

        state.activityLogs.push({
          id: String(id),
          entity_type: String(entityType),
          entity_id: String(entityId),
          action: String(action),
          operator_email: String(operatorEmail),
          payload_snapshot: String(payloadSnapshot),
          created_at: String(createdAt),
        });
      }
    }
  }

  return {
    state,
    prepare(query: string) {
      return new FakePreparedStatement(query);
    },
    batch() {
      return Promise.resolve([]);
    },
    exec() {
      return Promise.resolve({ count: 0, duration: 0 });
    },
    dump() {
      return Promise.resolve(new ArrayBuffer(0));
    },
    withSession() {
      throw new Error("not implemented");
    },
  } as FakeDb;
}

describe("admin log routes", () => {
  beforeEach(() => {
    requireCloudflareRuntimeContextMock.mockReset();
  });

  it("允许白名单用户发布日志并写入审计记录", async () => {
    const db = createFakeD1Database();
    requireCloudflareRuntimeContextMock.mockResolvedValue({ db });

    const request = new Request("https://xprimes.cn/api/admin/logs", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cf-access-authenticated-user-email": "amy@xprimes.cn",
      },
      body: JSON.stringify({
        title: "首条日志",
        content: "今天开始发布官网动态。",
        publishedAt: "2026-04-12",
        isPinned: true,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.ok).toBe(true);
    expect(db.state.logs).toHaveLength(1);
    expect(db.state.logs[0]?.title).toBe("首条日志");
    expect(db.state.activityLogs).toHaveLength(1);
    expect(db.state.activityLogs[0]?.action).toBe("create");
  });

  it("拒绝未授权的日志发布请求", async () => {
    const db = createFakeD1Database();
    requireCloudflareRuntimeContextMock.mockResolvedValue({ db });

    const request = new Request("https://xprimes.cn/api/admin/logs", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: "未授权请求",
        content: "这条请求应该失败。",
        publishedAt: "2026-04-12",
        isPinned: false,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("UNAUTHORIZED_ADMIN");
  });

  it("在日志输入无效时返回 400", async () => {
    const db = createFakeD1Database();
    requireCloudflareRuntimeContextMock.mockResolvedValue({ db });

    const request = new Request("https://xprimes.cn/api/admin/logs", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cf-access-authenticated-user-email": "amy@xprimes.cn",
      },
      body: JSON.stringify({
        title: "",
        content: "",
        publishedAt: "2026/04/12",
        isPinned: false,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(db.state.logs).toHaveLength(0);
  });

  it("在缺少数据库绑定时返回受控错误", async () => {
    requireCloudflareRuntimeContextMock.mockResolvedValue({ db: null });

    const request = new Request("https://xprimes.cn/api/admin/logs", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cf-access-authenticated-user-email": "amy@xprimes.cn",
      },
      body: JSON.stringify({
        title: "数据库缺失",
        content: "这条请求应该被拒绝。",
        publishedAt: "2026-04-12",
        isPinned: false,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.error).toBe("CLOUDFLARE_DB_UNAVAILABLE");
  });

  it("允许管理员更新现有日志", async () => {
    const db = createFakeD1Database({
      logs: [
        {
          id: "log-1",
          title: "旧标题",
          content: "旧内容",
          excerpt_en: null,
          published_at: "2026-04-12",
          is_pinned: 0,
          author_email: "amy@xprimes.cn",
          created_at: "2026-04-12T00:00:00.000Z",
          updated_at: "2026-04-12T00:00:00.000Z",
        },
      ],
    });
    requireCloudflareRuntimeContextMock.mockResolvedValue({ db });

    const request = new Request("https://xprimes.cn/api/admin/logs/log-1", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "cf-access-authenticated-user-email": "amy@xprimes.cn",
      },
      body: JSON.stringify({
        title: "新标题",
        content: "新内容",
        excerptEn: "Updated excerpt.",
        publishedAt: "2026-04-13",
        isPinned: true,
      }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "log-1" }),
    });

    expect(response.status).toBe(200);
    expect(db.state.logs[0]?.title).toBe("新标题");
    expect(db.state.logs[0]?.is_pinned).toBe(1);
    expect(db.state.activityLogs.at(-1)?.action).toBe("update");
  });

  it("允许管理员删除日志", async () => {
    const db = createFakeD1Database({
      logs: [
        {
          id: "log-1",
          title: "待删除日志",
          content: "删除后不应保留。",
          excerpt_en: null,
          published_at: "2026-04-12",
          is_pinned: 0,
          author_email: "amy@xprimes.cn",
          created_at: "2026-04-12T00:00:00.000Z",
          updated_at: "2026-04-12T00:00:00.000Z",
        },
      ],
    });
    requireCloudflareRuntimeContextMock.mockResolvedValue({ db });

    const request = new Request("https://xprimes.cn/api/admin/logs/log-1", {
      method: "DELETE",
      headers: {
        "cf-access-authenticated-user-email": "amy@xprimes.cn",
      },
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "log-1" }),
    });

    expect(response.status).toBe(200);
    expect(db.state.logs).toHaveLength(0);
    expect(db.state.activityLogs.at(-1)?.action).toBe("delete");
  });
});
