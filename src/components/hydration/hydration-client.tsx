"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Patient = {
  id: string;
  name: string;
  weightKg: string | number | null;
};

type HydrationLog = {
  id: string;
  patientId: string;
  date: string;
  time: string | null;
  amountMl: number;
};

type PatientGoal = {
  id: string;
  patientId: string;
  title: string;
  target: string | number;
  current: string | number;
  unit: string | null;
  dueDate: string | null;
  completedAt: string | null;
};

type PatientsResponse = { patients: Patient[] };
type HydrationResponse = { logs: HydrationLog[] };
type GoalsResponse = { goals: PatientGoal[] };

export function HydrationClient() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [logs, setLogs] = useState<HydrationLog[]>([]);
  const [goals, setGoals] = useState<PatientGoal[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) || null;
  const totalMl = logs.reduce((total, log) => total + log.amountMl, 0);
  const targetMl = selectedPatient?.weightKg ? Math.round(Number(selectedPatient.weightKg) * 35) : 2000;
  const percent = Math.min(100, Math.round((totalMl / targetMl) * 100));
  const completedGoals = useMemo(() => goals.filter((goal) => toNumber(goal.current) >= toNumber(goal.target)).length, [goals]);

  useEffect(() => {
    void loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      void Promise.all([loadHydration(), loadGoals()]);
    }
  }, [selectedPatientId]);

  async function loadPatients() {
    const response = await fetch("/api/patients");
    const data = (await response.json()) as PatientsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar pacientes.");
      return;
    }

    setPatients(data.patients);
    if (data.patients[0]) setSelectedPatientId(data.patients[0].id);
  }

  async function loadHydration() {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const response = await fetch(`/api/hydration?patientId=${selectedPatientId}&date=${today}`);
    const data = (await response.json()) as HydrationResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar hidratacao.");
      return;
    }

    setLogs(data.logs);
  }

  async function loadGoals() {
    const response = await fetch(`/api/patient-goals?patientId=${selectedPatientId}`);
    const data = (await response.json()) as GoalsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar metas.");
      return;
    }

    setGoals(data.goals);
  }

  async function addWater(amountMl: number) {
    if (!selectedPatientId) return;

    const now = new Date();
    setSaving(true);
    setMessage(null);
    const response = await fetch("/api/hydration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: selectedPatientId,
        date: now.toISOString(),
        time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        amountMl
      })
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel registrar agua.");
      return;
    }

    await loadHydration();
  }

  async function deleteLog(logId: string) {
    setDeletingLogId(logId);
    const response = await fetch(`/api/hydration/${logId}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    setDeletingLogId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel remover registro.");
      return;
    }

    await loadHydration();
  }

  async function handleGoalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const dueDate = String(form.get("dueDate") || "");

    setSaving(true);
    setMessage(null);
    const response = await fetch("/api/patient-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: selectedPatientId,
        title: form.get("title"),
        target: form.get("target"),
        current: form.get("current") || 0,
        unit: form.get("unit"),
        dueDate: dueDate ? new Date(`${dueDate}T00:00:00.000`).toISOString() : ""
      })
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel criar meta.");
      return;
    }

    formElement.reset();
    await loadGoals();
  }

  async function updateGoal(goal: PatientGoal, delta: number) {
    const nextCurrent = Math.max(0, toNumber(goal.current) + delta);
    const response = await fetch(`/api/patient-goals/${goal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: nextCurrent })
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel atualizar meta.");
      return;
    }

    await loadGoals();
  }

  async function deleteGoal(goalId: string) {
    const confirmed = window.confirm("Remover esta meta?");
    if (!confirmed) return;

    setDeletingGoalId(goalId);
    const response = await fetch(`/api/patient-goals/${goalId}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    setDeletingGoalId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel remover meta.");
      return;
    }

    await loadGoals();
  }

  return (
    <section className="workspace-grid">
      <div className="surface hydration-panel">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Paciente</span>
            <h2>Resumo diario</h2>
          </div>
          <div className="mini-stats">
            <span>{totalMl} ml</span>
            <span>{completedGoals}/{goals.length} metas</span>
          </div>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <label className="search-field">
          <span>Paciente</span>
          <select className="inline-select" value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </label>

        <div className="hydration-circle">
          <strong>{totalMl} ml</strong>
          <span>{percent}% da meta de {targetMl} ml</span>
          <div className="usage-bar">
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="water-buttons">
          {[150, 250, 500, 750].map((amount) => (
            <button className="button secondary" type="button" disabled={saving} key={amount} onClick={() => void addWater(amount)}>
              +{amount} ml
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Horario</th>
                <th>Quantidade</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.time || "--"}</td>
                  <td>{log.amountMl} ml</td>
                  <td>
                    <button className="text-button danger" disabled={deletingLogId === log.id} onClick={() => void deleteLog(log.id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-cell">Nenhum registro hoje.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">Metas</span>
        <h2>Progresso</h2>
        <div className="compact-list">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((toNumber(goal.current) / toNumber(goal.target)) * 100));
            return (
              <article key={goal.id}>
                <strong>{goal.title}</strong>
                <span>{toNumber(goal.current)} / {toNumber(goal.target)} {goal.unit || ""} - {progress}%</span>
                <div className="usage-bar"><span style={{ width: `${progress}%` }} /></div>
                <div className="row-actions">
                  <button className="text-button" type="button" onClick={() => void updateGoal(goal, -1)}>-</button>
                  <button className="text-button" type="button" onClick={() => void updateGoal(goal, 1)}>+</button>
                  <button className="text-button danger" disabled={deletingGoalId === goal.id} type="button" onClick={() => void deleteGoal(goal.id)}>Remover</button>
                </div>
              </article>
            );
          })}
          {goals.length === 0 ? <p className="empty-card">Nenhuma meta criada.</p> : null}
        </div>

        <form className="form compact-form" onSubmit={(event) => void handleGoalSubmit(event)}>
          <label>
            Nova meta
            <input name="title" required placeholder="Ex.: Treinar na semana" />
          </label>
          <div className="form-row">
            <label>
              Alvo
              <input name="target" type="number" min="1" step="0.01" required defaultValue="3" />
            </label>
            <label>
              Atual
              <input name="current" type="number" min="0" step="0.01" defaultValue="0" />
            </label>
          </div>
          <div className="form-row">
            <label>
              Unidade
              <input name="unit" placeholder="vezes, litros..." />
            </label>
            <label>
              Prazo
              <input name="dueDate" type="date" />
            </label>
          </div>
          <button className="button" type="submit" disabled={saving || !selectedPatientId}>
            Criar meta
          </button>
        </form>
      </aside>
    </section>
  );
}

function toNumber(value: string | number | null | undefined) {
  return Number(value || 0);
}
