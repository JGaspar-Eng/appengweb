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

  if (isPublic) return NextResponse.next();

  const authToken = request.cookies.get("auth_token")?.value;
  if (!authToken) {
    return redirectToLogin(request);
  }

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
    if (!session.authenticated) {
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
