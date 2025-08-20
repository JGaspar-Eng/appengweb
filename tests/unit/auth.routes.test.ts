import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/cookieUtils", () => ({
  setAuthCookie: vi.fn((value: string, maxAge = 60 * 60) => {
    // default implementation preserves signature
  }),
}));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

import tokenStore from "@/lib/authStore";
import { setAuthCookie } from "@/lib/cookieUtils";
import { cookies } from "next/headers";

const mockedSetAuthCookie = vi.mocked(setAuthCookie);
const mockedCookies = vi.mocked(cookies);

describe("auth routes", () => {
  beforeEach(() => {
    tokenStore.clear();
    mockedSetAuthCookie.mockReset();
    mockedCookies.mockReset();
  });

  test("login sets auth cookie and stores token", async () => {
    process.env.LOGIN_EMAIL = "user@example.com";
    process.env.LOGIN_SENHA = "secret";
    const { POST: login } = await import("@/app/api/auth/login/route");
    const req = { json: async () => ({ email: "user@example.com", senha: "secret" }) } as any;
    const res = await login(req);
    expect(res.status).toBe(200);
    const token = Array.from(tokenStore.keys())[0];
    expect(tokenStore.get(token)).toBe("user@example.com");
    expect(mockedSetAuthCookie).toHaveBeenCalledWith(token);
  });

  test("logout clears auth cookie and token", async () => {
    const token = "abc123";
    tokenStore.set(token, "user@example.com");
    mockedCookies.mockReturnValue({ get: () => ({ value: token }) } as any);
    const { POST: logout } = await import("@/app/api/auth/logout/route");
    const res = await logout();
    expect(res.status).toBe(200);
    expect(tokenStore.size).toBe(0);
    expect(mockedSetAuthCookie).toHaveBeenCalledWith("", 0);
  });
});
