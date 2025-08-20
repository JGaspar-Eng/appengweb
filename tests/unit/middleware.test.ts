import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../../middleware";

describe("middleware", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  test("rotas públicas não disparam verificação de sessão", async () => {
    const request = new NextRequest("http://localhost/");

    const response = await middleware(request);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  test("rotas protegidas sem token redirecionam para login", async () => {
    const request = new NextRequest("http://localhost/dashboard");

    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
  });
});
