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

  async function checkSession() : Promise<boolean> {
    try {
      const res = await fetch("/api/session");
      if (!res.ok) {
        setUser(null);
        return false;
      }
      const data = await res.json();
      if (data.authenticated) {
        setUser(data.email);
        return true;
      }
      setUser(null);
      return false;
    } catch {
      setUser(null);
      return false;
    }
  }

  useEffect(() => {
    (async () => {
      const authenticated = await checkSession();
      if (authenticated && pathname === "/") router.push("/dashboard");
      if (!authenticated && pathname !== "/") router.push("/");
    })();
  }, [pathname]);

  async function login(email: string, senha: string) {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: email, senha }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.message || "E-mail ou senha inválidos.");
    }
    await checkSession();
    router.push("/dashboard");
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    await checkSession();
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
