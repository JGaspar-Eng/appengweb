import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import tokenStore from "@/lib/authStore";

export async function POST() {
  const jar = cookies();
  const token = jar.get("auth_token")?.value;
  if (token) {
    tokenStore.delete(token);
  }
  const res = NextResponse.json({ success: true }, { status: 200 });
  res.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}
