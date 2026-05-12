"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Sex = "MALE" | "FEMALE" | "OTHER" | "UNINFORMED";
type EnergyFormula = "Harris-Benedict" | "Mifflin-St Jeor" | "FAO/OMS";

type Patient = {
  id: string;
  name: string;
  birthDate: string | null;
  sex: Sex;
  heightCm: string | number | null;
  weightKg: string | number | null;
};

type EnergyCalculation = {
  id: string;
  patientId: string;
  formula: EnergyFormula;
  sex: "MALE" | "FEMALE";
  age: number;
  weightKg: string | number;
  heightCm: string | number;
  activityFactor: string | number;
  basalMetabolicRate: string | number;
  totalEnergyExpenditure: string | number;
  notes: string | null;
  createdAt: string;
  patient: Patient;
};

type PatientsResponse = {
  patients: Patient[];
};

type CalculationsResponse = {
  calculations: EnergyCalculation[];
};

const formulas: EnergyFormula[] = ["Harris-Benedict", "Mifflin-St Jeor", "FAO/OMS"];

const activityFactors = [
  { value: 1.2, label: "Sedentario", detail: "Pouco ou nenhum exercicio" },
  { value: 1.375, label: "Levemente ativo", detail: "Exercicio leve 1-3 dias/semana" },
  { value: 1.55, label: "Moderadamente ativo", detail: "Exercicio moderado 3-5 dias/semana" },
  { value: 1.725, label: "Muito ativo", detail: "Exercicio intenso 6-7 dias/semana" },
  { value: 1.9, label: "Extremamente ativo", detail: "Treino intenso ou trabalho fisico" }
];

export function EnergyClient() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [calculations, setCalculations] = useState<EnergyCalculation[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [formula, setFormula] = useState<EnergyFormula>("Mifflin-St Jeor");
  const [sex, setSex] = useState<"MALE" | "FEMALE">("FEMALE");
  const [age, setAge] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activityFactor, setActivityFactor] = useState("1.55");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) || null;

  const preview = useMemo(() => {
    const parsedAge = Number(age);
    const parsedWeight = Number(weightKg);
    const parsedHeight = Number(heightCm);
    const parsedActivity = Number(activityFactor);

    if (!parsedAge || !parsedWeight || !parsedHeight || !parsedActivity) return null;

    const basalMetabolicRate = calculateBmr(formula, sex, parsedWeight, parsedHeight, parsedAge);
    const totalEnergyExpenditure = basalMetabolicRate * parsedActivity;
    const comparison = formulas.map((item) => {
      const bmr = calculateBmr(item, sex, parsedWeight, parsedHeight, parsedAge);
      return {
        formula: item,
        basalMetabolicRate: bmr,
        totalEnergyExpenditure: bmr * parsedActivity
      };
    });

    return { basalMetabolicRate, totalEnergyExpenditure, comparison };
  }, [activityFactor, age, formula, heightCm, sex, weightKg]);

  const filteredCalculations = selectedPatientId
    ? calculations.filter((calculation) => calculation.patientId === selectedPatientId)
    : calculations;

  useEffect(() => {
    void Promise.all([loadPatients(), loadCalculations()]);
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;

    if (selectedPatient.sex === "MALE" || selectedPatient.sex === "FEMALE") {
      setSex(selectedPatient.sex);
    }

    if (selectedPatient.weightKg) setWeightKg(String(Number(selectedPatient.weightKg)));
    if (selectedPatient.heightCm) setHeightCm(String(Number(selectedPatient.heightCm)));
    if (selectedPatient.birthDate) setAge(String(calculateAge(selectedPatient.birthDate)));
  }, [selectedPatientId]);

  async function loadPatients() {
    const response = await fetch("/api/patients");
    const data = (await response.json()) as PatientsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar pacientes.");
      return;
    }

    setPatients(data.patients);
    if (data.patients[0]) {
      setSelectedPatientId(data.patients[0].id);
    }
  }

  async function loadCalculations() {
    setLoading(true);
    const response = await fetch("/api/energy-calculations");
    const data = (await response.json()) as CalculationsResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar calculos.");
      return;
    }

    setCalculations(data.calculations);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/energy-calculations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: selectedPatientId,
        formula,
        sex,
        age,
        weightKg,
        heightCm,
        activityFactor,
        notes
      })
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel salvar o calculo.");
      return;
    }

    setNotes("");
    setMessage("Calculo salvo com sucesso.");
    await loadCalculations();
  }

  async function deleteCalculation(calculation: EnergyCalculation) {
    const confirmed = window.confirm(`Excluir calculo de ${calculation.patient.name}?`);
    if (!confirmed) return;

    setDeletingId(calculation.id);
    const response = await fetch(`/api/energy-calculations/${calculation.id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel excluir o calculo.");
      return;
    }

    await loadCalculations();
  }

  function applyAsTarget(calculation: EnergyCalculation) {
    const target = Math.round(Number(calculation.totalEnergyExpenditure));
    navigator.clipboard
      .writeText(String(target))
      .then(() => setMessage(`GET de ${target} kcal copiado para usar como meta do plano.`))
      .catch(() => setMessage(`Meta sugerida: ${target} kcal.`));
  }

  return (
    <section className="workspace-grid energy-layout">
      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Historico</span>
            <h2>Calculos salvos</h2>
          </div>
          <div className="mini-stats">
            <span>{filteredCalculations.length} exibidos</span>
            <span>{calculations.length} total</span>
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
            Formula
            <select className="inline-select" value={formula} onChange={(event) => setFormula(event.target.value as EnergyFormula)}>
              {formulas.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="energy-cards">
          {filteredCalculations.map((calculation) => (
            <article className="plan-card energy-card" key={calculation.id}>
              <div className="section-title-row">
                <div>
                  <span className="status-pill">{calculation.formula}</span>
                  <h3>{calculation.patient.name}</h3>
                  <p>{formatDate(calculation.createdAt)}</p>
                </div>
                <strong>{number(calculation.totalEnergyExpenditure).toFixed(0)} kcal</strong>
              </div>

              <div className="energy-metrics">
                <div>
                  <span>TMB</span>
                  <strong>{number(calculation.basalMetabolicRate).toFixed(0)} kcal</strong>
                </div>
                <div>
                  <span>Fator</span>
                  <strong>{number(calculation.activityFactor).toLocaleString("pt-BR")}</strong>
                </div>
                <div>
                  <span>Dados</span>
                  <strong>
                    {calculation.age}a - {number(calculation.weightKg).toFixed(1)} kg
                  </strong>
                </div>
              </div>

              {calculation.notes ? <p className="record-notes">{calculation.notes}</p> : null}

              <div className="row-actions">
                <button className="text-button" type="button" onClick={() => applyAsTarget(calculation)}>
                  Copiar GET
                </button>
                <button className="text-button danger" type="button" disabled={deletingId === calculation.id} onClick={() => void deleteCalculation(calculation)}>
                  {deletingId === calculation.id ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </article>
          ))}

          {!loading && filteredCalculations.length === 0 ? <p className="empty-card">Nenhum calculo encontrado.</p> : null}
          {loading ? <p className="empty-card">Carregando calculos...</p> : null}
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">Novo calculo</span>
        <h2>{selectedPatient?.name || "Selecione um paciente"}</h2>
        <form className="form compact-form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Paciente
            <select value={selectedPatientId} required onChange={(event) => setSelectedPatientId(event.target.value)}>
              <option value="">Selecione</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </label>

          <div className="form-row">
            <label>
              Sexo
              <select value={sex} onChange={(event) => setSex(event.target.value as "MALE" | "FEMALE")}>
                <option value="FEMALE">Feminino</option>
                <option value="MALE">Masculino</option>
              </select>
            </label>
            <label>
              Idade
              <input value={age} type="number" min="1" max="120" required onChange={(event) => setAge(event.target.value)} />
            </label>
          </div>

          <div className="form-row">
            <label>
              Peso kg
              <input value={weightKg} type="number" min="10" max="400" step="0.1" required onChange={(event) => setWeightKg(event.target.value)} />
            </label>
            <label>
              Altura cm
              <input value={heightCm} type="number" min="50" max="250" step="0.1" required onChange={(event) => setHeightCm(event.target.value)} />
            </label>
          </div>

          <label>
            Formula
            <select value={formula} onChange={(event) => setFormula(event.target.value as EnergyFormula)}>
              {formulas.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            Nivel de atividade
            <select value={activityFactor} onChange={(event) => setActivityFactor(event.target.value)}>
              {activityFactors.map((factor) => (
                <option key={factor.value} value={factor.value}>
                  {factor.label} - {factor.detail}
                </option>
              ))}
            </select>
          </label>

          <label>
            Observacoes
            <textarea value={notes} rows={3} onChange={(event) => setNotes(event.target.value)} />
          </label>

          {preview ? (
            <div className="energy-preview">
              <div>
                <span>TMB</span>
                <strong>{preview.basalMetabolicRate.toFixed(0)} kcal</strong>
              </div>
              <div>
                <span>GET</span>
                <strong>{preview.totalEnergyExpenditure.toFixed(0)} kcal</strong>
              </div>
            </div>
          ) : (
            <p className="empty-card">Preencha idade, peso e altura para ver a previa.</p>
          )}

          <button className="button" type="submit" disabled={saving || !preview || !selectedPatientId}>
            {saving ? "Salvando..." : "Salvar calculo"}
          </button>
        </form>

        {preview ? (
          <div className="compact-list energy-comparison-list">
            {preview.comparison.map((item) => (
              <article key={item.formula} className={item.formula === formula ? "selected" : undefined}>
                <strong>{item.formula}</strong>
                <span>
                  TMB {item.basalMetabolicRate.toFixed(0)} kcal - GET {item.totalEnergyExpenditure.toFixed(0)} kcal
                </span>
              </article>
            ))}
          </div>
        ) : null}
      </aside>
    </section>
  );
}

function calculateBmr(formula: EnergyFormula, sex: "MALE" | "FEMALE", weightKg: number, heightCm: number, age: number) {
  const male = sex === "MALE";

  if (formula === "Harris-Benedict") {
    return male
      ? 66.5 + 13.75 * weightKg + 5.003 * heightCm - 6.755 * age
      : 655.1 + 9.563 * weightKg + 1.85 * heightCm - 4.676 * age;
  }

  if (formula === "Mifflin-St Jeor") {
    return male
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  if (male) {
    if (age < 18) return 17.5 * weightKg + 651;
    if (age < 30) return 15.3 * weightKg + 679;
    if (age < 60) return 11.6 * weightKg + 879;
    return 13.5 * weightKg + 487;
  }

  if (age < 18) return 12.2 * weightKg + 746;
  if (age < 30) return 14.7 * weightKg + 496;
  if (age < 60) return 8.7 * weightKg + 829;
  return 10.5 * weightKg + 596;
}

function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function number(value: string | number) {
  return Number(value || 0);
}
