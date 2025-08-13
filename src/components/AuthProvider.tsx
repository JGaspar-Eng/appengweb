"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

function setUserCookie(email: string | null) {
  if (typeof window === "undefined") return;
  const isHttps = window.location.protocol === "https:";
  const baseAttrs = `path=/; SameSite=Strict${isHttps ? "; Secure" : ""}`;

  if (email) {
    document.cookie = `user=${encodeURIComponent(email)}; max-age=43200; ${baseAttrs}`;
  } else {
    document.cookie = `user=; max-age=0; ${baseAttrs}`;
  }
}

function getUserCookie(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)user=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

interface AuthContextType {
  user: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se estiver na tela inicial (login), limpa cookie e usuário
    if (pathname === "/") {
      setUserCookie(null);
      setUser(null);
      return;
    }

    const savedUser = getUserCookie();
    if (savedUser) setUser(savedUser);
  }, [pathname]);

  async function login(email: string, senha: string) {
    if (
      email === process.env.NEXT_PUBLIC_LOGIN_EMAIL &&
      senha === process.env.NEXT_PUBLIC_LOGIN_SENHA
    ) {
      setUser(email);
      setUserCookie(email);
      router.push("/dashboard");
    } else {
      throw new Error("E-mail ou senha inválidos.");
    }
  }

  function logout() {
    setUser(null);
    setUserCookie(null);
    router.push("/");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}
