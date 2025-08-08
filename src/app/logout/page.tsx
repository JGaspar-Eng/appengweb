'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    document.cookie = "user=; path=/; max-age=0";
    router.push("/login");
  }, [router]);

  return null;
}
