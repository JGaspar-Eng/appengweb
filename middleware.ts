// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith("/login");
  const isPublic = pathname === "/" || isLogin;

  // Permite acesso às páginas públicas
  if (isPublic) return NextResponse.next();

  // Verifica se existe token de autenticação
  const authToken = request.cookies.get(AUTH_COOKIE)?.value;
  if (!authToken) {
    return redirectToLogin(request);
  }

  try {
    const sessionResponse = await fetch(
      `${request.nextUrl.origin}/api/session`,
      {
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
        cache: "no-store",
      }
    );

    if (!sessionResponse.ok) {
      return redirectToLogin(request);
    }

    const session = await sessionResponse.json();
    const isAuthenticated = session?.user || session?.authenticated;
    if (!isAuthenticated) {
      return redirectToLogin(request);
    }
  } catch {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/calculadoras/:path*"],
};
