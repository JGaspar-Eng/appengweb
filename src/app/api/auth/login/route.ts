import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import tokenStore from "@/lib/authStore";

const EMAIL = process.env.LOGIN_EMAIL; // NÃO usar NEXT_PUBLIC_ aqui
const SENHA = process.env.LOGIN_SENHA;

export async function POST(req: NextRequest) {
  try {
    if (!EMAIL || !SENHA) {
      return NextResponse.json(
        { success: false, message: "LOGIN_EMAIL/LOGIN_SENHA não configurados." },
        { status: 500 }
      );
    }

    const { email, senha } = await req.json();

    if (email === EMAIL && senha === SENHA) {
      const token = randomBytes(32).toString("hex");
      tokenStore.set(token, email);
      const res = NextResponse.json({ success: true }, { status: 200 });
      res.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // usa cookie secure apenas em produção (HTTPS)
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60, // 1h
      });
      return res;
    }

    return NextResponse.json(
      { success: false, message: "Credenciais inválidas." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ success: false, message: "Erro no servidor." }, { status: 500 });
  }
}
