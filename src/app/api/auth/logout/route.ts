import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import tokenStore from "@/lib/authStore";
import { setAuthCookie } from "@/lib/cookieUtils";

export async function POST() {
  const jar = cookies();
  const token = jar.get("auth_token")?.value;
  if (token) {
    tokenStore.delete(token);
  }
  setAuthCookie("", 0);
  return NextResponse.json({ success: true }, { status: 200 });
}
