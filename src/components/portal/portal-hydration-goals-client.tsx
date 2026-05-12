"use client";

import { useEffect, useMemo, useState } from "react";

type HydrationLog = { id: string; amountMl: number; time: string | null };
type PatientGoal = { id: string; title: string; target: string | number; current: string | number; unit: string | null };
type HydrationResponse = { logs: HydrationLog[] };
type GoalsResponse = { goals: PatientGoal[] };

export function PortalHydrationGoalsClient({ targetMl = 2000 }: { targetMl?: number }) {
  const [logs, setLogs] = useState<HydrationLog[]>([]);
  const [goals, setGoals] = useState<PatientGoal[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const totalMl = logs.reduce((total, log) => total + log.amountMl, 0);
  const percent = Math.min(100, Math.round((totalMl / targetMl) * 100));
  const sortedGoals = useMemo(() => goals.slice(0, 4), [goals]);

  useEffect(() => {
    void Promise.all([loadHydration(), loadGoals()]);
  }, []);

  async function loadHydration() {
    const response = await fetch("/api/portal/hydration");
    const data = (await response.json()) as HydrationResponse & { error?: string };
    if (response.ok) setLogs(data.logs);
  }

  async function loadGoals() {
    const response = await fetch("/api/portal/goals");
    const data = (await response.json()) as GoalsResponse & { error?: string };
    if (response.ok) setGoals(data.goals);
  }

  async function addWater(amountMl: number) {
    const response = await fetch("/api/portal/hydration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountMl })
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel registrar agua.");
      return;
    }

    setMessage(`+${amountMl} ml registrado.`);
    await loadHydration();
  }

  async function updateGoal(goalId: string, delta: number) {
    const response = await fetch("/api/portal/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId, delta })
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel atualizar meta.");
      return;
    }

    await loadGoals();
  }

  return (
    <div className="portal-hydration-goals">
      <div className="portal-record">
        <strong>{totalMl} ml hoje</strong>
        <span>{percent}% da meta de {targetMl} ml</span>
        <div className="usage-bar"><span style={{ width: `${percent}%` }} /></div>
        <div className="row-actions">
          {[150, 250, 500].map((amount) => (
            <button className="text-button" type="button" key={amount} onClick={() => void addWater(amount)}>
              +{amount}
            </button>
          ))}
        </div>
      </div>

      <div className="compact-list">
        {sortedGoals.map((goal) => {
          const current = Number(goal.current || 0);
          const target = Number(goal.target || 1);
          const progress = Math.min(100, Math.round((current / target) * 100));
          return (
            <article key={goal.id}>
              <strong>{goal.title}</strong>
              <span>{current} / {target} {goal.unit || ""}</span>
              <div className="usage-bar"><span style={{ width: `${progress}%` }} /></div>
              <div className="row-actions">
                <button className="text-button" type="button" onClick={() => void updateGoal(goal.id, -1)}>-</button>
                <button className="text-button" type="button" onClick={() => void updateGoal(goal.id, 1)}>+</button>
              </div>
            </article>
          );
        })}
        {goals.length === 0 ? <p className="empty-card">Nenhuma meta ativa.</p> : null}
      </div>

      {message ? <p className="form-message neutral">{message}</p> : null}
    </div>
  );
}
