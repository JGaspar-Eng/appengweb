"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkSession() {
      if (pathname === "/") {
        setUser(null);
        return;
      }
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.authenticated ? data.email : null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }
    checkSession();
  }, [pathname]);

  async function login(email: string, senha: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    if (!res.ok) {
      throw new Error("E-mail ou senha inválidos.");
    }
    const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
    if (sessionRes.ok) {
      const data = await sessionRes.json();
      if (data.authenticated) {
        setUser(data.email);
        router.push("/dashboard");
        return;
      }
    }
    throw new Error("Erro ao efetuar login.");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
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
