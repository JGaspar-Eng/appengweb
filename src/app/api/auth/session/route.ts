import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import tokenStore from "@/lib/authStore";

export async function GET() {
  const jar = cookies();
  const token = jar.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  const email = tokenStore.get(token);
  if (!email) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  return NextResponse.json({ authenticated: true, email }, { status: 200 });
}
