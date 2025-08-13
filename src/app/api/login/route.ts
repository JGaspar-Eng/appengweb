import { NextRequest, NextResponse } from "next/server";

const EMAIL = process.env.LOGIN_EMAIL;         // NÃO usar NEXT_PUBLIC_ aqui
const SENHA = process.env.LOGIN_SENHA;

export async function POST(req: NextRequest) {
  try {
    if (!EMAIL || !SENHA) {
      return NextResponse.json(
        { success: false, message: "LOGIN_EMAIL/LOGIN_SENHA não configurados." },
        { status: 500 }
      );
    }

    const { usuario, senha } = await req.json();

    if (usuario === EMAIL && senha === SENHA) {
      const res = NextResponse.json({ success: true }, { status: 200 });
      // Cookie HttpOnly contendo o email (para leitura server-side)
      res.cookies.set("session", encodeURIComponent(usuario), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
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
