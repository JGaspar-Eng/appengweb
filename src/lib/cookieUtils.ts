import { cookies } from "next/headers";

export async function setAuthCookie(value: string, maxAge = 60 * 60) {
  const jar = await cookies();
  jar.set("auth_token", value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
}
