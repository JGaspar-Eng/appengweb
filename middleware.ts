// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith("/login");
  const isPublic = pathname === "/" || isLogin;

  // Cookie user para autenticação
  const userCookie = request.cookies.get("user")?.value;

  // Permite acesso às páginas públicas
  if (isPublic) return NextResponse.next();

  // Rotas protegidas (exemplo)
  if (!userCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/calculadoras/:path*", "/dashboard", "/calculadoras"],
};
