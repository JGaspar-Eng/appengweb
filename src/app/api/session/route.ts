import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const jar = cookies();
  const session = jar.get("session")?.value;
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  return NextResponse.json({ authenticated: true, email: decodeURIComponent(session) }, { status: 200 });
}
