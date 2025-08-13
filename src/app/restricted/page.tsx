import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RestrictedPage() {
  const jar = cookies();
  const session = jar.get("session")?.value;
  if (!session) redirect("/login");

  // Conteúdo restrito
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Área restrita</h1>
      <p className="mt-2 opacity-80">Acesso autorizado.</p>
    </main>
  );
}
