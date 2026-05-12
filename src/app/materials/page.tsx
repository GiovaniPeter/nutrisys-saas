import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { MaterialsClient } from "@/components/materials/materials-client";
import { getCurrentUser } from "@/lib/session";

export default async function MaterialsPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <main className="shell workspace-shell">
      <AppNav active="materials" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Educacao nutricional</span>
          <h1>Materiais educativos</h1>
          <p>Organize materiais, abra modelos no Canva e compartilhe conteudos com pacientes.</p>
        </div>
      </section>

      <MaterialsClient />
    </main>
  );
}
