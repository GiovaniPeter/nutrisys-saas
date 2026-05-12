"use client";

import { useEffect, useMemo, useState } from "react";

type ReportSummary = {
  period: {
    from: string;
    to: string;
  };
  metrics: {
    newPatients: number;
    appointments: number;
    completedAppointments: number;
    noShows: number;
    mealPlans: number;
    publishedMealPlans: number;
    bodyRecords: number;
    anamneses: number;
    incomeCents: number;
    expenseCents: number;
    balanceCents: number;
    pendingCents: number;
  };
  appointmentStatus: Record<string, number>;
  appointmentTypes: Record<string, number>;
  topPatientsByAppointments: Array<{
    patientId: string;
    name: string;
    count: number;
  }>;
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Concluida",
  CANCELED: "Cancelada",
  NO_SHOW: "Faltou"
};

export function ReportsClient() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(() => firstDayOfMonth());
  const [toDate, setToDate] = useState(() => today());

  const noShowRate = useMemo(() => {
    if (!summary?.metrics.appointments) {
      return 0;
    }

    return (summary.metrics.noShows / summary.metrics.appointments) * 100;
  }, [summary]);

  useEffect(() => {
    void loadSummary();
  }, [fromDate, toDate]);

  async function loadSummary() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("from", new Date(`${fromDate}T00:00:00.000`).toISOString());
    params.set("to", new Date(`${toDate}T23:59:59.999`).toISOString());

    const response = await fetch(`/api/reports/summary?${params}`);
    const data = (await response.json()) as ReportSummary & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar relatorio.");
      return;
    }

    setSummary(data);
  }

  if (!summary && loading) {
    return <p className="empty-card">Carregando relatorios...</p>;
  }

  return (
    <section className="reports-layout">
      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Periodo</span>
            <h2>Resumo</h2>
          </div>
          <button className="text-button" type="button" onClick={() => window.print()}>
            Imprimir
          </button>
        </div>

        <div className="filters-row">
          <label>
            De
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </label>
          <label>
            Ate
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </label>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="dashboard-metrics report-metrics">
          <Metric label="Pacientes novos" value={summary?.metrics.newPatients || 0} detail="cadastros no periodo" />
          <Metric label="Consultas" value={summary?.metrics.appointments || 0} detail={`${summary?.metrics.completedAppointments || 0} concluidas`} />
          <Metric label="No-show" value={`${noShowRate.toFixed(0)}%`} detail={`${summary?.metrics.noShows || 0} faltas`} />
          <Metric label="Planos" value={summary?.metrics.mealPlans || 0} detail={`${summary?.metrics.publishedMealPlans || 0} publicados`} />
        </div>

        <div className="metric-strip">
          <div>
            <strong>{formatMoney(summary?.metrics.incomeCents || 0)}</strong>
            <span>Receita</span>
          </div>
          <div>
            <strong>{formatMoney(summary?.metrics.expenseCents || 0)}</strong>
            <span>Despesa</span>
          </div>
          <div>
            <strong>{formatMoney(summary?.metrics.balanceCents || 0)}</strong>
            <span>Saldo</span>
          </div>
          <div>
            <strong>{formatMoney(summary?.metrics.pendingCents || 0)}</strong>
            <span>Pendente</span>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        <ReportCard title="Status das consultas" rows={Object.entries(summary?.appointmentStatus || {}).map(([key, value]) => [statusLabels[key] || key, value])} />
        <ReportCard title="Tipos de consulta" rows={Object.entries(summary?.appointmentTypes || {})} />
        <ReportCard
          title="Pacientes mais atendidos"
          rows={(summary?.topPatientsByAppointments || []).map((patient) => [patient.name, patient.count])}
        />
        <ReportCard
          title="Registros clinicos"
          rows={[
            ["Evolucoes corporais", summary?.metrics.bodyRecords || 0],
            ["Anamneses", summary?.metrics.anamneses || 0]
          ]}
        />
      </div>
    </section>
  );
}

function Metric({ label, value, detail }: { label: string; value: number | string; detail: string }) {
  return (
    <div className="dashboard-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function ReportCard({ title, rows }: { title: string; rows: Array<[string, number]> }) {
  return (
    <article className="surface">
      <span className="eyebrow">Detalhe</span>
      <h2>{title}</h2>
      <div className="compact-list">
        {rows.map(([label, value]) => (
          <article key={label}>
            <strong>{label}</strong>
            <span>{value}</span>
          </article>
        ))}
        {rows.length === 0 ? <p className="empty-card">Sem dados no periodo.</p> : null}
      </div>
    </article>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value / 100);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
}
