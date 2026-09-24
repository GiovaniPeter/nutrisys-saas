"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Sex = "MALE" | "FEMALE" | "OTHER" | "UNINFORMED";
type EnergyFormula =
  | "Harris-Benedict"
  | "Mifflin-St Jeor"
  | "FAO/OMS"
  | "Cunningham (1980)"
  | "Katch-McArdle"
  | "Tinsley (2018)";

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

const formulas: EnergyFormula[] = [
  "Mifflin-St Jeor",
  "Harris-Benedict",
  "FAO/OMS",
  "Cunningham (1980)",
  "Katch-McArdle",
  "Tinsley (2018)"
];

const activityFactors = [
  { value: 1.2, label: "Sedentário (1.20)", detail: "Trabalho de escritório, sem exercício regular" },
  { value: 1.375, label: "Levemente ativo (1.375)", detail: "Exercício leve 1–3x/semana" },
  { value: 1.55, label: "Moderadamente ativo (1.55)", detail: "Treino moderado 3–5x/semana" },
  { value: 1.725, label: "Muito ativo (1.725)", detail: "Treino intenso 6–7x/semana" },
  { value: 1.9, label: "Atleta / Extremo (1.90)", detail: "Treino duplo ou rotina física pesada" }
];

const metModalities = [
  { label: "Sem treino adicional calculado por MET", met: 0 },
  { label: "Musculação hipertrofia moderada (5.0 METs)", met: 5.0 },
  { label: "Musculação intensa / alta carga (6.0 METs)", met: 6.0 },
  { label: "Crossfit / Funcional alta intensidade (8.0 METs)", met: 8.0 },
  { label: "Corrida 8 km/h (8.3 METs)", met: 8.3 },
  { label: "Corrida 10 km/h (10.0 METs)", met: 10.0 },
  { label: "Ciclismo moderado / Spinning (7.5 METs)", met: 7.5 },
  { label: "Natação moderada a vigorosa (8.0 METs)", met: 8.0 },
  { label: "Caminhada acelerada 6 km/h (4.3 METs)", met: 4.3 },
  { label: "Lutas / Jiu-Jitsu / Muay Thai (7.8 METs)", met: 7.8 }
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
  const [bodyFatPct, setBodyFatPct] = useState("22");
  const [activityFactor, setActivityFactor] = useState("1.55");
  const [selectedMet, setSelectedMet] = useState("0");
  const [exerciseMinutes, setExerciseMinutes] = useState("60");

  // Macro target planner (g/kg)
  const [proteinGPerKg, setProteinGPerKg] = useState("2.0");
  const [carbsGPerKg, setCarbsGPerKg] = useState("3.0");
  const [fatGPerKg, setFatGPerKg] = useState("0.9");

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
    const parsedFatPct = Number(bodyFatPct) || 0;
    const metVal = Number(selectedMet) || 0;
    const mins = Number(exerciseMinutes) || 0;

    if (!parsedAge || !parsedWeight || !parsedHeight || !parsedActivity) return null;

    const leanBodyMassKg =
      parsedFatPct > 2 && parsedFatPct < 70
        ? Number((parsedWeight * (1 - parsedFatPct / 100)).toFixed(2))
        : Number((parsedWeight * (sex === "MALE" ? 0.82 : 0.75)).toFixed(2));

    const extraExerciseKcal =
      metVal > 0 && mins > 0 ? Math.round(metVal * parsedWeight * (mins / 60)) : 0;

    const basalMetabolicRate = calculateBmr(
      formula,
      sex,
      parsedWeight,
      parsedHeight,
      parsedAge,
      leanBodyMassKg
    );
    const totalEnergyExpenditure = basalMetabolicRate * parsedActivity + extraExerciseKcal;

    const comparison = formulas.map((item) => {
      const bmr = calculateBmr(item, sex, parsedWeight, parsedHeight, parsedAge, leanBodyMassKg);
      return {
        formula: item,
        basalMetabolicRate: bmr,
        totalEnergyExpenditure: bmr * parsedActivity + extraExerciseKcal
      };
    });

    const pG = Math.round((Number(proteinGPerKg) || 0) * parsedWeight);
    const cG = Math.round((Number(carbsGPerKg) || 0) * parsedWeight);
    const fG = Math.round((Number(fatGPerKg) || 0) * parsedWeight);
    const plannedKcal = pG * 4 + cG * 4 + fG * 9;
    const pPct = plannedKcal > 0 ? Math.round(((pG * 4) / plannedKcal) * 100) : 0;
    const cPct = plannedKcal > 0 ? Math.round(((cG * 4) / plannedKcal) * 100) : 0;
    const fPct = plannedKcal > 0 ? Math.max(0, 100 - pPct - cPct) : 0;

    return {
      basalMetabolicRate,
      totalEnergyExpenditure,
      leanBodyMassKg,
      extraExerciseKcal,
      comparison,
      macros: { pG, cG, fG, plannedKcal, pPct, cPct, fPct }
    };
  }, [
    activityFactor,
    age,
    bodyFatPct,
    carbsGPerKg,
    exerciseMinutes,
    fatGPerKg,
    formula,
    heightCm,
    proteinGPerKg,
    selectedMet,
    sex,
    weightKg
  ]);

  useEffect(() => {
    void loadPatients();
    void loadCalculations();
  }, []);

  function applyPatientDefaults(patientId: string, sourcePatients = patients) {
    const patient = sourcePatients.find((item) => item.id === patientId);
    if (!patient) return;

    if (patient.sex === "MALE" || patient.sex === "FEMALE") {
      setSex(patient.sex);
    }

    if (patient.birthDate) {
      setAge(String(calculateAge(patient.birthDate)));
    }

    if (patient.weightKg !== null && patient.weightKg !== undefined) {
      setWeightKg(String(Number(patient.weightKg)));
    }

    if (patient.heightCm !== null && patient.heightCm !== undefined) {
      setHeightCm(String(Number(patient.heightCm)));
    }
  }

  async function loadPatients() {
    const response = await fetch("/api/patients");
    const data = (await response.json()) as PatientsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Não foi possível carregar pacientes.");
      return;
    }

    setPatients(data.patients);
    if (data.patients[0]) {
      setSelectedPatientId(data.patients[0].id);
      applyPatientDefaults(data.patients[0].id, data.patients);
    }
  }

  async function loadCalculations(patientId = "") {
    setLoading(true);
    const params = new URLSearchParams();
    if (patientId) params.set("patientId", patientId);

    const response = await fetch(`/api/energy-calculations${params.size ? `?${params}` : ""}`);
    const data = (await response.json()) as CalculationsResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível carregar cálculos.");
      return;
    }

    setCalculations(data.calculations);
  }

  function appendMacrosToNotes() {
    if (!preview) return;
    const line = `[Meta Nutricional: ${preview.macros.plannedKcal} kcal | PTN: ${proteinGPerKg}g/kg (${preview.macros.pG}g / ${preview.macros.pPct}%) | CHO: ${carbsGPerKg}g/kg (${preview.macros.cG}g / ${preview.macros.cPct}%) | LIP: ${fatGPerKg}g/kg (${preview.macros.fG}g / ${preview.macros.fPct}%) | MLG: ${preview.leanBodyMassKg}kg]`;
    setNotes((prev) => (prev ? `${prev}\n${line}` : line));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPatientId) return;

    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/energy-calculations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: selectedPatientId,
        formula,
        sex,
        age: Number(age),
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        activityFactor: Number(activityFactor),
        leanBodyMassKg: preview?.leanBodyMassKg,
        extraExerciseKcal: preview?.extraExerciseKcal || 0,
        notes
      })
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível salvar cálculo.");
      return;
    }

    setNotes("");
    setMessage("Cálculo energético e planejamento de macros salvos com sucesso.");
    await loadCalculations(selectedPatientId);
  }

  async function handleDelete(calculation: EnergyCalculation) {
    if (!window.confirm(`Excluir cálculo de ${calculation.patient.name}?`)) return;

    setDeletingId(calculation.id);
    setMessage(null);

    const response = await fetch(`/api/energy-calculations/${calculation.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível excluir cálculo.");
      return;
    }

    setMessage("Cálculo excluído.");
    await loadCalculations(selectedPatientId);
  }

  return (
    <section className="workspace-grid">
      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Fórmulas Clínicas & Esportivas (Cunningham / Tinsley / Katch-McArdle)</span>
            <h2>Simulador de TMB, GET (METs) e Metas em g/kg</h2>
          </div>
          {selectedPatient ? (
            <div className="mini-stats">
              <span>{selectedPatient.name}</span>
              <span>{calculations.length} cálculos</span>
            </div>
          ) : null}
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        {preview ? (
          <>
            <div className="metric-strip">
              <div>
                <strong>{Math.round(preview.basalMetabolicRate)} kcal</strong>
                <span>TMB ({formula})</span>
              </div>
              <div>
                <strong>{Math.round(preview.totalEnergyExpenditure)} kcal</strong>
                <span>GET Total (+{preview.extraExerciseKcal} kcal MET)</span>
              </div>
              <div>
                <strong>{preview.leanBodyMassKg} kg</strong>
                <span>Massa Livre de Gordura (MLG)</span>
              </div>
              <div>
                <strong>{preview.macros.plannedKcal} kcal</strong>
                <span>Meta Planejada ({preview.macros.pPct}P / {preview.macros.cPct}C / {preview.macros.fPct}G)</span>
              </div>
            </div>

            {/* Planejador de Macros g/kg estilo Dietbox */}
            <div
              style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)",
                border: "1px solid #bbf7d0",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "18px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                <strong style={{ color: "#065f46", fontSize: "0.95rem" }}>
                  🎯 Planejador de Macronutrientes por g/kg de Peso ({weightKg || 0} kg)
                </strong>
                <button
                  type="button"
                  className="text-button"
                  style={{ fontWeight: 700, color: "#059669" }}
                  onClick={appendMacrosToNotes}
                >
                  + Inserir Meta de Macros nas Observações
                </button>
              </div>

              <div className="form-row" style={{ marginBottom: "12px" }}>
                <label>
                  Proteína (g/kg) — <strong>{preview.macros.pG}g ({preview.macros.pPct}% VET)</strong>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="4.5"
                    value={proteinGPerKg}
                    onChange={(e) => setProteinGPerKg(e.target.value)}
                  />
                </label>
                <label>
                  Carboidrato (g/kg) — <strong>{preview.macros.cG}g ({preview.macros.cPct}% VET)</strong>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="10"
                    value={carbsGPerKg}
                    onChange={(e) => setCarbsGPerKg(e.target.value)}
                  />
                </label>
                <label>
                  Lipídios (g/kg) — <strong>{preview.macros.fG}g ({preview.macros.fPct}% VET)</strong>
                  <input
                    type="number"
                    step="0.1"
                    min="0.3"
                    max="3.0"
                    value={fatGPerKg}
                    onChange={(e) => setFatGPerKg(e.target.value)}
                  />
                </label>
              </div>

              {/* Barra visual de distribuição % VET */}
              <div style={{ height: "12px", borderRadius: "999px", overflow: "hidden", display: "flex", background: "#e2e8f0" }}>
                <div style={{ width: `${preview.macros.pPct}%`, background: "#059669" }} title={`Proteínas: ${preview.macros.pPct}%`} />
                <div style={{ width: `${preview.macros.cPct}%`, background: "#0284c7" }} title={`Carboidratos: ${preview.macros.cPct}%`} />
                <div style={{ width: `${preview.macros.fPct}%`, background: "#d97706" }} title={`Lipídios: ${preview.macros.fPct}%`} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#475569", marginTop: "6px", fontWeight: 600 }}>
                <span style={{ color: "#059669" }}>● Proteínas: {preview.macros.pG}g ({preview.macros.pPct}%)</span>
                <span style={{ color: "#0284c7" }}>● Carboidratos: {preview.macros.cG}g ({preview.macros.cPct}%)</span>
                <span style={{ color: "#d97706" }}>● Lipídios: {preview.macros.fG}g ({preview.macros.fPct}%)</span>
                <span>Meta Hidratação (35ml/kg): <strong>{Math.round(Number(weightKg) * 35)} ml/dia</strong></span>
              </div>
            </div>
          </>
        ) : (
          <p className="empty-hint">Preencha peso, altura e idade ao lado para comparar todas as 6 equações clínicas e esportivas.</p>
        )}

        {preview ? (
          <div className="formula-comparison" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: "10px", marginBottom: "20px" }}>
            {preview.comparison.map((item) => (
              <button
                key={item.formula}
                type="button"
                className={item.formula === formula ? "formula-card active" : "formula-card"}
                onClick={() => setFormula(item.formula)}
              >
                <span>{item.formula}</span>
                <strong>{Math.round(item.basalMetabolicRate)} kcal TMB</strong>
                <small>{Math.round(item.totalEnergyExpenditure)} kcal GET</small>
              </button>
            ))}
          </div>
        ) : null}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Paciente</th>
                <th>Equação</th>
                <th>TMB</th>
                <th>GET</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {calculations.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{formatDate(item.createdAt)}</strong>
                    <span>{item.notes || `FA ${Number(item.activityFactor).toFixed(2)}`}</span>
                  </td>
                  <td>{item.patient.name}</td>
                  <td>
                    <strong>{item.formula}</strong>
                    <span>{item.sex === "MALE" ? "Masculino" : "Feminino"}, {item.age} anos</span>
                  </td>
                  <td>
                    <strong>{Math.round(Number(item.basalMetabolicRate))} kcal</strong>
                    <span>{Number(item.weightKg).toFixed(1)} kg</span>
                  </td>
                  <td>
                    <strong>{Math.round(Number(item.totalEnergyExpenditure))} kcal</strong>
                    <span>{Number(item.heightCm).toFixed(0)} cm</span>
                  </td>
                  <td>
                    <button
                      className="text-button danger"
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => void handleDelete(item)}
                    >
                      {deletingId === item.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && calculations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    Nenhum cálculo energético registrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">Cálculo Clínico & Esportivo</span>
        <h2>Calcular TMB & GET</h2>
        <form className="form compact-form" onSubmit={handleSubmit}>
          <label>
            Paciente
            <select
              value={selectedPatientId}
              onChange={(event) => {
                setSelectedPatientId(event.target.value);
                applyPatientDefaults(event.target.value);
                void loadCalculations(event.target.value);
              }}
              required
            >
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
              Equação Principal
              <select value={formula} onChange={(event) => setFormula(event.target.value as EnergyFormula)}>
                {formulas.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sexo Biológico
              <select value={sex} onChange={(event) => setSex(event.target.value as "MALE" | "FEMALE")}>
                <option value="FEMALE">Feminino</option>
                <option value="MALE">Masculino</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Idade (anos)
              <input type="number" min="1" max="120" required value={age} onChange={(event) => setAge(event.target.value)} />
            </label>
            <label>
              Peso (kg)
              <input type="number" min="10" max="400" step="0.1" required value={weightKg} onChange={(event) => setWeightKg(event.target.value)} />
            </label>
          </div>

          <div className="form-row">
            <label>
              Altura (cm)
              <input type="number" min="50" max="250" step="0.1" required value={heightCm} onChange={(event) => setHeightCm(event.target.value)} />
            </label>
            <label>
              % Gordura (p/ Cunningham/Tinsley)
              <input type="number" min="3" max="65" step="0.5" value={bodyFatPct} onChange={(event) => setBodyFatPct(event.target.value)} />
            </label>
          </div>

          <label>
            Fator de Atividade Diária (NEAT / Rotina)
            <select value={activityFactor} onChange={(event) => setActivityFactor(event.target.value)}>
              {activityFactors.map((item) => (
                <option key={item.value} value={String(item.value)}>
                  {item.label} — {item.detail}
                </option>
              ))}
            </select>
          </label>

          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px" }}>
            <strong style={{ display: "block", fontSize: "0.78rem", color: "#0f172a", marginBottom: "6px" }}>
              🏋️ Adicional de Treino Específico por METs (Opcional)
            </strong>
            <label style={{ marginBottom: "8px" }}>
              Modalidade Esportiva
              <select value={selectedMet} onChange={(e) => setSelectedMet(e.target.value)}>
                {metModalities.map((m) => (
                  <option key={m.label} value={String(m.met)}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            {Number(selectedMet) > 0 ? (
              <label>
                Duração do Treino (minutos) — <strong>+{preview?.extraExerciseKcal || 0} kcal</strong>
                <input type="number" min="10" max="300" step="5" value={exerciseMinutes} onChange={(e) => setExerciseMinutes(e.target.value)} />
              </label>
            ) : null}
          </div>

          <label>
            Observações e Meta Dietética Planejada
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Déficit calórico, superávit ou clique em '+ Inserir Meta de Macros'..."
            />
          </label>

          <button className="button" type="submit" disabled={saving || !preview || !selectedPatientId}>
            {saving ? "Salvando..." : "Salvar Cálculo Energético"}
          </button>
        </form>
      </aside>
    </section>
  );
}

function calculateBmr(
  formula: EnergyFormula,
  sex: "MALE" | "FEMALE",
  weightKg: number,
  heightCm: number,
  age: number,
  leanBodyMassKg: number
) {
  if (formula === "Cunningham (1980)") {
    return 500 + 22 * leanBodyMassKg;
  }

  if (formula === "Katch-McArdle") {
    return 370 + 21.6 * leanBodyMassKg;
  }

  if (formula === "Tinsley (2018)") {
    return 25.9 * leanBodyMassKg + 284;
  }

  if (formula === "Harris-Benedict") {
    return sex === "MALE"
      ? 66.47 + 13.75 * weightKg + 5 * heightCm - 6.76 * age
      : 655.1 + 9.56 * weightKg + 1.85 * heightCm - 4.68 * age;
  }

  if (formula === "Mifflin-St Jeor") {
    return sex === "MALE"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  if (sex === "MALE") {
    if (age < 30) return 15.3 * weightKg + 679;
    if (age < 60) return 11.6 * weightKg + 879;
    return 13.5 * weightKg + 487;
  }

  if (age < 30) return 14.7 * weightKg + 496;
  if (age < 60) return 8.7 * weightKg + 829;
  return 10.5 * weightKg + 596;
}

function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }

  return Math.max(1, age);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
