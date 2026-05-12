"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type PatientOption = {
  id: string;
  name: string;
};

type PrescriptionItem = {
  id: string;
  name: string;
  category: string;
  dose: string;
  frequency: string | null;
  timing: string | null;
  instructions: string | null;
  position: number;
};

type DraftItem = {
  id: string;
  name: string;
  category: string;
  dose: string;
  frequency: string;
  timing: string;
  instructions: string;
  position: number;
};

type Prescription = {
  id: string;
  patientId: string;
  prescribedAt: string;
  duration: string | null;
  generalNotes: string | null;
  patient: PatientOption;
  items: PrescriptionItem[];
};

type PatientsResponse = {
  patients: PatientOption[];
};

type PrescriptionsResponse = {
  prescriptions: Prescription[];
};

const categories = [
  "Vitamina",
  "Mineral",
  "Proteina/Aminoacido",
  "Acido graxo",
  "Probiotico/Prebiotico",
  "Fitoterapico",
  "Formula manipulada",
  "Termogenico",
  "Antioxidante",
  "Adaptogeno",
  "Outro"
];

const commonSupplements = [
  { name: "Vitamina D3", category: "Vitamina", dose: "2.000 UI", frequency: "1x ao dia" },
  { name: "Vitamina C", category: "Vitamina", dose: "500 mg", frequency: "1x ao dia" },
  { name: "Vitamina B12", category: "Vitamina", dose: "1.000 mcg", frequency: "1x ao dia" },
  { name: "Zinco quelado", category: "Mineral", dose: "30 mg", frequency: "1x ao dia" },
  { name: "Magnesio dimalato", category: "Mineral", dose: "300 mg", frequency: "1x ao dia" },
  { name: "Omega 3 EPA/DHA", category: "Acido graxo", dose: "1.000 mg", frequency: "2x ao dia" },
  { name: "Whey Protein Isolado", category: "Proteina/Aminoacido", dose: "30 g", frequency: "1x ao dia" },
  { name: "Creatina monohidratada", category: "Proteina/Aminoacido", dose: "5 g", frequency: "1x ao dia" },
  { name: "Probiotico", category: "Probiotico/Prebiotico", dose: "10 bilhoes UFC", frequency: "1x ao dia" },
  { name: "Psyllium", category: "Probiotico/Prebiotico", dose: "5 g", frequency: "2x ao dia" },
  { name: "Curcumina", category: "Fitoterapico", dose: "500 mg", frequency: "1x ao dia" },
  { name: "Ashwagandha", category: "Adaptogeno", dose: "300 mg", frequency: "2x ao dia" },
  { name: "Coenzima Q10", category: "Antioxidante", dose: "100 mg", frequency: "1x ao dia" }
];

export function SupplementsClient() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(() => searchParams.get("patientId") || "");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editing = Boolean(editingPrescription);
  const categoryStats = useMemo(() => summarizeCategories(prescriptions), [prescriptions]);

  useEffect(() => {
    void loadPatients();
  }, []);

  useEffect(() => {
    void loadPrescriptions(selectedPatientId);
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

  async function loadPrescriptions(patientId = "") {
    setLoading(true);
    const params = new URLSearchParams();

    if (patientId) {
      params.set("patientId", patientId);
    }

    const response = await fetch(`/api/supplement-prescriptions${params.size ? `?${params}` : ""}`);
    const data = (await response.json()) as PrescriptionsResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar prescricoes.");
      return;
    }

    setPrescriptions(data.prescriptions);
  }

  function addPresetItem() {
    const preset = commonSupplements.find((item) => presetKey(item) === selectedPreset);

    if (!preset) {
      setMessage("Selecione um suplemento comum para adicionar.");
      return;
    }

    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: preset.name,
        category: preset.category,
        dose: preset.dose,
        frequency: preset.frequency,
        timing: "",
        instructions: "",
        position: current.length
      }
    ]);
    setSelectedPreset("");
    setMessage(null);
  }

  function addManualItem() {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        category: "Outro",
        dose: "",
        frequency: "",
        timing: "",
        instructions: "",
        position: current.length
      }
    ]);
  }

  function updateItem(itemId: string, patch: Partial<DraftItem>) {
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  }

  function removeItem(itemId: string) {
    setItems((current) => current.filter((item) => item.id !== itemId).map((item, index) => ({ ...item, position: index })));
  }

  function startEditing(prescription: Prescription) {
    setEditingPrescription(prescription);
    setSelectedPatientId(prescription.patientId);
    setItems(
      prescription.items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        dose: item.dose,
        frequency: item.frequency || "",
        timing: item.timing || "",
        instructions: item.instructions || "",
        position: item.position
      }))
    );
    setMessage(null);
  }

  function cancelEditing() {
    setEditingPrescription(null);
    setItems([]);
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validItems = items.filter((item) => item.name.trim() && item.dose.trim());

    if (validItems.length === 0) {
      setMessage("Adicione pelo menos um suplemento com nome e dosagem.");
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = getPrescriptionPayload(form, selectedPatientId, validItems);

    setSaving(true);
    setMessage(null);

    const response = await fetch(
      editingPrescription ? `/api/supplement-prescriptions/${editingPrescription.id}` : "/api/supplement-prescriptions",
      {
        method: editingPrescription ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel salvar a prescricao.");
      return;
    }

    formElement.reset();
    setItems([]);
    setEditingPrescription(null);
    setMessage(editingPrescription ? "Prescricao atualizada com sucesso." : "Prescricao criada com sucesso.");
    await loadPrescriptions(selectedPatientId);
  }

  async function handleDelete(prescription: Prescription) {
    const confirmed = window.confirm(`Excluir prescricao de ${prescription.patient.name}?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(prescription.id);
    setMessage(null);

    const response = await fetch(`/api/supplement-prescriptions/${prescription.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel excluir a prescricao.");
      return;
    }

    if (editingPrescription?.id === prescription.id) {
      cancelEditing();
    }

    setMessage("Prescricao excluida.");
    await loadPrescriptions(selectedPatientId);
  }

  return (
    <section className="workspace-grid">
      <div className="surface supplement-list">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Historico</span>
            <h2>Prescricoes registradas</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo das prescricoes">
            <span>{prescriptions.length} prescricoes</span>
            <span>{prescriptions.reduce((total, prescription) => total + prescription.items.length, 0)} itens</span>
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
              setEditingPrescription(null);
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

        {categoryStats.length > 0 ? (
          <div className="metric-strip">
            {categoryStats.slice(0, 4).map(([category, count]) => (
              <div key={category}>
                <strong>{count}</strong>
                <span>{category}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="plan-list">
          {prescriptions.map((prescription) => (
            <article className="plan-card" key={prescription.id}>
              <div>
                <span className="status-pill ok">{prescription.items.length} itens</span>
                <h3>{prescription.patient.name}</h3>
                <p>
                  {formatDate(prescription.prescribedAt)}
                  {prescription.duration ? ` - ${prescription.duration}` : ""}
                </p>
              </div>
              <div className="answer-preview">
                {prescription.items.slice(0, 6).map((item) => (
                  <div key={item.id}>
                    <strong>{item.name}</strong>
                    <span>
                      {item.dose}
                      {item.frequency ? ` - ${item.frequency}` : ""}
                    </span>
                  </div>
                ))}
              </div>
              {prescription.generalNotes ? <p>{prescription.generalNotes}</p> : null}
              <div className="row-actions">
                <button className="text-button" type="button" onClick={() => startEditing(prescription)}>
                  Editar
                </button>
                <button
                  className="text-button danger"
                  type="button"
                  disabled={deletingId === prescription.id}
                  onClick={() => void handleDelete(prescription)}
                >
                  {deletingId === prescription.id ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </article>
          ))}

          {!loading && prescriptions.length === 0 ? <p className="empty-card">Nenhuma prescricao registrada.</p> : null}
          {loading ? <p className="empty-card">Carregando prescricoes...</p> : null}
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">{editing ? "Edicao" : "Nova prescricao"}</span>
        <h2>{editing ? "Editar prescricao" : "Prescrever suplemento"}</h2>
        <form key={editingPrescription?.id || "new"} className="form compact-form" onSubmit={handleSubmit}>
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
            Data da prescricao
            <input
              name="prescribedAt"
              type="date"
              defaultValue={formatDateInput(editingPrescription?.prescribedAt) || formatDateInput(new Date().toISOString())}
            />
          </label>
          <label>
            Duracao
            <input name="duration" placeholder="Ex.: 90 dias, uso continuo" defaultValue={editingPrescription?.duration || ""} />
          </label>

          <div className="item-builder">
            <label>
              Suplemento comum
              <select value={selectedPreset} onChange={(event) => setSelectedPreset(event.target.value)}>
                <option value="">Selecione para adicionar</option>
                {commonSupplements.map((item) => (
                  <option key={presetKey(item)} value={presetKey(item)}>
                    {item.category} - {item.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-row">
              <button className="button secondary" type="button" onClick={addPresetItem}>
                Adicionar comum
              </button>
              <button className="button secondary" type="button" onClick={addManualItem}>
                Adicionar manual
              </button>
            </div>
          </div>

          <div className="selected-items supplement-editor">
            {items.map((item) => (
              <div className="lab-result-row" key={item.id}>
                <div className="form-row">
                  <label>
                    Nome
                    <input value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} />
                  </label>
                  <label>
                    Categoria
                    <select value={item.category} onChange={(event) => updateItem(item.id, { category: event.target.value })}>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Dosagem
                    <input value={item.dose} onChange={(event) => updateItem(item.id, { dose: event.target.value })} />
                  </label>
                  <label>
                    Frequencia
                    <input value={item.frequency} onChange={(event) => updateItem(item.id, { frequency: event.target.value })} />
                  </label>
                </div>
                <label>
                  Momento
                  <input value={item.timing} onChange={(event) => updateItem(item.id, { timing: event.target.value })} placeholder="Apos almoco, antes de dormir..." />
                </label>
                <label>
                  Instrucoes
                  <input value={item.instructions} onChange={(event) => updateItem(item.id, { instructions: event.target.value })} />
                </label>
                <button className="text-button danger" type="button" onClick={() => removeItem(item.id)}>
                  Remover item
                </button>
              </div>
            ))}
            {items.length === 0 ? <p>Nenhum suplemento adicionado.</p> : null}
          </div>

          <label>
            Orientacoes gerais
            <textarea name="generalNotes" rows={4} placeholder="Tomar com refeicoes, cuidados, monitoramento..." defaultValue={editingPrescription?.generalNotes || ""} />
          </label>
          <button className="button" type="submit" disabled={saving || !selectedPatientId}>
            {saving ? "Salvando..." : editing ? "Salvar alteracoes" : "Salvar prescricao"}
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

function getPrescriptionPayload(form: FormData, selectedPatientId: string, items: DraftItem[]) {
  const prescribedAt = String(form.get("prescribedAt") || "");

  return {
    patientId: form.get("patientId") || selectedPatientId,
    prescribedAt: prescribedAt ? new Date(`${prescribedAt}T00:00:00.000`).toISOString() : undefined,
    duration: form.get("duration"),
    generalNotes: form.get("generalNotes"),
    items: items.map((item, index) => ({
      name: item.name.trim(),
      category: item.category,
      dose: item.dose.trim(),
      frequency: item.frequency.trim(),
      timing: item.timing.trim(),
      instructions: item.instructions.trim(),
      position: index
    }))
  };
}

function summarizeCategories(prescriptions: Prescription[]) {
  const stats = new Map<string, number>();

  prescriptions.forEach((prescription) => {
    prescription.items.forEach((item) => {
      stats.set(item.category, (stats.get(item.category) || 0) + 1);
    });
  });

  return Array.from(stats.entries()).sort((left, right) => right[1] - left[1]);
}

function presetKey(item: Pick<DraftItem, "category" | "name">) {
  return `${item.category}|${item.name}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function formatDateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}
