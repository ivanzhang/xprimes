import { beforeEach, describe, expect, it, vi } from "vitest";

interface FakeR2ObjectRecord {
  key: string;
  blob: Blob;
  options?: R2PutOptions;
}

type FakeR2Bucket = R2Bucket & {
  objects: Map<string, FakeR2ObjectRecord>;
};

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

import { POST } from "@/app/api/admin/papers/upload/route";

function createFakeR2Bucket(): FakeR2Bucket {
  const objects = new Map<string, FakeR2ObjectRecord>();

  return {
    objects,
    async head(key: string) {
      const record = objects.get(key);
      if (!record) {
        return null;
      }

      return {
        key,
        size: record.blob.size,
        uploaded: new Date(),
        etag: "etag",
        httpEtag: "etag",
        version: "v1",
        checksums: {},
        storageClass: "Standard",
        writeHttpMetadata() {},
      } as R2Object;
    },
    async get() {
      return null;
    },
    async put(key: string, value: Blob | ArrayBuffer | string | null, options?: R2PutOptions) {
      const blob = value instanceof Blob ? value : new Blob([value ?? ""]);
      objects.set(key, {
        key,
        blob,
        options,
      });

      return {
        key,
        size: blob.size,
        uploaded: new Date(),
        etag: "etag",
        httpEtag: "etag",
        version: "v1",
        checksums: {},
        storageClass: "Standard",
        writeHttpMetadata() {},
      } as R2Object;
    },
    async createMultipartUpload() {
      throw new Error("not implemented");
    },
    resumeMultipartUpload() {
      throw new Error("not implemented");
    },
    async delete(keys: string | string[]) {
      const allKeys = Array.isArray(keys) ? keys : [keys];
      for (const key of allKeys) {
        objects.delete(key);
      }
    },
    async list() {
      return {
        objects: [],
        truncated: false,
        delimitedPrefixes: [],
      } as R2Objects;
    },
  } as FakeR2Bucket;
}

describe("POST /api/admin/papers/upload", () => {
  beforeEach(() => {
    requireCloudflareRuntimeContextMock.mockReset();
  });

  it("接受合法 pdf 上传", async () => {
    const r2 = createFakeR2Bucket();
    requireCloudflareRuntimeContextMock.mockResolvedValue({ db: null, r2 });

    const formData = new FormData();
    formData.set("file", new File(["%PDF-1.4"], "paper.pdf", { type: "application/pdf" }));

    const request = new Request("https://xprimes.cn/api/admin/papers/upload", {
      method: "POST",
      headers: {
        "cf-access-authenticated-user-email": "amy@xprimes.cn",
      },
      body: formData,
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.ok).toBe(true);
    expect(json.file.filename).toBe("paper.pdf");
    expect(json.file.key).toContain("papers/");
    expect(r2.objects.size).toBe(1);
  });

  it("拒绝非 pdf 上传", async () => {
    const r2 = createFakeR2Bucket();
    requireCloudflareRuntimeContextMock.mockResolvedValue({ db: null, r2 });

    const formData = new FormData();
    formData.set("file", new File(["png"], "paper.png", { type: "image/png" }));

    const request = new Request("https://xprimes.cn/api/admin/papers/upload", {
      method: "POST",
      headers: {
        "cf-access-authenticated-user-email": "amy@xprimes.cn",
      },
      body: formData,
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("INVALID_PDF_UPLOAD");
  });

  it("在缺少 R2 绑定时返回受控错误", async () => {
    requireCloudflareRuntimeContextMock.mockResolvedValue({ db: null, r2: null });

    const formData = new FormData();
    formData.set("file", new File(["%PDF-1.4"], "paper.pdf", { type: "application/pdf" }));

    const request = new Request("https://xprimes.cn/api/admin/papers/upload", {
      method: "POST",
      headers: {
        "cf-access-authenticated-user-email": "amy@xprimes.cn",
      },
      body: formData,
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.error).toBe("CLOUDFLARE_R2_UNAVAILABLE");
  });
});
