"use client";

import { FormEvent, useEffect, useState } from "react";

type PatientOption = {
  id: string;
  name: string;
};

type DiaryStatus = "PENDING" | "APPROVED" | "NEEDS_ADJUSTMENT";

type DiaryEntry = {
  id: string;
  patientId: string;
  mealType: string;
  entryDate: string;
  entryTime: string | null;
  description: string;
  photoUrl: string | null;
  status: DiaryStatus;
  feedbackNote: string | null;
  feedbackAt: string | null;
  createdAt: string;
  patient: PatientOption;
};

type PatientsResponse = {
  patients: PatientOption[];
};

type EntriesResponse = {
  entries: DiaryEntry[];
};

const statusLabels: Record<DiaryStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  NEEDS_ADJUSTMENT: "Ajustar"
};

export function FoodDiaryClient() {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [status, setStatus] = useState<"ALL" | DiaryStatus>("ALL");
  const [editingFeedback, setEditingFeedback] = useState<DiaryEntry | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void loadPatients();
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [selectedPatientId, status]);

  async function loadPatients() {
    const response = await fetch("/api/patients");
    const data = (await response.json()) as PatientsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar pacientes.");
      return;
    }

    setPatients(data.patients);
  }

  async function loadEntries() {
    setLoading(true);
    const params = new URLSearchParams();

    if (selectedPatientId) params.set("patientId", selectedPatientId);
    if (status !== "ALL") params.set("status", status);

    const response = await fetch(`/api/food-diary${params.size ? `?${params}` : ""}`);
    const data = (await response.json()) as EntriesResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar diario alimentar.");
      return;
    }

    setEntries(data.entries);
  }

  async function updateFeedback(entry: DiaryEntry, nextStatus: DiaryStatus, feedbackNote = entry.feedbackNote || "") {
    setSavingId(entry.id);
    setMessage(null);

    const response = await fetch(`/api/food-diary/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, feedbackNote })
    });
    const data = (await response.json()) as { error?: string };
    setSavingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel avaliar o registro.");
      return;
    }

    setEditingFeedback(null);
    setMessage("Avaliacao salva.");
    await loadEntries();
  }

  async function handleFeedbackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingFeedback) return;

    const form = new FormData(event.currentTarget);
    await updateFeedback(editingFeedback, String(form.get("status")) as DiaryStatus, String(form.get("feedbackNote") || ""));
  }

  async function handleDelete(entry: DiaryEntry) {
    const confirmed = window.confirm(`Remover registro de ${entry.patient.name}?`);

    if (!confirmed) return;

    setDeletingId(entry.id);
    setMessage(null);

    const response = await fetch(`/api/food-diary/${entry.id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel remover o registro.");
      return;
    }

    setMessage("Registro removido.");
    await loadEntries();
  }

  return (
    <section className="workspace-grid">
      <div className="surface food-diary-list">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Registros</span>
            <h2>Refeicoes enviadas</h2>
          </div>
          <div className="mini-stats">
            <span>{entries.length} registros</span>
            <span>{entries.filter((entry) => entry.status === "PENDING").length} pendentes</span>
          </div>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="filters-row">
          <label>
            Paciente
            <select className="inline-select" value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>
              <option value="">Todos</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select className="inline-select" value={status} onChange={(event) => setStatus(event.target.value as "ALL" | DiaryStatus)}>
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendentes</option>
              <option value="APPROVED">Aprovados</option>
              <option value="NEEDS_ADJUSTMENT">Com ajustes</option>
            </select>
          </label>
        </div>

        <div className="plan-list">
          {entries.map((entry) => (
            <article className="plan-card diary-entry-card" key={entry.id}>
              <div className="section-title-row">
                <div>
                  <span className={entry.status === "APPROVED" ? "status-pill ok" : "status-pill"}>{statusLabels[entry.status]}</span>
                  <h3>{entry.patient.name}</h3>
                  <p>
                    {entry.mealType} - {formatDate(entry.entryDate)}
                    {entry.entryTime ? ` as ${entry.entryTime}` : ""}
                  </p>
                </div>
              </div>
              <p>{entry.description}</p>
              {entry.photoUrl ? (
                <a className="text-button" href={entry.photoUrl} target="_blank" rel="noreferrer">
                  Ver foto
                </a>
              ) : null}
              {entry.feedbackNote ? <p className="record-notes">{entry.feedbackNote}</p> : null}
              <div className="row-actions">
                <button className="text-button" type="button" disabled={savingId === entry.id} onClick={() => void updateFeedback(entry, "APPROVED")}>
                  Aprovar
                </button>
                <button className="text-button" type="button" onClick={() => setEditingFeedback(entry)}>
                  Avaliar
                </button>
                <button className="text-button danger" type="button" disabled={deletingId === entry.id} onClick={() => void handleDelete(entry)}>
                  {deletingId === entry.id ? "Removendo..." : "Remover"}
                </button>
              </div>
            </article>
          ))}

          {!loading && entries.length === 0 ? <p className="empty-card">Nenhum registro encontrado.</p> : null}
          {loading ? <p className="empty-card">Carregando diario alimentar...</p> : null}
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">Feedback</span>
        <h2>{editingFeedback ? "Avaliar refeicao" : "Selecione um registro"}</h2>
        {editingFeedback ? (
          <form className="form compact-form" onSubmit={(event) => void handleFeedbackSubmit(event)}>
            <p className="record-notes">{editingFeedback.description}</p>
            <label>
              Status
              <select name="status" defaultValue={editingFeedback.status === "PENDING" ? "NEEDS_ADJUSTMENT" : editingFeedback.status}>
                <option value="APPROVED">Aprovado</option>
                <option value="NEEDS_ADJUSTMENT">Precisa de ajustes</option>
                <option value="PENDING">Pendente</option>
              </select>
            </label>
            <label>
              Observacao para o paciente
              <textarea name="feedbackNote" rows={5} defaultValue={editingFeedback.feedbackNote || ""} />
            </label>
            <button className="button" type="submit" disabled={savingId === editingFeedback.id}>
              {savingId === editingFeedback.id ? "Salvando..." : "Enviar avaliacao"}
            </button>
            <button className="button secondary" type="button" onClick={() => setEditingFeedback(null)}>
              Cancelar
            </button>
          </form>
        ) : (
          <p className="empty-card">Use o botao Avaliar em uma refeicao enviada pelo paciente.</p>
        )}
      </aside>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
