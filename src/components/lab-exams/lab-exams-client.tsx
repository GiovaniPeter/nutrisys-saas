"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type PatientOption = {
  id: string;
  name: string;
};

type LabResult = {
  id: string;
  category: string;
  name: string;
  value: string | number;
  unit: string;
  referenceRange: string | null;
  interpretation: string | null;
};

type DraftResult = {
  id: string;
  category: string;
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  interpretation: string;
};

type LabExam = {
  id: string;
  patientId: string;
  examDate: string;
  laboratoryName: string | null;
  notes: string | null;
  createdAt: string;
  patient: PatientOption;
  results: LabResult[];
};

type PatientsResponse = {
  patients: PatientOption[];
};

type LabExamsResponse = {
  labExams: LabExam[];
};

const examCatalog = [
  { category: "Hemograma", name: "Hemoglobina", unit: "g/dL", referenceRange: "12.0-17.5" },
  { category: "Hemograma", name: "Hematocrito", unit: "%", referenceRange: "36-50" },
  { category: "Hemograma", name: "Leucocitos", unit: "/mm3", referenceRange: "4.000-11.000" },
  { category: "Perfil lipidico", name: "Colesterol total", unit: "mg/dL", referenceRange: "<190" },
  { category: "Perfil lipidico", name: "HDL", unit: "mg/dL", referenceRange: ">40" },
  { category: "Perfil lipidico", name: "LDL", unit: "mg/dL", referenceRange: "<130" },
  { category: "Perfil lipidico", name: "Triglicerideos", unit: "mg/dL", referenceRange: "<150" },
  { category: "Glicemia", name: "Glicose em jejum", unit: "mg/dL", referenceRange: "70-99" },
  { category: "Glicemia", name: "Hemoglobina glicada", unit: "%", referenceRange: "<5.7" },
  { category: "Glicemia", name: "Insulina em jejum", unit: "uU/mL", referenceRange: "2.6-24.9" },
  { category: "Funcao hepatica", name: "TGO (AST)", unit: "U/L", referenceRange: "10-40" },
  { category: "Funcao hepatica", name: "TGP (ALT)", unit: "U/L", referenceRange: "10-41" },
  { category: "Funcao renal", name: "Ureia", unit: "mg/dL", referenceRange: "15-40" },
  { category: "Funcao renal", name: "Creatinina", unit: "mg/dL", referenceRange: "0.6-1.3" },
  { category: "Tireoide", name: "TSH", unit: "mUI/L", referenceRange: "0.4-4.0" },
  { category: "Tireoide", name: "T4 livre", unit: "ng/dL", referenceRange: "0.8-1.8" },
  { category: "Vitaminas e minerais", name: "Vitamina D 25-OH", unit: "ng/mL", referenceRange: "30-100" },
  { category: "Vitaminas e minerais", name: "Vitamina B12", unit: "pg/mL", referenceRange: "200-900" },
  { category: "Vitaminas e minerais", name: "Ferritina", unit: "ng/mL", referenceRange: "13-400" },
  { category: "Inflamacao", name: "PCR", unit: "mg/L", referenceRange: "<3.0" }
];

export function LabExamsClient() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [labExams, setLabExams] = useState<LabExam[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(() => searchParams.get("patientId") || "");
  const [editingExam, setEditingExam] = useState<LabExam | null>(null);
  const [selectedPreset, setSelectedPreset] = useState("");
  const [results, setResults] = useState<DraftResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editing = Boolean(editingExam);
  const latestExam = labExams[0] || null;
  const repeatedResults = useMemo(() => buildRepeatedResults(labExams), [labExams]);

  useEffect(() => {
    void loadPatients();
  }, []);

  useEffect(() => {
    void loadLabExams(selectedPatientId);
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

  async function loadLabExams(patientId = "") {
    setLoading(true);
    const params = new URLSearchParams();

    if (patientId) {
      params.set("patientId", patientId);
    }

    const response = await fetch(`/api/lab-exams${params.size ? `?${params}` : ""}`);
    const data = (await response.json()) as LabExamsResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar exames.");
      return;
    }

    setLabExams(data.labExams);
  }

  function addPresetResult() {
    const preset = examCatalog.find((exam) => presetKey(exam) === selectedPreset);

    if (!preset) {
      setMessage("Selecione um exame comum para adicionar.");
      return;
    }

    setResults((current) => [...current, { id: crypto.randomUUID(), value: "", interpretation: "", ...preset }]);
    setSelectedPreset("");
    setMessage(null);
  }

  function addManualResult() {
    setResults((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        category: "Outro",
        name: "",
        value: "",
        unit: "",
        referenceRange: "",
        interpretation: ""
      }
    ]);
  }

  function updateResult(resultId: string, patch: Partial<DraftResult>) {
    setResults((current) => current.map((result) => (result.id === resultId ? { ...result, ...patch } : result)));
  }

  function removeResult(resultId: string) {
    setResults((current) => current.filter((result) => result.id !== resultId));
  }

  function startEditing(exam: LabExam) {
    setEditingExam(exam);
    setSelectedPatientId(exam.patientId);
    setResults(
      exam.results.map((result) => ({
        id: result.id,
        category: result.category,
        name: result.name,
        value: String(result.value),
        unit: result.unit,
        referenceRange: result.referenceRange || "",
        interpretation: result.interpretation || ""
      }))
    );
    setMessage(null);
  }

  function cancelEditing() {
    setEditingExam(null);
    setResults([]);
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validResults = results.filter((result) => result.name.trim() && result.value !== "");

    if (validResults.length === 0) {
      setMessage("Adicione pelo menos um resultado preenchido.");
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = getLabExamPayload(form, selectedPatientId, validResults);

    setSaving(true);
    setMessage(null);

    const response = await fetch(editingExam ? `/api/lab-exams/${editingExam.id}` : "/api/lab-exams", {
      method: editingExam ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel salvar os exames.");
      return;
    }

    formElement.reset();
    setResults([]);
    setEditingExam(null);
    setMessage(editingExam ? "Exames atualizados com sucesso." : "Exames registrados com sucesso.");
    await loadLabExams(selectedPatientId);
  }

  async function handleDelete(exam: LabExam) {
    const confirmed = window.confirm(`Excluir exames de ${exam.patient.name} em ${formatDate(exam.examDate)}?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(exam.id);
    setMessage(null);

    const response = await fetch(`/api/lab-exams/${exam.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel excluir os exames.");
      return;
    }

    if (editingExam?.id === exam.id) {
      cancelEditing();
    }

    setMessage("Registro de exames excluido.");
    await loadLabExams(selectedPatientId);
  }

  return (
    <section className="workspace-grid">
      <div className="surface lab-exam-list">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Historico</span>
            <h2>Registros laboratoriais</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo dos exames">
            <span>{labExams.length} coletas</span>
            <span>{latestExam ? formatDate(latestExam.examDate) : "sem exames"}</span>
          </div>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <label className="search-field">
          <span>Paciente</span>
          <select
            className="inline-select"
            value={selectedPatientId}
            onChange={(event) => {
              setSelectedPatientId(event.target.value);
              setEditingExam(null);
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

        {repeatedResults.length > 0 ? (
          <div className="metric-strip lab-trend-strip">
            {repeatedResults.slice(0, 4).map((result) => (
              <div key={result.name}>
                <strong>{formatNumber(result.latest.value)}</strong>
                <span>
                  {result.name} {result.trend}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="plan-list">
          {labExams.map((exam) => {
            const categories = Array.from(new Set(exam.results.map((result) => result.category)));

            return (
              <article className="plan-card" key={exam.id}>
                <div>
                  <span className="status-pill ok">{exam.results.length} resultados</span>
                  <h3>{exam.patient.name}</h3>
                  <p>
                    {formatDate(exam.examDate)}
                    {exam.laboratoryName ? ` - ${exam.laboratoryName}` : ""}
                  </p>
                </div>
                <div className="macro-grid">
                  {categories.slice(0, 4).map((category) => (
                    <span key={category}>{category}</span>
                  ))}
                </div>
                <div className="answer-preview">
                  {exam.results.slice(0, 6).map((result) => (
                    <div key={result.id}>
                      <strong>{result.name}</strong>
                      <span>
                        {formatNumber(result.value)} {result.unit} {result.referenceRange ? `- ref. ${result.referenceRange}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="row-actions">
                  <button className="text-button" type="button" onClick={() => startEditing(exam)}>
                    Editar
                  </button>
                  <button
                    className="text-button danger"
                    type="button"
                    disabled={deletingId === exam.id}
                    onClick={() => void handleDelete(exam)}
                  >
                    {deletingId === exam.id ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </article>
            );
          })}

          {!loading && labExams.length === 0 ? <p className="empty-card">Nenhum exame registrado.</p> : null}
          {loading ? <p className="empty-card">Carregando exames...</p> : null}
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">{editing ? "Edicao" : "Nova coleta"}</span>
        <h2>{editing ? "Editar exames" : "Registrar exames"}</h2>
        <form key={editingExam?.id || "new"} className="form compact-form" onSubmit={handleSubmit}>
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
            Data dos exames
            <input name="examDate" type="date" required defaultValue={formatDateInput(editingExam?.examDate) || formatDateInput(new Date().toISOString())} />
          </label>
          <label>
            Laboratorio
            <input name="laboratoryName" placeholder="Nome do laboratorio" defaultValue={editingExam?.laboratoryName || ""} />
          </label>

          <div className="item-builder">
            <label>
              Exame comum
              <select value={selectedPreset} onChange={(event) => setSelectedPreset(event.target.value)}>
                <option value="">Selecione para adicionar</option>
                {examCatalog.map((exam) => (
                  <option key={presetKey(exam)} value={presetKey(exam)}>
                    {exam.category} - {exam.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-row">
              <button className="button secondary" type="button" onClick={addPresetResult}>
                Adicionar comum
              </button>
              <button className="button secondary" type="button" onClick={addManualResult}>
                Adicionar manual
              </button>
            </div>
          </div>

          <div className="selected-items lab-result-editor">
            {results.map((result) => (
              <div className="lab-result-row" key={result.id}>
                <div className="form-row">
                  <label>
                    Categoria
                    <input value={result.category} onChange={(event) => updateResult(result.id, { category: event.target.value })} />
                  </label>
                  <label>
                    Exame
                    <input value={result.name} onChange={(event) => updateResult(result.id, { name: event.target.value })} />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Resultado
                    <input type="number" step="any" value={result.value} onChange={(event) => updateResult(result.id, { value: event.target.value })} />
                  </label>
                  <label>
                    Unidade
                    <input value={result.unit} onChange={(event) => updateResult(result.id, { unit: event.target.value })} />
                  </label>
                </div>
                <label>
                  Referencia
                  <input value={result.referenceRange} onChange={(event) => updateResult(result.id, { referenceRange: event.target.value })} />
                </label>
                <label>
                  Interpretacao
                  <input
                    value={result.interpretation}
                    onChange={(event) => updateResult(result.id, { interpretation: event.target.value })}
                    placeholder="Opcional: adequado, atencao, suplementar..."
                  />
                </label>
                <button className="text-button danger" type="button" onClick={() => removeResult(result.id)}>
                  Remover resultado
                </button>
              </div>
            ))}
            {results.length === 0 ? <p>Nenhum resultado adicionado.</p> : null}
          </div>

          <label>
            Observacoes
            <textarea name="notes" rows={4} placeholder="Observacoes do laboratorio ou interpretacao clinica" defaultValue={editingExam?.notes || ""} />
          </label>
          <button className="button" type="submit" disabled={saving || !selectedPatientId}>
            {saving ? "Salvando..." : editing ? "Salvar alteracoes" : "Salvar exames"}
          </button>
          {!selectedPatientId ? <p className="form-message error">Selecione um paciente.</p> : null}
          {editing ? (
            <button className="button secondary" type="button" onClick={cancelEditing}>
              Cancelar edicao
            </button>
          ) : null}
        </form>
      </aside>
    </section>
  );
}

function getLabExamPayload(form: FormData, selectedPatientId: string, results: DraftResult[]) {
  const examDate = String(form.get("examDate") || "");

  return {
    patientId: form.get("patientId") || selectedPatientId,
    examDate: examDate ? new Date(`${examDate}T00:00:00.000`).toISOString() : "",
    laboratoryName: form.get("laboratoryName"),
    notes: form.get("notes"),
    results: results.map((result) => ({
      category: result.category.trim(),
      name: result.name.trim(),
      value: result.value,
      unit: result.unit.trim(),
      referenceRange: result.referenceRange.trim(),
      interpretation: result.interpretation.trim()
    }))
  };
}

function buildRepeatedResults(exams: LabExam[]) {
  const grouped = new Map<string, Array<{ date: string; value: number }>>();

  exams.forEach((exam) => {
    exam.results.forEach((result) => {
      const values = grouped.get(result.name) || [];
      values.push({ date: exam.examDate, value: Number(result.value) });
      grouped.set(result.name, values);
    });
  });

  return Array.from(grouped.entries())
    .map(([name, values]) => ({
      name,
      values: values.sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    }))
    .filter((entry) => entry.values.length > 1)
    .map((entry) => {
      const first = entry.values[0];
      const latest = entry.values[entry.values.length - 1];
      const trend = latest.value > first.value ? "subiu" : latest.value < first.value ? "caiu" : "estavel";

      return {
        name: entry.name,
        latest,
        trend
      };
    });
}

function presetKey(exam: Pick<DraftResult, "category" | "name">) {
  return `${exam.category}|${exam.name}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function formatDateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function formatNumber(value: string | number) {
  return Number(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 3
  });
}
