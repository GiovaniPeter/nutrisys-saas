import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalChatClient } from "@/components/portal/portal-chat-client";
import { PortalFoodDiaryClient } from "@/components/portal/portal-food-diary-client";
import { PortalHydrationGoalsClient } from "@/components/portal/portal-hydration-goals-client";
import { PortalLogoutButton } from "@/components/portal/portal-logout-button";
import { getCurrentPortalPatient } from "@/lib/patient-session";
import { prisma } from "@/lib/prisma";

export default async function PortalPage() {
  const patient = await getCurrentPortalPatient();

  if (!patient) {
    redirect("/portal/login");
  }

  const mealPlans = await prisma.mealPlan.findMany({
    where: {
      patientId: patient.id,
      organizationId: patient.organizationId,
      publishedAt: { not: null }
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      meals: {
        orderBy: { position: "asc" },
        include: { items: true }
      }
    }
  });

  const appointments = await prisma.appointment.findMany({
    where: {
      patientId: patient.id,
      startsAt: { gte: new Date() },
      status: { in: ["PENDING", "CONFIRMED"] }
    },
    orderBy: { startsAt: "asc" },
    take: 5
  });

  const bodyRecords = await prisma.bodyRecord.findMany({
    where: { patientId: patient.id },
    orderBy: { date: "desc" },
    take: 5
  });

  const latestPlan = mealPlans[0];
  const latestRecord = bodyRecords[0];

  return (
    <main className="shell workspace-shell portal-shell">
      <header className="app-header">
        <Link href="/portal" className="brand app-brand">
          <span className="brand-mark">N</span>
          <span>{patient.organization.name}</span>
        </Link>
        <nav className="app-nav" aria-label="Navegacao do portal">
          <Link className="nav-link active" href="/portal">
            Meu portal
          </Link>
        </nav>
        <PortalLogoutButton />
      </header>

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">Ola, {patient.name}</span>
          <h1>Portal do paciente</h1>
          <p>Seu plano alimentar, agenda e evolucao reunidos em um so lugar.</p>
        </div>
      </section>

      <section className="dashboard-metrics">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span>Planos</span>
            <div className="dashboard-card-icon">🥑</div>
          </div>
          <strong>{mealPlans.length}</strong>
          <small>publicados</small>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span>Consultas</span>
            <div className="dashboard-card-icon">📅</div>
          </div>
          <strong>{appointments.length}</strong>
          <small>proximas</small>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span>Evolucao</span>
            <div className="dashboard-card-icon">📈</div>
          </div>
          <strong>{bodyRecords.length}</strong>
          <small>registros</small>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <span>Objetivo</span>
            <div className="dashboard-card-icon">🎯</div>
          </div>
          <strong>{patient.goal ? "OK" : "--"}</strong>
          <small>{patient.goal || "a definir"}</small>
        </div>
      </section>

      <section className="portal-grid">
        <div className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Nutricao</span>
              <h2>Plano alimentar</h2>
            </div>
            {latestPlan?.targetCalories ? <span className="status-pill ok">{latestPlan.targetCalories} kcal</span> : null}
          </div>

          {latestPlan ? (
            <div className="portal-meals">
              <h3>{latestPlan.name}</h3>
              {latestPlan.observations ? <p>{latestPlan.observations}</p> : null}
              {latestPlan.meals.map((meal) => (
                <article key={meal.id} className="portal-meal-card">
                  <div>
                    <strong>{meal.label}</strong>
                    <span>{meal.time || "Horario livre"}</span>
                  </div>
                  <ul>
                    {meal.items.map((item) => (
                      <li key={item.id}>
                        <span>{item.foodName}</span>
                        <strong>
                          {Number(item.quantity).toLocaleString("pt-BR")}x {item.portion}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-card">Nenhum plano publicado ainda.</p>
          )}
        </div>

        <div className="portal-side">
          <div className="surface">
            <span className="eyebrow">Diario alimentar</span>
            <h2>Enviar refeicao</h2>
            <PortalFoodDiaryClient />
          </div>

          <div className="surface">
            <span className="eyebrow">Hidratacao e metas</span>
            <h2>Progresso de hoje</h2>
            <PortalHydrationGoalsClient targetMl={patient.goal ? 2000 : 2000} />
          </div>

          <div className="surface">
            <span className="eyebrow">Chat</span>
            <h2>Fale com a nutricionista</h2>
            <PortalChatClient />
          </div>

          <div className="surface">
            <span className="eyebrow">Agenda</span>
            <h2>Proximas consultas</h2>
            <div className="compact-list">
              {appointments.map((appointment) => (
                <article key={appointment.id}>
                  <strong>{appointment.type}</strong>
                  <span>
                    {formatDateTime(appointment.startsAt)} · {formatStatus(appointment.status)}
                  </span>
                </article>
              ))}
              {appointments.length === 0 ? <p className="empty-card">Nenhuma consulta futura.</p> : null}
            </div>
          </div>

          <div className="surface">
            <span className="eyebrow">Evolucao</span>
            <h2>Ultimas medidas</h2>
            {latestRecord ? (
              <div className="portal-record">
                <strong>{formatDate(latestRecord.date)}</strong>
                <span>Peso: {valueOrDash(latestRecord.weightKg)} kg</span>
                <span>Cintura: {valueOrDash(latestRecord.waistCm)} cm</span>
                <span>Gordura: {valueOrDash(latestRecord.bodyFatPct)}%</span>
              </div>
            ) : (
              <p className="empty-card">Nenhum registro de evolucao.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(value);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(value);
}

function formatStatus(value: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmada",
    COMPLETED: "Realizada",
    CANCELED: "Cancelada",
    NO_SHOW: "Faltou"
  };

  return labels[value] || value;
}

function valueOrDash(value: unknown) {
  return value === null || value === undefined ? "--" : Number(value).toLocaleString("pt-BR");
}
