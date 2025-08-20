import { cookies } from "next/headers";

export function setAuthCookie(value: string, maxAge = 60 * 60) {
  cookies().set("auth_token", value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
}
