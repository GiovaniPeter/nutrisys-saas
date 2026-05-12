"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type PatientOption = {
  id: string;
  name: string;
};

type AnamnesisAnswers = {
  mainComplaint?: string;
  clinicalHistory?: string;
  medications?: string;
  allergies?: string;
  bowelFunction?: string;
  sleep?: string;
  waterIntake?: string;
  physicalActivity?: string;
  foodPreferences?: string;
  foodAversions?: string;
  routine?: string;
  goals?: string;
  conduct?: string;
};

type Anamnesis = {
  id: string;
  patientId: string;
  type: string;
  answers: AnamnesisAnswers;
  createdAt: string;
  updatedAt: string;
  patient: PatientOption;
};

type PatientsResponse = {
  patients: PatientOption[];
};

type AnamnesesResponse = {
  anamneses: Anamnesis[];
};

const answerLabels: Array<[keyof AnamnesisAnswers, string]> = [
  ["mainComplaint", "Queixa principal"],
  ["clinicalHistory", "Historico clinico"],
  ["medications", "Medicamentos"],
  ["allergies", "Alergias/intolerancias"],
  ["bowelFunction", "Funcionamento intestinal"],
  ["sleep", "Sono"],
  ["waterIntake", "Agua"],
  ["physicalActivity", "Atividade fisica"],
  ["foodPreferences", "Preferencias"],
  ["foodAversions", "Aversoes"],
  ["routine", "Rotina alimentar"],
  ["goals", "Objetivos"],
  ["conduct", "Conduta inicial"]
];

export function AnamnesesClient() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [anamneses, setAnamneses] = useState<Anamnesis[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(() => searchParams.get("patientId") || "");
  const [editingAnamnesis, setEditingAnamnesis] = useState<Anamnesis | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editing = Boolean(editingAnamnesis);
  const latestAnamnesis = useMemo(() => anamneses[0] || null, [anamneses]);

  useEffect(() => {
    void loadPatients();
  }, []);

  useEffect(() => {
    void loadAnamneses(selectedPatientId);
  }, [selectedPatientId]);

  async function loadPatients() {
    const response = await fetch("/api/patients");
    const data = (await response.json()) as PatientsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar pacientes.");
      return;
    }

    setPatients(data.patients);
    if (!selectedPatientId && !searchParams.get("patientId") && data.patients[0]) {
      setSelectedPatientId(data.patients[0].id);
    }
  }

  async function loadAnamneses(patientId = "") {
    setLoading(true);
    const params = new URLSearchParams();

    if (patientId) {
      params.set("patientId", patientId);
    }

    const response = await fetch(`/api/anamneses${params.size ? `?${params}` : ""}`);
    const data = (await response.json()) as AnamnesesResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar anamneses.");
      return;
    }

    setAnamneses(data.anamneses);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = getAnamnesisPayload(form, selectedPatientId);

    setSaving(true);
    setMessage(null);

    const response = await fetch(editingAnamnesis ? `/api/anamneses/${editingAnamnesis.id}` : "/api/anamneses", {
      method: editingAnamnesis ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel salvar a anamnese.");
      return;
    }

    if (editingAnamnesis) {
      setEditingAnamnesis(null);
      setMessage("Anamnese atualizada com sucesso.");
    } else {
      formElement.reset();
      setMessage("Anamnese criada com sucesso.");
    }

    await loadAnamneses(selectedPatientId);
  }

  async function handleDelete(anamnesis: Anamnesis) {
    const confirmed = window.confirm(`Excluir anamnese de ${anamnesis.patient.name}?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(anamnesis.id);
    setMessage(null);

    const response = await fetch(`/api/anamneses/${anamnesis.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel excluir a anamnese.");
      return;
    }

    if (editingAnamnesis?.id === anamnesis.id) {
      setEditingAnamnesis(null);
    }

    setMessage("Anamnese excluida com sucesso.");
    await loadAnamneses(selectedPatientId);
  }

  return (
    <section className="workspace-grid">
      <div className="surface anamnesis-list">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Historico</span>
            <h2>Anamneses registradas</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo das anamneses">
            <span>{anamneses.length} registros</span>
            <span>{latestAnamnesis ? formatDate(latestAnamnesis.createdAt) : "sem historico"}</span>
          </div>
        </div>

        <label className="search-field">
          <span>Paciente</span>
          <select
            className="inline-select"
            value={selectedPatientId}
            onChange={(event) => {
              setSelectedPatientId(event.target.value);
              setEditingAnamnesis(null);
            }}
          >
            <option value="">Todos</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </label>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="plan-list">
          {anamneses.map((anamnesis) => (
            <article className="plan-card" key={anamnesis.id}>
              <div>
                <span className="status-pill ok">{anamnesis.type}</span>
                <h3>{anamnesis.patient.name}</h3>
                <p>Criada em {formatDate(anamnesis.createdAt)}</p>
              </div>
              <div className="answer-preview">
                {answerLabels.slice(0, 6).map(([key, label]) => (
                  <div key={key}>
                    <strong>{label}</strong>
                    <span>{anamnesis.answers[key] || "Nao informado"}</span>
                  </div>
                ))}
              </div>
              <div className="row-actions">
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setEditingAnamnesis(anamnesis);
                    setSelectedPatientId(anamnesis.patientId);
                    setMessage(null);
                  }}
                >
                  Editar
                </button>
                <button
                  className="text-button danger"
                  type="button"
                  disabled={deletingId === anamnesis.id}
                  onClick={() => void handleDelete(anamnesis)}
                >
                  {deletingId === anamnesis.id ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </article>
          ))}

          {!loading && anamneses.length === 0 ? <p className="empty-card">Nenhuma anamnese registrada.</p> : null}
          {loading ? <p className="empty-card">Carregando anamneses...</p> : null}
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">{editing ? "Edicao" : "Nova anamnese"}</span>
        <h2>{editing ? "Editar anamnese" : "Registrar anamnese"}</h2>
        <form key={editingAnamnesis?.id || "new"} className="form compact-form" onSubmit={handleSubmit}>
          <label>
            Paciente
            <select name="patientId" required value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>
              <option value="">Selecione</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tipo
            <select name="type" defaultValue={editingAnamnesis?.type || "Anamnese inicial"}>
              <option>Anamnese inicial</option>
              <option>Retorno</option>
              <option>Pre-consulta</option>
              <option>Esportiva</option>
              <option>Clinica</option>
            </select>
          </label>

          {answerLabels.map(([key, label]) => (
            <label key={key}>
              {label}
              <textarea
                name={key}
                rows={key === "routine" || key === "conduct" ? 4 : 3}
                placeholder={label}
                defaultValue={editingAnamnesis?.answers[key] || ""}
              />
            </label>
          ))}

          <button className="button" type="submit" disabled={saving || !selectedPatientId}>
            {saving ? "Salvando..." : editing ? "Salvar alteracoes" : "Registrar anamnese"}
          </button>
          {!selectedPatientId ? <p className="form-message error">Selecione um paciente.</p> : null}
          {editing ? (
            <button className="button secondary" type="button" onClick={() => setEditingAnamnesis(null)}>
              Cancelar edicao
            </button>
          ) : null}
        </form>
      </aside>
    </section>
  );
}

function getAnamnesisPayload(form: FormData, selectedPatientId: string) {
  return {
    patientId: form.get("patientId") || selectedPatientId,
    type: form.get("type"),
    answers: Object.fromEntries(answerLabels.map(([key]) => [key, String(form.get(key) || "").trim()]))
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}
