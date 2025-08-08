"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

// Função utilitária para setar/remover cookies
function setUserCookie(email: string | null) {
  if (typeof window === "undefined") return;
  if (email) {
    // Set cookie por 12h (ajuste se quiser mais/menos tempo)
    document.cookie = `user=${email}; path=/; max-age=43200; SameSite=Lax`;
  } else {
    // Remove o cookie
    document.cookie = "user=; path=/; max-age=0; SameSite=Lax";
  }
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

  async function login(email: string, senha: string) {
    // Simulação: aceite só um usuário fixo (exemplo)
    if (email === "joanez.gaspar@gmail.com" && senha === "teste") {
      setUser(email);
      setUserCookie(email); // seta cookie!
      router.push("/dashboard");
    } else {
      throw new Error("E-mail ou senha inválidos.");
    }
  }

  function logout() {
    setUser(null);
    setUserCookie(null); // remove cookie!
    router.push("/login");
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
