import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    patientId: string;
  };
};

export default async function PatientRecordPage({ params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const patient = await prisma.patient.findFirst({
    where: {
      id: params.patientId,
      organizationId: user.organizationId
    },
    include: {
      appointments: {
        orderBy: { startsAt: "desc" },
        take: 8,
        include: {
          professional: {
            select: { name: true }
          }
        }
      },
      mealPlans: {
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          meals: {
            include: { items: true }
          }
        }
      },
      bodyRecords: {
        orderBy: { date: "desc" },
        take: 8
      },
      anamneses: {
        orderBy: { createdAt: "desc" },
        take: 4
      },
      recalls: {
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          meals: {
            include: { items: true }
          }
        }
      },
      labExams: {
        orderBy: { examDate: "desc" },
        take: 4,
        include: {
          results: {
            orderBy: [{ category: "asc" }, { name: "asc" }]
          }
        }
      },
      supplementPrescriptions: {
        orderBy: { prescribedAt: "desc" },
        take: 4,
        include: {
          items: {
            orderBy: { position: "asc" }
          }
        }
      },
      foodDiaryEntries: {
        orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
        take: 6
      },
      hydrationLogs: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 8
      },
      goals: {
        orderBy: { createdAt: "desc" },
        take: 6
      },
      chatMessages: {
        orderBy: { createdAt: "desc" },
        take: 6
      },
      energyCalculations: {
        orderBy: { createdAt: "desc" },
        take: 4
      },
      transactions: {
        orderBy: { dueDate: "desc" },
        take: 8
      }
    }
  });

  if (!patient) {
    notFound();
  }

  const latestRecord = patient.bodyRecords[0];
  const publishedPlans = patient.mealPlans.filter((plan) => plan.publishedAt).length;
  const financialTotal = patient.transactions
    .filter((transaction) => transaction.status !== "CANCELED")
    .reduce((total, transaction) => total + (transaction.type === "INCOME" ? transaction.amountCents : -transaction.amountCents), 0);
  const pendingTotal = patient.transactions
    .filter((transaction) => transaction.status === "PENDING")
    .reduce((total, transaction) => total + transaction.amountCents, 0);
  const latestEnergy = patient.energyCalculations[0];
  const pendingDiaryEntries = patient.foodDiaryEntries.filter((entry) => entry.status === "PENDING").length;
  const activeGoals = patient.goals.filter((goal) => !goal.completedAt).length;
  const unreadMessages = patient.chatMessages.filter((message) => message.sender === "PATIENT" && !message.readByProfessionalAt).length;

  return (
    <main className="shell workspace-shell">
      <AppNav active="patients" user={user} />

      <section className="workspace-heading patient-record-heading">
        <div>
          <span className="eyebrow">Prontuario</span>
          <h1>{patient.name}</h1>
          <p>
            {patient.goal || "Objetivo nao informado"} · {patient.email || "sem e-mail"} · {patient.phone || "sem telefone"}
          </p>
        </div>
        <div className="row-actions">
          <Link className="text-button" href="/patients">
            Voltar
          </Link>
          <Link className="text-button" href={`/appointments?patientId=${patient.id}`}>
            Agendar
          </Link>
          <Link className="text-button" href={`/meal-plans?patientId=${patient.id}`}>
            Plano
          </Link>
          <Link className="text-button" href={`/body-records?patientId=${patient.id}`}>
            Evolucao
          </Link>
          <Link className="text-button" href={`/anamneses?patientId=${patient.id}`}>
            Anamnese
          </Link>
          <Link className="text-button" href={`/recalls?patientId=${patient.id}`}>
            Recordatorio
          </Link>
          <Link className="text-button" href={`/lab-exams?patientId=${patient.id}`}>
            Exames
          </Link>
          <Link className="text-button" href={`/supplements?patientId=${patient.id}`}>
            Suplementos
          </Link>
          <Link className="text-button" href={`/food-diary?patientId=${patient.id}`}>
            Diario
          </Link>
          <Link className="text-button" href={`/hydration?patientId=${patient.id}`}>
            Metas
          </Link>
          <Link className="text-button" href={`/energy?patientId=${patient.id}`}>
            Energia
          </Link>
          <Link className="text-button" href="/chat">
            Chat
          </Link>
        </div>
      </section>

      <section className="dashboard-metrics">
        <div className="dashboard-card">
          <span>Idade</span>
          <strong>{patient.birthDate ? calculateAge(patient.birthDate) : "--"}</strong>
          <small>{patient.birthDate ? formatDate(patient.birthDate) : "nascimento vazio"}</small>
        </div>
        <div className="dashboard-card">
          <span>Peso atual</span>
          <strong>{latestRecord?.weightKg ? Number(latestRecord.weightKg).toLocaleString("pt-BR") : "--"}</strong>
          <small>{latestRecord ? `em ${formatDate(latestRecord.date)}` : "sem evolucao"}</small>
        </div>
        <div className="dashboard-card">
          <span>Planos</span>
          <strong>{patient.mealPlans.length}</strong>
          <small>{publishedPlans} publicados</small>
        </div>
        <div className="dashboard-card">
          <span>Financeiro</span>
          <strong>{formatMoney(financialTotal)}</strong>
          <small>{formatMoney(pendingTotal)} pendente</small>
        </div>
        <div className="dashboard-card">
          <span>GET</span>
          <strong>{latestEnergy ? Math.round(Number(latestEnergy.totalEnergyExpenditure)) : "--"}</strong>
          <small>{latestEnergy ? `${latestEnergy.formula} kcal` : "sem calculo"}</small>
        </div>
        <div className="dashboard-card">
          <span>Diario</span>
          <strong>{patient.foodDiaryEntries.length}</strong>
          <small>{pendingDiaryEntries} pendente(s)</small>
        </div>
        <div className="dashboard-card">
          <span>Metas</span>
          <strong>{activeGoals}</strong>
          <small>{patient.hydrationLogs.length} registros de agua</small>
        </div>
        <div className="dashboard-card">
          <span>Chat</span>
          <strong>{unreadMessages}</strong>
          <small>{patient.chatMessages.length} mensagens recentes</small>
        </div>
      </section>

      <section className="patient-record-grid">
        <article className="surface">
          <span className="eyebrow">Resumo clinico</span>
          <h2>Dados do paciente</h2>
          <dl className="record-definition-list">
            <div>
              <dt>Sexo</dt>
              <dd>{formatSex(patient.sex)}</dd>
            </div>
            <div>
              <dt>Altura</dt>
              <dd>{patient.heightCm ? `${Number(patient.heightCm).toLocaleString("pt-BR")} cm` : "--"}</dd>
            </div>
            <div>
              <dt>Peso inicial</dt>
              <dd>{patient.weightKg ? `${Number(patient.weightKg).toLocaleString("pt-BR")} kg` : "--"}</dd>
            </div>
            <div>
              <dt>LGPD</dt>
              <dd>{patient.lgpdConsentAt ? `Consentido em ${formatDate(patient.lgpdConsentAt)}` : "Pendente"}</dd>
            </div>
            <div>
              <dt>Portal</dt>
              <dd>{patient.portalEnabled ? `Ativo (${patient.portalAccessCode || "sem codigo"})` : "Inativo"}</dd>
            </div>
          </dl>
          {patient.notes ? <p className="record-notes">{patient.notes}</p> : null}
        </article>

        <article className="surface">
          <span className="eyebrow">Agenda</span>
          <h2>Consultas</h2>
          <div className="compact-list">
            {patient.appointments.map((appointment) => (
              <article key={appointment.id}>
                <strong>{appointment.type}</strong>
                <span>
                  {formatDateTime(appointment.startsAt)} · {formatAppointmentStatus(appointment.status)}
                  {appointment.professional?.name ? ` · ${appointment.professional.name}` : ""}
                </span>
              </article>
            ))}
            {patient.appointments.length === 0 ? <p className="empty-card">Nenhuma consulta registrada.</p> : null}
          </div>
        </article>

        <article className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Nutricao</span>
              <h2>Planos alimentares</h2>
            </div>
            <Link className="text-button" href="/meal-plans">
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {patient.mealPlans.map((plan) => {
              const calories = plan.meals
                .flatMap((meal) => meal.items)
                .reduce((total, item) => total + Number(item.calories), 0);

              return (
                <article key={plan.id}>
                  <strong>{plan.name}</strong>
                  <span>
                    {Math.round(calories)} kcal · {plan.publishedAt ? "Publicado" : "Rascunho"} · {formatDate(plan.createdAt)}
                  </span>
                </article>
              );
            })}
            {patient.mealPlans.length === 0 ? <p className="empty-card">Nenhum plano criado.</p> : null}
          </div>
        </article>

        <article className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Evolucao</span>
              <h2>Medidas</h2>
            </div>
            <Link className="text-button" href={`/body-records?patientId=${patient.id}`}>
              Abrir
            </Link>
          </div>
          <div className="record-timeline">
            {patient.bodyRecords.map((record) => (
              <article key={record.id}>
                <strong>{formatDate(record.date)}</strong>
                <span>
                  Peso {valueOrDash(record.weightKg)} kg · Cintura {valueOrDash(record.waistCm)} cm · Gordura{" "}
                  {valueOrDash(record.bodyFatPct)}%
                </span>
              </article>
            ))}
            {patient.bodyRecords.length === 0 ? <p className="empty-card">Nenhuma medida registrada.</p> : null}
          </div>
        </article>

        <article className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Anamnese</span>
              <h2>Historico</h2>
            </div>
            <Link className="text-button" href={`/anamneses?patientId=${patient.id}`}>
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {patient.anamneses.map((anamnesis) => (
              <article key={anamnesis.id}>
                <strong>{anamnesis.type}</strong>
                <span>
                  {formatDate(anamnesis.createdAt)} · {summarizeJson(anamnesis.answers)}
                </span>
              </article>
            ))}
            {patient.anamneses.length === 0 ? <p className="empty-card">Nenhuma anamnese registrada.</p> : null}
          </div>
        </article>

        <article className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Recordatorio 24h</span>
              <h2>Consumo alimentar</h2>
            </div>
            <Link className="text-button" href={`/recalls?patientId=${patient.id}`}>
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {patient.recalls.map((recall) => {
              const totals = recall.meals
                .flatMap((meal) => meal.items)
                .reduce(
                  (total, item) => ({
                    calories: total.calories + Number(item.calories),
                    protein: total.protein + Number(item.protein),
                    carbs: total.carbs + Number(item.carbs),
                    fat: total.fat + Number(item.fat)
                  }),
                  { calories: 0, protein: 0, carbs: 0, fat: 0 }
                );

              return (
                <article key={recall.id}>
                  <strong>{recall.referenceDate ? formatDate(recall.referenceDate) : formatDate(recall.createdAt)}</strong>
                  <span>
                    {Math.round(totals.calories)} kcal Â· {totals.protein.toFixed(1)}g prot Â·{" "}
                    {totals.carbs.toFixed(1)}g carb Â· {totals.fat.toFixed(1)}g gord
                  </span>
                </article>
              );
            })}
            {patient.recalls.length === 0 ? <p className="empty-card">Nenhum recordatorio registrado.</p> : null}
          </div>
        </article>

        <article className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Exames</span>
              <h2>Laboratoriais</h2>
            </div>
            <Link className="text-button" href={`/lab-exams?patientId=${patient.id}`}>
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {patient.labExams.map((exam) => (
              <article key={exam.id}>
                <strong>{formatDate(exam.examDate)}</strong>
                <span>
                  {exam.results.length} resultados
                  {exam.results[0] ? ` Â· ${exam.results[0].name}: ${valueOrDash(exam.results[0].value)} ${exam.results[0].unit}` : ""}
                </span>
              </article>
            ))}
            {patient.labExams.length === 0 ? <p className="empty-card">Nenhum exame registrado.</p> : null}
          </div>
        </article>

        <article className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Prescricao</span>
              <h2>Suplementos</h2>
            </div>
            <Link className="text-button" href={`/supplements?patientId=${patient.id}`}>
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {patient.supplementPrescriptions.map((prescription) => (
              <article key={prescription.id}>
                <strong>{formatDate(prescription.prescribedAt)}</strong>
                <span>
                  {prescription.items.length} itens
                  {prescription.items[0] ? ` Â· ${prescription.items[0].name} ${prescription.items[0].dose}` : ""}
                  {prescription.duration ? ` Â· ${prescription.duration}` : ""}
                </span>
              </article>
            ))}
            {patient.supplementPrescriptions.length === 0 ? <p className="empty-card">Nenhuma prescricao registrada.</p> : null}
          </div>
        </article>

        <article className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Diario alimentar</span>
              <h2>Registros do paciente</h2>
            </div>
            <Link className="text-button" href={`/food-diary?patientId=${patient.id}`}>
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {patient.foodDiaryEntries.map((entry) => (
              <article key={entry.id}>
                <strong>
                  {entry.mealType} - {formatDate(entry.entryDate)}
                </strong>
                <span>
                  {formatDiaryStatus(entry.status)}
                  {entry.entryTime ? ` - ${entry.entryTime}` : ""} - {entry.description.slice(0, 90)}
                </span>
              </article>
            ))}
            {patient.foodDiaryEntries.length === 0 ? <p className="empty-card">Nenhum registro alimentar enviado.</p> : null}
          </div>
        </article>

        <article className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Hidratacao e metas</span>
              <h2>Engajamento</h2>
            </div>
            <Link className="text-button" href={`/hydration?patientId=${patient.id}`}>
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {patient.goals.map((goal) => {
              const current = Number(goal.current || 0);
              const target = Number(goal.target || 1);
              const progress = Math.min(100, Math.round((current / target) * 100));
              return (
                <article key={goal.id}>
                  <strong>{goal.title}</strong>
                  <span>
                    {current.toLocaleString("pt-BR")} / {target.toLocaleString("pt-BR")} {goal.unit || ""} - {progress}%
                  </span>
                  <div className="usage-bar">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </article>
              );
            })}
            {patient.goals.length === 0 ? <p className="empty-card">Nenhuma meta registrada.</p> : null}
            {patient.hydrationLogs.slice(0, 3).map((log) => (
              <article key={log.id}>
                <strong>{log.amountMl} ml de agua</strong>
                <span>
                  {formatDate(log.date)}
                  {log.time ? ` - ${log.time}` : ""}
                </span>
              </article>
            ))}
          </div>
        </article>

        <article className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Gasto energetico</span>
              <h2>TMB e GET</h2>
            </div>
            <Link className="text-button" href={`/energy?patientId=${patient.id}`}>
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {patient.energyCalculations.map((calculation) => (
              <article key={calculation.id}>
                <strong>{Math.round(Number(calculation.totalEnergyExpenditure))} kcal de GET</strong>
                <span>
                  {calculation.formula} - TMB {Math.round(Number(calculation.basalMetabolicRate))} kcal - {formatDate(calculation.createdAt)}
                </span>
              </article>
            ))}
            {patient.energyCalculations.length === 0 ? <p className="empty-card">Nenhum calculo energetico salvo.</p> : null}
          </div>
        </article>

        <article className="surface">
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
            {patient.chatMessages.map((message) => (
              <article key={message.id}>
                <strong>{message.sender === "PATIENT" ? "Paciente" : "Profissional"}</strong>
                <span>
                  {formatDateTime(message.createdAt)} - {message.text.slice(0, 110)}
                </span>
              </article>
            ))}
            {patient.chatMessages.length === 0 ? <p className="empty-card">Nenhuma mensagem recente.</p> : null}
          </div>
        </article>

        <article className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Financeiro</span>
              <h2>Movimentacoes</h2>
            </div>
            <Link className="text-button" href={`/financial?patientId=${patient.id}`}>
              Abrir
            </Link>
          </div>
          <div className="compact-list">
            {patient.transactions.map((transaction) => (
              <article key={transaction.id}>
                <strong>{transaction.description}</strong>
                <span>
                  {formatMoney(transaction.amountCents)} · {formatTransactionStatus(transaction.status)} ·{" "}
                  {formatDate(transaction.dueDate)}
                </span>
              </article>
            ))}
            {patient.transactions.length === 0 ? <p className="empty-card">Nenhuma movimentacao financeira.</p> : null}
          </div>
        </article>
      </section>
    </main>
  );
}

function calculateAge(value: Date) {
  const today = new Date();
  let age = today.getFullYear() - value.getFullYear();
  const monthDelta = today.getMonth() - value.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < value.getDate())) {
    age -= 1;
  }

  return age;
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value / 100);
}

function formatSex(value: string) {
  const labels: Record<string, string> = {
    FEMALE: "Feminino",
    MALE: "Masculino",
    OTHER: "Outro",
    UNINFORMED: "Nao informado"
  };

  return labels[value] || value;
}

function formatAppointmentStatus(value: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmada",
    COMPLETED: "Realizada",
    CANCELED: "Cancelada",
    NO_SHOW: "Faltou"
  };

  return labels[value] || value;
}

function formatTransactionStatus(value: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    PAID: "Pago",
    CANCELED: "Cancelado"
  };

  return labels[value] || value;
}

function formatDiaryStatus(value: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    NEEDS_ADJUSTMENT: "Precisa de ajuste"
  };

  return labels[value] || value;
}

function valueOrDash(value: unknown) {
  return value === null || value === undefined ? "--" : Number(value).toLocaleString("pt-BR");
}

function summarizeJson(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "respostas registradas";
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== null && entryValue !== "")
    .slice(0, 2);

  if (entries.length === 0) {
    return "respostas registradas";
  }

  return entries.map(([key, entryValue]) => `${key}: ${String(entryValue).slice(0, 42)}`).join(" · ");
}
