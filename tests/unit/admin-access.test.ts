import {
  ADMIN_ALLOWLIST,
  getAuthenticatedEmail,
  getAdminFromRequest,
  requireAdmin,
} from "@/lib/auth/admin-access";

describe("admin-access", () => {
  it("只允许固定白名单邮箱", () => {
    expect(ADMIN_ALLOWLIST).toEqual(["amy@xprimes.cn", "yiyi@xprimes.cn"]);
  });

  it("可从 Cloudflare Access 请求头提取邮箱并标准化大小写", () => {
    const request = new Request("https://xprimes.cn/admin", {
      headers: {
        "cf-access-authenticated-user-email": "  AMY@XPRIMES.CN ",
      },
    });

    expect(getAuthenticatedEmail(request)).toBe("amy@xprimes.cn");
  });

  it("白名单管理员可识别为 admin 身份", () => {
    const request = new Request("https://xprimes.cn/admin", {
      headers: {
        "cf-access-authenticated-user-email": "yiyi@xprimes.cn",
      },
    });

    expect(getAdminFromRequest(request)).toEqual({ email: "yiyi@xprimes.cn" });
  });

  it("非白名单返回 null", () => {
    const request = new Request("https://xprimes.cn/admin", {
      headers: {
        "cf-access-authenticated-user-email": "guest@xprimes.cn",
      },
    });

    expect(getAdminFromRequest(request)).toBeNull();
  });

  it("严格方法在未命中白名单时抛错", () => {
    const request = new Request("https://xprimes.cn/admin", {
      headers: {
        "cf-access-authenticated-user-email": "guest@xprimes.cn",
      },
    });

    expect(() => requireAdmin(request)).toThrowError("UNAUTHORIZED_ADMIN");
  });

  it("缺少请求头时按未认证处理", () => {
    const request = new Request("https://xprimes.cn/admin");

    expect(getAuthenticatedEmail(request)).toBeNull();
    expect(getAdminFromRequest(request)).toBeNull();
  });
});
