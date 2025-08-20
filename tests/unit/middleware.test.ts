import { describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../../middleware";

describe("middleware", () => {
  test("rotas públicas não disparam verificação de sessão", async () => {
    const request = new NextRequest("http://localhost/");
    const fetchSpy = vi.spyOn(global, "fetch");

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
