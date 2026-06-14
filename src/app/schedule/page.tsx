import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { ScheduleClient } from "@/components/schedule/schedule-client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function SchedulePage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: {
      name: true,
      slug: true
    }
  });

  return (
    <main className="shell workspace-shell">
      <AppNav active="schedule" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Agenda inteligente</span>
          <h1>Calendário e agendamento online</h1>
          <p>Visualize sua rotina por mês ou semana e compartilhe um link público para novos agendamentos.</p>
        </div>
      </section>

      <ScheduleClient organizationName={organization?.name || "NutreClin"} organizationSlug={organization?.slug || ""} />
    </main>
  );
}
