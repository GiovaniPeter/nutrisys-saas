import Link from "next/link";
import { redirect } from "next/navigation";
import { AppointmentStatus, SubscriptionStatus } from "@prisma/client";
import { AppNav } from "@/components/app-nav";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isSecretary = user.role === "SECRETARY";
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [organization, commonData, professionalData] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: {
        name: true,
        slug: true,
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            planCode: true,
            status: true,
            trialEndsAt: true
          }
        }
      }
    }),
    loadCommonDashboardData(user.organizationId, now, nextWeek),
    isSecretary ? Promise.resolve(emptyProfessionalDashboardData()) : loadProfessionalDashboardData(user.organizationId)
  ]);

  const {
    patientCount,
    appointmentCount,
    confirmedAppointments,
    unreadChatCount,
    upcomingAppointments,
    latestPatients,
    latestChatMessages
  } = commonData;
  const {
    mealPlanCount,
    publishedMealPlans,
    bodyRecordCount,
    anamnesisCount,
    pendingDiaryCount,
    activeGoalCount,
    energyCalculationCount,
    materialCount,
    latestMealPlans,
    latestDiaryEntries,
    latestMaterials,
    auditLogs
  } = professionalData;

  const subscription = organization?.subscriptions[0] || null;

  return (
    <main className="shell workspace-shell">
      <AppNav active="dashboard" user={user} />

      <section className="workspace-heading">
        <div>
          <span className="eyebrow">{organization?.name || "Clinica"}</span>
          <h1>Dashboard</h1>
          <p>Resumo operacional da clinica, alimentado pelo Supabase em tempo real.</p>
        </div>
        <div className="subscription-badge">
          <span>{formatPlan(subscription?.planCode)}</span>
          <strong>{formatSubscriptionStatus(subscription?.status)}</strong>
        </div>
      </section>

      <section className="dashboard-metrics">
        {isSecretary ? (
          <>
            <MetricCard label="Pacientes" value={patientCount} href="/patients" detail="cadastro e contato" />
            <MetricCard label="Consultas" value={appointmentCount} href="/appointments" detail={`${confirmedAppointments} confirmadas na semana`} />
            <MetricCard label="Próximos" value={upcomingAppointments.length} href="/schedule" detail="na agenda" />
            <MetricCard label="Chat" value={unreadChatCount} href="/chat" detail="mensagens nao lidas" />
          </>
        ) : (
          <>
            <MetricCard label="Pacientes" value={patientCount} href="/patients" detail="base ativa" />
            <MetricCard label="Consultas" value={appointmentCount} href="/appointments" detail={`${confirmedAppointments} confirmadas na semana`} />
            <MetricCard label="Planos" value={mealPlanCount} href="/meal-plans" detail={`${publishedMealPlans} publicados`} />
            <MetricCard label="Evolucoes" value={bodyRecordCount} href="/body-records" detail={`${anamnesisCount} anamneses`} />
            <MetricCard label="Diario" value={pendingDiaryCount} href="/food-diary" detail="registros pendentes" />
            <MetricCard label="Chat" value={unreadChatCount} href="/chat" detail="mensagens nao lidas" />
            <MetricCard label="Metas" value={activeGoalCount} href="/hydration" detail="metas ativas" />
            <MetricCard label="Materiais" value={materialCount} href="/materials" detail={`${energyCalculationCount} calculos energeticos`} />
          </>
        )}
      </section>

      <section className="dashboard-grid">
        <div className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Proximos dias</span>
              <h2>Agenda</h2>
            </div>
            <Link className="text-button" href="/appointments">
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {upcomingAppointments.map((appointment) => (
              <article key={appointment.id}>
                <strong>{appointment.patient.name}</strong>
                <span>
                  {formatDateTime(appointment.startsAt)} · {appointment.type} · {formatAppointmentStatus(appointment.status)}
                </span>
              </article>
            ))}
            {upcomingAppointments.length === 0 ? <p className="empty-card">Nenhuma consulta futura.</p> : null}
          </div>
        </div>

        <div className={isSecretary ? "surface role-hidden" : "surface"}>
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Paciente</span>
              <h2>Diario alimentar</h2>
            </div>
            <Link className="text-button" href="/food-diary">
              Avaliar
            </Link>
          </div>
          <div className="compact-list">
            {latestDiaryEntries.map((entry) => (
              <article key={entry.id}>
                <strong>{entry.patient.name}</strong>
                <span>
                  {entry.mealType} · {formatDate(entry.entryDate)} · {formatDiaryStatus(entry.status)}
                </span>
              </article>
            ))}
            {latestDiaryEntries.length === 0 ? <p className="empty-card">Nenhum diario alimentar enviado.</p> : null}
          </div>
        </div>

        <div className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Relacionamento</span>
              <h2>Chat recente</h2>
            </div>
            <Link className="text-button" href="/chat">
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {latestChatMessages.map((message) => (
              <article key={message.id}>
                <strong>{message.patient.name}</strong>
                <span>
                  {message.sender === "PATIENT" ? "Paciente" : "Profissional"} · {formatDateTime(message.createdAt)} ·{" "}
                  {message.text.slice(0, 80)}
                </span>
              </article>
            ))}
            {latestChatMessages.length === 0 ? <p className="empty-card">Nenhuma mensagem recente.</p> : null}
          </div>
        </div>

        <div className={isSecretary ? "surface role-hidden" : "surface"}>
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Conteudo</span>
              <h2>Materiais educativos</h2>
            </div>
            <Link className="text-button" href="/materials">
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {latestMaterials.map((material) => (
              <article key={material.id}>
                <strong>{material.title}</strong>
                <span>
                  {material.category} · {formatDate(material.createdAt)}
                </span>
              </article>
            ))}
            {latestMaterials.length === 0 ? <p className="empty-card">Nenhum material cadastrado.</p> : null}
          </div>
        </div>

        <div className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Online</span>
              <h2>Agendamento publico</h2>
            </div>
            {organization?.slug ? (
              <Link className="text-button" href={`/book/${organization.slug}`} target="_blank">
                Abrir
              </Link>
            ) : null}
          </div>
          <div className="compact-list">
            <article>
              <strong>{organization?.slug ? `/book/${organization.slug}` : "Sem link disponivel"}</strong>
              <span>Compartilhe este link para pacientes solicitarem horarios disponiveis.</span>
            </article>
            <article>
              <strong>Fluxo sugerido</strong>
              <span>Paciente solicita horario, a consulta entra como pendente, e voce confirma pela agenda.</span>
            </article>
          </div>
        </div>

        <div className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Recentes</span>
              <h2>Pacientes</h2>
            </div>
            <Link className="text-button" href="/patients">
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {latestPatients.map((patient) => (
              <article key={patient.id}>
                <strong>{patient.name}</strong>
                <span>{patient.goal || "Objetivo nao informado"} · {formatDate(patient.createdAt)}</span>
              </article>
            ))}
            {latestPatients.length === 0 ? <p className="empty-card">Nenhum paciente cadastrado.</p> : null}
          </div>
        </div>

        <div className={isSecretary ? "surface role-hidden" : "surface"}>
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Nutricao</span>
              <h2>Planos recentes</h2>
            </div>
            <Link className="text-button" href="/meal-plans">
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {latestMealPlans.map((plan) => {
              const calories = plan.meals
                .flatMap((meal) => meal.items)
                .reduce((total, item) => total + Number(item.calories || 0), 0);

              return (
                <article key={plan.id}>
                  <strong>{plan.name}</strong>
                  <span>
                    {plan.patient.name} · {Math.round(calories)} kcal · {plan.publishedAt ? "Publicado" : "Rascunho"}
                  </span>
                </article>
              );
            })}
            {latestMealPlans.length === 0 ? <p className="empty-card">Nenhum plano criado.</p> : null}
          </div>
        </div>

        <div className={isSecretary ? "surface role-hidden" : "surface"}>
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Seguranca</span>
              <h2>Auditoria</h2>
            </div>
          </div>
          <div className="compact-list">
            {auditLogs.map((log) => (
              <article key={log.id}>
                <strong>{formatAuditAction(log.action)}</strong>
                <span>
                  {log.user?.name || "Sistema"} · {log.entity} · {formatDateTime(log.createdAt)}
                </span>
              </article>
            ))}
            {auditLogs.length === 0 ? <p className="empty-card">Nenhum evento auditado.</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

async function loadCommonDashboardData(organizationId: string, now: Date, nextWeek: Date) {
  const [
    patientCount,
    appointmentCount,
    confirmedAppointments,
    unreadChatCount,
    upcomingAppointments,
    latestPatients,
    latestChatMessages
  ] = await Promise.all([
    prisma.patient.count({ where: { organizationId } }),
    prisma.appointment.count({ where: { organizationId } }),
    prisma.appointment.count({
      where: {
        organizationId,
        status: AppointmentStatus.CONFIRMED,
        startsAt: {
          gte: now,
          lte: nextWeek
        }
      }
    }),
    prisma.chatMessage.count({
      where: {
        organizationId,
        sender: "PATIENT",
        readByProfessionalAt: null
      }
    }),
    prisma.appointment.findMany({
      where: {
        organizationId,
        startsAt: { gte: now }
      },
      orderBy: { startsAt: "asc" },
      take: 5,
      include: {
        patient: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    }),
    prisma.patient.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        goal: true,
        createdAt: true
      }
    }),
    prisma.chatMessage.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        patient: {
          select: { name: true }
        }
      }
    })
  ]);

  return {
    patientCount,
    appointmentCount,
    confirmedAppointments,
    unreadChatCount,
    upcomingAppointments,
    latestPatients,
    latestChatMessages
  };
}

async function loadProfessionalDashboardData(organizationId: string) {
  const [
    mealPlanCount,
    publishedMealPlans,
    bodyRecordCount,
    anamnesisCount,
    pendingDiaryCount,
    activeGoalCount,
    energyCalculationCount,
    materialCount,
    latestMealPlans,
    latestDiaryEntries,
    latestMaterials,
    auditLogs
  ] = await Promise.all([
    prisma.mealPlan.count({ where: { organizationId } }),
    prisma.mealPlan.count({
      where: {
        organizationId,
        publishedAt: { not: null }
      }
    }),
    prisma.bodyRecord.count({
      where: {
        patient: {
          organizationId
        }
      }
    }),
    prisma.anamnesis.count({
      where: {
        patient: {
          organizationId
        }
      }
    }),
    prisma.foodDiaryEntry.count({
      where: {
        organizationId,
        status: "PENDING"
      }
    }),
    prisma.patientGoal.count({
      where: {
        organizationId,
        completedAt: null
      }
    }),
    prisma.energyCalculation.count({
      where: { organizationId }
    }),
    prisma.educationalMaterial.count({
      where: { organizationId }
    }),
    prisma.mealPlan.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        patient: {
          select: { name: true }
        },
        meals: {
          include: {
            items: true
          }
        }
      }
    }),
    prisma.foodDiaryEntry.findMany({
      where: { organizationId },
      orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
      take: 5,
      include: {
        patient: {
          select: { name: true }
        }
      }
    }),
    prisma.educationalMaterial.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: {
          select: { name: true }
        }
      }
    })
  ]);

  return {
    mealPlanCount,
    publishedMealPlans,
    bodyRecordCount,
    anamnesisCount,
    pendingDiaryCount,
    activeGoalCount,
    energyCalculationCount,
    materialCount,
    latestMealPlans,
    latestDiaryEntries,
    latestMaterials,
    auditLogs
  };
}

type ProfessionalDashboardData = Awaited<ReturnType<typeof loadProfessionalDashboardData>>;

function emptyProfessionalDashboardData(): ProfessionalDashboardData {
  return {
    mealPlanCount: 0,
    publishedMealPlans: 0,
    bodyRecordCount: 0,
    anamnesisCount: 0,
    pendingDiaryCount: 0,
    activeGoalCount: 0,
    energyCalculationCount: 0,
    materialCount: 0,
    latestMealPlans: [],
    latestDiaryEntries: [],
    latestMaterials: [],
    auditLogs: []
  };
}

function MetricCard({ label, value, detail, href }: { label: string; value: number; detail: string; href: string }) {
  return (
    <Link href={href} className="dashboard-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </Link>
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

function formatPlan(value: string | undefined) {
  const labels: Record<string, string> = {
    essential: "Essencial",
    professional: "Profissional",
    clinic: "Clinica"
  };

  return value ? labels[value] || value : "Sem plano";
}

function formatSubscriptionStatus(value: SubscriptionStatus | undefined) {
  const labels: Record<SubscriptionStatus, string> = {
    TRIALING: "Trial",
    ACTIVE: "Ativa",
    PAST_DUE: "Pagamento pendente",
    CANCELED: "Cancelada",
    EXPIRED: "Expirada"
  };

  return value ? labels[value] : "Indefinida";
}

function formatAppointmentStatus(value: AppointmentStatus) {
  const labels: Record<AppointmentStatus, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmada",
    COMPLETED: "Concluida",
    CANCELED: "Cancelada",
    NO_SHOW: "Faltou"
  };

  return labels[value];
}

function formatDiaryStatus(value: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    NEEDS_ADJUSTMENT: "Ajustar"
  };

  return labels[value] || value;
}

function formatAuditAction(value: string) {
  return value.replaceAll("_", " ").replaceAll(".", " ");
}
