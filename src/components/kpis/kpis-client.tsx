"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type KpisSummary = {
  period: { months: number };
  metrics: {
    returnRate: number;
    returnedPatients: number;
    totalWithAppointments: number;
    currentMonthRevenueCents: number;
    previousMonthRevenueCents: number;
    revenueTrend: number;
    activePatients: number;
    inactivePatients: number;
    totalPatients: number;
    noShowRate: number;
    noShows: number;
    totalPastAppointments: number;
    averageTicketCents: number;
    averageDaysBetweenAppointments: number | null;
    completedAppointments: number;
  };
  monthlyRevenue: Array<{ label: string; valueCents: number }>;
  patientActivity: {
    active: Array<ActivityPatient>;
    inactive: Array<ActivityPatient>;
  };
  noShowRisk: Array<{
    appointmentId: string;
    patientId: string;
    patientName: string;
    startsAt: string;
    type: string;
    reasons: string[];
    riskPercent: number;
  }>;
  topPatientsByRevenue: Array<{
    patientId: string;
    name: string;
    valueCents: number;
    count: number;
  }>;
};

type ActivityPatient = {
  id: string;
  name: string;
  phone: string | null;
  lastAppointment: string | null;
  active: boolean;
};

export function KpisClient() {
  const [summary, setSummary] = useState<KpisSummary | null>(null);
  const [months, setMonths] = useState(6);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const maxRevenue = useMemo(() => {
    return Math.max(...(summary?.monthlyRevenue.map((item) => item.valueCents) || [0]), 1);
  }, [summary]);

  useEffect(() => {
    void loadKpis();
  }, [months]);

  async function loadKpis() {
    setLoading(true);
    const response = await fetch(`/api/kpis?months=${months}`);
    const data = (await response.json()) as KpisSummary & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar KPIs.");
      return;
    }

    setSummary(data);
  }

  function contactInactive(patient: ActivityPatient) {
    if (!patient.phone) {
      setMessage("Paciente sem telefone cadastrado.");
      return;
    }

    const firstName = patient.name.split(" ")[0] || patient.name;
    const text = encodeURIComponent(`Ola ${firstName}! Sentimos sua falta. Vamos agendar uma consulta de acompanhamento?`);
    const phone = normalizePhone(patient.phone);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank", "noopener,noreferrer");
  }

  if (!summary && loading) {
    return <p className="empty-card">Carregando KPIs...</p>;
  }

  return (
    <section className="kpis-layout">
      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Periodo</span>
            <h2>Indicadores principais</h2>
          </div>
          <select className="inline-select compact-select" value={months} onChange={(event) => setMonths(Number(event.target.value))}>
            <option value={3}>3 meses</option>
            <option value={6}>6 meses</option>
            <option value={12}>12 meses</option>
          </select>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="kpi-card-grid">
          <MetricCard
            label="Taxa de retorno"
            value={`${summary?.metrics.returnRate || 0}%`}
            detail={`${summary?.metrics.returnedPatients || 0} de ${summary?.metrics.totalWithAppointments || 0} voltaram`}
          />
          <MetricCard
            label="Faturamento do mes"
            value={formatMoney(summary?.metrics.currentMonthRevenueCents || 0)}
            detail={`${trend(summary?.metrics.revenueTrend || 0)} vs mes anterior`}
          />
          <MetricCard
            label="Pacientes ativos"
            value={summary?.metrics.activePatients || 0}
            detail={`${summary?.metrics.inactivePatients || 0} inativos de ${summary?.metrics.totalPatients || 0}`}
          />
          <MetricCard
            label="Taxa de faltas"
            value={`${summary?.metrics.noShowRate || 0}%`}
            detail={`${summary?.metrics.noShows || 0} faltas em ${summary?.metrics.totalPastAppointments || 0} consultas`}
          />
          <MetricCard
            label="Ticket medio"
            value={formatMoney(summary?.metrics.averageTicketCents || 0)}
            detail="por recebimento pago"
          />
          <MetricCard
            label="Dias entre consultas"
            value={summary?.metrics.averageDaysBetweenAppointments ?? "--"}
            detail={`${summary?.metrics.completedAppointments || 0} consultas concluidas`}
          />
        </div>
      </div>

      <div className="kpis-grid">
        <article className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Financeiro</span>
              <h2>Faturamento mensal</h2>
            </div>
          </div>
          <div className="kpi-bars">
            {summary?.monthlyRevenue.map((item) => (
              <div className="kpi-bar-col" key={item.label}>
                <span>{formatCompactMoney(item.valueCents)}</span>
                <div>
                  <strong style={{ height: `${Math.max(4, (item.valueCents / maxRevenue) * 100)}%` }} />
                </div>
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="surface">
          <span className="eyebrow">Retencao</span>
          <h2>Ativos vs inativos</h2>
          <div className="kpi-activity">
            <div className="kpi-donut" style={{ background: donut(summary) }}>
              <strong>{activityPercent(summary)}%</strong>
              <span>ativos</span>
            </div>
            <div className="compact-list">
              {(summary?.patientActivity.inactive || []).slice(0, 5).map((patient) => (
                <article key={patient.id}>
                  <strong>{patient.name}</strong>
                  <span>{patient.lastAppointment ? `Ultima consulta: ${formatDate(patient.lastAppointment)}` : "Sem consulta registrada"}</span>
                  <button className="text-button" type="button" onClick={() => contactInactive(patient)}>
                    WhatsApp
                  </button>
                </article>
              ))}
              {summary?.patientActivity.inactive.length === 0 ? <p className="empty-card">Nenhum paciente inativo.</p> : null}
            </div>
          </div>
        </article>

        <article className="surface">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Agenda</span>
              <h2>Risco de no-show</h2>
            </div>
            <span className="status-pill">{summary?.noShowRisk.length || 0} alertas</span>
          </div>
          <div className="compact-list kpi-risk-list">
            {summary?.noShowRisk.map((risk) => (
              <article key={risk.appointmentId}>
                <strong>{risk.patientName}</strong>
                <span>
                  {risk.type} - {formatDateTime(risk.startsAt)}
                </span>
                <div className="usage-bar">
                  <span style={{ width: `${risk.riskPercent}%` }} />
                </div>
                <small>{risk.riskPercent}% - {risk.reasons.join(", ")}</small>
                <Link className="text-button" href={`/appointments?patientId=${risk.patientId}`}>
                  Ver consulta
                </Link>
              </article>
            ))}
            {summary?.noShowRisk.length === 0 ? <p className="empty-card">Nenhum risco relevante detectado.</p> : null}
          </div>
        </article>

        <article className="surface">
          <span className="eyebrow">Receita</span>
          <h2>Top pacientes</h2>
          <div className="compact-list kpi-top-list">
            {summary?.topPatientsByRevenue.map((patient, index) => (
              <article key={patient.patientId}>
                <strong>
                  {index + 1}. {patient.name}
                </strong>
                <span>
                  {formatMoney(patient.valueCents)} - {patient.count} recebimento(s)
                </span>
                <div className="usage-bar">
                  <span style={{ width: `${topPatientPercent(summary, patient.valueCents)}%` }} />
                </div>
              </article>
            ))}
            {summary?.topPatientsByRevenue.length === 0 ? <p className="empty-card">Sem receitas pagas vinculadas a pacientes.</p> : null}
          </div>
        </article>
      </div>

      {loading ? <p className="empty-card">Atualizando indicadores...</p> : null}
    </section>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <article className="dashboard-card kpi-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function formatMoney(valueCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valueCents / 100);
}

function formatCompactMoney(valueCents: number) {
  if (valueCents >= 100000) {
    return `R$ ${(valueCents / 100000).toFixed(1)}k`;
  }

  return formatMoney(valueCents);
}

function trend(value: number) {
  if (value > 0) return `+${value}%`;
  return `${value}%`;
}

function activityPercent(summary: KpisSummary | null) {
  if (!summary?.metrics.totalPatients) return 0;
  return Math.round((summary.metrics.activePatients / summary.metrics.totalPatients) * 100);
}

function donut(summary: KpisSummary | null) {
  const percent = activityPercent(summary);
  return `conic-gradient(var(--primary) ${percent}%, #e4dcca ${percent}% 100%)`;
}

function topPatientPercent(summary: KpisSummary | null, valueCents: number) {
  const max = Math.max(...(summary?.topPatientsByRevenue.map((item) => item.valueCents) || [1]), 1);
  return Math.max(4, Math.round((valueCents / max) * 100));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function normalizePhone(phone: string) {
  const clean = phone.replace(/\D/g, "");
  return clean.startsWith("55") ? clean : `55${clean}`;
}
