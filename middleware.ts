// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith("/login");
  const isPublic = pathname === "/" || isLogin;

  // Permite acesso às páginas públicas
  if (isPublic) return NextResponse.next();

  // Verifica se existe token de autenticação
  const authToken = request.cookies.get("auth_token")?.value;
  if (!authToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  try {
    const sessionResponse = await fetch(
      `${request.nextUrl.origin}/api/auth/session`,
      {
        headers: {
          cookie: `auth_token=${authToken}`,
        },
      }
    );

    if (!sessionResponse.ok) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    const session = await sessionResponse.json();
    const isAuthenticated = session?.user || session?.authenticated;
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/calculadoras/:path*", "/dashboard", "/calculadoras"],
};
