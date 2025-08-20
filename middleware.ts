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

  if (isPublic) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get("auth_token")?.value;
  console.log("auth_token recebido:", authToken);
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
          credentials: "include",
        }
      );

    console.log("status /api/auth/session:", sessionResponse.status);
    const sessionPayload = await sessionResponse.clone().json();
    console.log("payload /api/auth/session:", sessionPayload);

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
