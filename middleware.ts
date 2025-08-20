// middleware.ts
import { NextRequest, NextResponse } from "next/server";

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith("/login");
  const isPublic = pathname === "/" || isLogin;

codex/refactor-session-api-call-in-middleware
  if (isPublic) {
    return NextResponse.next();
  } else {
    // Verifica se existe token de autenticação
    const authToken = request.cookies.get("auth_token")?.value;
    if (!authToken) {
      return redirectToLogin(request);
    }
=======
  if (isPublic) return NextResponse.next();

  const authToken = request.cookies.get("auth_token")?.value;
  if (!authToken) {
    return redirectToLogin(request);
  }
main

    try {
      const sessionResponse = await fetch(
        `${request.nextUrl.origin}/api/auth/session`,
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

codex/refactor-session-api-call-in-middleware
    return NextResponse.next();
    const session = await sessionResponse.json();
    if (!session.authenticated) {
      return redirectToLogin(request);
    }
  } catch {
    return redirectToLogin(request);
    main
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/calculadoras/:path*"],
};
