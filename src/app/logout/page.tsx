"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    (async () => {
      await logout();
    })();
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Saindo...</p>
    </div>
  );
}
