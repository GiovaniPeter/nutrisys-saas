"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type PatientOption = {
  id: string;
  name: string;
};

type BodyRecord = {
  id: string;
  patientId: string;
  date: string;
  weightKg: string | number | null;
  bodyFatPct: string | number | null;
  waistCm: string | number | null;
  hipCm: string | number | null;
  notes: string | null;
  patient: PatientOption;
};

type PatientsResponse = {
  patients: PatientOption[];
};

type BodyRecordsResponse = {
  records: BodyRecord[];
};

export function BodyRecordsClient() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [records, setRecords] = useState<BodyRecord[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(() => searchParams.get("patientId") || "");
  const [editingRecord, setEditingRecord] = useState<BodyRecord | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editing = Boolean(editingRecord);
  const sortedAsc = useMemo(
    () => [...records].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()),
    [records]
  );
  const firstRecord = sortedAsc[0] || null;
  const latestRecord = sortedAsc[sortedAsc.length - 1] || null;
  const weightDelta =
    firstRecord && latestRecord ? toNumber(latestRecord.weightKg) - toNumber(firstRecord.weightKg) : null;

  useEffect(() => {
    void loadPatients();
  }, []);

  useEffect(() => {
    void loadRecords(selectedPatientId);
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

  async function loadRecords(patientId = "") {
    setLoading(true);
    const params = new URLSearchParams();

    if (patientId) {
      params.set("patientId", patientId);
    }

    const response = await fetch(`/api/body-records${params.size ? `?${params}` : ""}`);
    const data = (await response.json()) as BodyRecordsResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar evolucao.");
      return;
    }

    setRecords(data.records);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = getBodyRecordPayload(form, selectedPatientId);

    setSaving(true);
    setMessage(null);

    const response = await fetch(editingRecord ? `/api/body-records/${editingRecord.id}` : "/api/body-records", {
      method: editingRecord ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel salvar o registro corporal.");
      return;
    }

    if (editingRecord) {
      setEditingRecord(null);
      setMessage("Registro atualizado com sucesso.");
    } else {
      formElement.reset();
      setMessage("Registro corporal criado com sucesso.");
    }

    await loadRecords(selectedPatientId);
  }

  async function handleDelete(record: BodyRecord) {
    const confirmed = window.confirm(`Excluir registro de ${formatDate(record.date)}?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(record.id);
    setMessage(null);

    const response = await fetch(`/api/body-records/${record.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel excluir o registro.");
      return;
    }

    if (editingRecord?.id === record.id) {
      setEditingRecord(null);
    }

    setMessage("Registro excluido com sucesso.");
    await loadRecords(selectedPatientId);
  }

  return (
    <section className="workspace-grid">
      <div className="surface body-record-list">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Historico</span>
            <h2>Medidas corporais</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo da evolucao">
            <span>{records.length} registros</span>
            <span>{latestRecord ? `${toNumber(latestRecord.weightKg).toFixed(1)} kg atual` : "sem peso"}</span>
          </div>
        </div>

        <label className="search-field">
          <span>Paciente</span>
          <select
            className="inline-select"
            value={selectedPatientId}
            onChange={(event) => {
              setSelectedPatientId(event.target.value);
              setEditingRecord(null);
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

        <div className="metric-strip">
          <div>
            <strong>{latestRecord ? toNumber(latestRecord.weightKg).toFixed(1) : "-"}</strong>
            <span>Peso atual kg</span>
          </div>
          <div>
            <strong>{weightDelta === null ? "-" : `${weightDelta >= 0 ? "+" : ""}${weightDelta.toFixed(1)}`}</strong>
            <span>Delta kg</span>
          </div>
          <div>
            <strong>{latestRecord ? valueOrDash(latestRecord.bodyFatPct) : "-"}</strong>
            <span>Gordura %</span>
          </div>
          <div>
            <strong>{latestRecord ? valueOrDash(latestRecord.waistCm) : "-"}</strong>
            <span>Cintura cm</span>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Paciente</th>
                <th>Peso</th>
                <th>Medidas</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className={editingRecord?.id === record.id ? "selected-row" : undefined}>
                  <td>
                    <strong>{formatDate(record.date)}</strong>
                    <span>{record.notes || "Sem observacoes"}</span>
                  </td>
                  <td>{record.patient.name}</td>
                  <td>
                    <strong>{valueOrDash(record.weightKg)} kg</strong>
                    <span>{valueOrDash(record.bodyFatPct)}% gordura</span>
                  </td>
                  <td>
                    <strong>Cintura {valueOrDash(record.waistCm)} cm</strong>
                    <span>Quadril {valueOrDash(record.hipCm)} cm</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => {
                          setEditingRecord(record);
                          setSelectedPatientId(record.patientId);
                          setMessage(null);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="text-button danger"
                        type="button"
                        disabled={deletingId === record.id}
                        onClick={() => void handleDelete(record)}
                      >
                        {deletingId === record.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Nenhum registro corporal encontrado.
                  </td>
                </tr>
              ) : null}

              {loading ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Carregando evolucao...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">{editing ? "Edicao" : "Novo registro"}</span>
        <h2>{editing ? "Editar medidas" : "Registrar medidas"}</h2>
        <form key={editingRecord?.id || "new"} className="form compact-form" onSubmit={handleSubmit}>
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
            Data
            <input name="date" type="date" required defaultValue={formatDateInput(editingRecord?.date) || formatDateInput(new Date().toISOString())} />
          </label>
          <div className="form-row">
            <label>
              Peso kg
              <input name="weightKg" type="number" min="1" step="0.01" defaultValue={valueForInput(editingRecord?.weightKg)} />
            </label>
            <label>
              Gordura %
              <input name="bodyFatPct" type="number" min="0" max="100" step="0.01" defaultValue={valueForInput(editingRecord?.bodyFatPct)} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Cintura cm
              <input name="waistCm" type="number" min="1" step="0.01" defaultValue={valueForInput(editingRecord?.waistCm)} />
            </label>
            <label>
              Quadril cm
              <input name="hipCm" type="number" min="1" step="0.01" defaultValue={valueForInput(editingRecord?.hipCm)} />
            </label>
          </div>
          <label>
            Observacoes
            <textarea name="notes" rows={4} placeholder="Observacoes da avaliacao" defaultValue={editingRecord?.notes || ""} />
          </label>
          <button className="button" type="submit" disabled={saving || !selectedPatientId}>
            {saving ? "Salvando..." : editing ? "Salvar alteracoes" : "Registrar evolucao"}
          </button>
          {!selectedPatientId ? <p className="form-message error">Selecione um paciente.</p> : null}
          {editing ? (
            <button className="button secondary" type="button" onClick={() => setEditingRecord(null)}>
              Cancelar edicao
            </button>
          ) : null}
        </form>
      </aside>
    </section>
  );
}

function getBodyRecordPayload(form: FormData, selectedPatientId: string) {
  const date = String(form.get("date") || "");
  const weightKg = String(form.get("weightKg") || "");
  const bodyFatPct = String(form.get("bodyFatPct") || "");
  const waistCm = String(form.get("waistCm") || "");
  const hipCm = String(form.get("hipCm") || "");

  return {
    patientId: form.get("patientId") || selectedPatientId,
    date: date ? new Date(`${date}T00:00:00.000`).toISOString() : "",
    weightKg: weightKg || undefined,
    bodyFatPct: bodyFatPct || undefined,
    waistCm: waistCm || undefined,
    hipCm: hipCm || undefined,
    notes: form.get("notes")
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function formatDateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function valueForInput(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function valueOrDash(value: string | number | null | undefined) {
  return value === null || value === undefined ? "-" : toNumber(value).toFixed(1);
}

function toNumber(value: string | number | null | undefined) {
  return Number(value || 0);
}
