"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Sex = "MALE" | "FEMALE" | "OTHER" | "UNINFORMED";
type SkinfoldProtocol = "DIRECT" | "POLLOCK_3" | "POLLOCK_7" | "GUEDES_3";

type PatientOption = {
  id: string;
  name: string;
  sex?: Sex;
  birthDate?: string | null;
  heightCm?: string | number | null;
  weightKg?: string | number | null;
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

  // Anthropometry & Skinfold states
  const [protocol, setProtocol] = useState<SkinfoldProtocol>("POLLOCK_3");
  const [evalSex, setEvalSex] = useState<"MALE" | "FEMALE">("FEMALE");
  const [evalAge, setEvalAge] = useState("30");
  const [evalHeightCm, setEvalHeightCm] = useState("165");
  const [weightInput, setWeightInput] = useState("");
  const [bodyFatInput, setBodyFatInput] = useState("");
  const [waistInput, setWaistInput] = useState("");
  const [hipInput, setHipInput] = useState("");
  const [abdomenCm, setAbdomenCm] = useState("");
  const [armRelaxedCm, setArmRelaxedCm] = useState("");
  const [armContractedCm, setArmContractedCm] = useState("");
  const [calfCm, setCalfCm] = useState("");
  const [notesInput, setNotesInput] = useState("");

  // Skinfolds (mm)
  const [tricepsMm, setTricepsMm] = useState("");
  const [subscapularMm, setSubscapularMm] = useState("");
  const [suprailiacMm, setSuprailiacMm] = useState("");
  const [abdominalMm, setAbdominalMm] = useState("");
  const [thighMm, setThighMm] = useState("");
  const [chestMm, setChestMm] = useState("");
  const [midaxillaryMm, setMidaxillaryMm] = useState("");

  const editing = Boolean(editingRecord);
  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  );

  const sortedAsc = useMemo(
    () => [...records].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()),
    [records]
  );
  const firstRecord = sortedAsc[0] || null;
  const latestRecord = sortedAsc[sortedAsc.length - 1] || null;
  const weightDelta =
    firstRecord && latestRecord ? toNumber(latestRecord.weightKg) - toNumber(firstRecord.weightKg) : null;
  const fatDelta =
    firstRecord && latestRecord && firstRecord.bodyFatPct !== null && latestRecord.bodyFatPct !== null
      ? toNumber(latestRecord.bodyFatPct) - toNumber(firstRecord.bodyFatPct)
      : null;

  useEffect(() => {
    void loadPatients();
  }, []);

  useEffect(() => {
    void loadRecords(selectedPatientId);
  }, [selectedPatientId]);

  // Sync patient sex, age, height, weight when selecting patient
  useEffect(() => {
    if (!selectedPatient) return;
    if (selectedPatient.sex === "MALE") setEvalSex("MALE");
    else if (selectedPatient.sex === "FEMALE") setEvalSex("FEMALE");

    if (selectedPatient.heightCm) setEvalHeightCm(String(toNumber(selectedPatient.heightCm)));
    if (selectedPatient.birthDate) {
      const birth = new Date(selectedPatient.birthDate);
      const years = Math.max(10, Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 3600 * 1000)));
      if (!Number.isNaN(years)) setEvalAge(String(years));
    }
    if (!editingRecord && selectedPatient.weightKg && !weightInput) {
      setWeightInput(String(toNumber(selectedPatient.weightKg)));
    }
  }, [selectedPatient, editingRecord]);

  // Sync editing record into controlled fields
  useEffect(() => {
    if (editingRecord) {
      setWeightInput(valueForInput(editingRecord.weightKg));
      setBodyFatInput(valueForInput(editingRecord.bodyFatPct));
      setWaistInput(valueForInput(editingRecord.waistCm));
      setHipInput(valueForInput(editingRecord.hipCm));
      setNotesInput(editingRecord.notes || "");
    }
  }, [editingRecord]);

  // Real-time skinfold & body composition calculation
  const compositionCalc = useMemo(() => {
    const w = Number(weightInput) || 0;
    const hCm = Number(evalHeightCm) || 0;
    const ageNum = Number(evalAge) || 30;
    const waist = Number(waistInput) || 0;
    const hip = Number(hipInput) || 0;

    const tri = Number(tricepsMm) || 0;
    const sub = Number(subscapularMm) || 0;
    const sup = Number(suprailiacMm) || 0;
    const abd = Number(abdominalMm) || 0;
    const thi = Number(thighMm) || 0;
    const che = Number(chestMm) || 0;
    const axi = Number(midaxillaryMm) || 0;

    let sumMm = 0;
    let density = 0;
    let calculatedFatPct: number | null = null;

    if (protocol === "POLLOCK_3") {
      if (evalSex === "MALE") {
        sumMm = che + abd + thi;
        if (che > 0 && abd > 0 && thi > 0) {
          density = 1.10938 - 0.0008267 * sumMm + 0.0000016 * (sumMm * sumMm) - 0.0002574 * ageNum;
        }
      } else {
        sumMm = tri + sup + thi;
        if (tri > 0 && sup > 0 && thi > 0) {
          density = 1.0994921 - 0.0009929 * sumMm + 0.0000023 * (sumMm * sumMm) - 0.0001392 * ageNum;
        }
      }
    } else if (protocol === "POLLOCK_7") {
      sumMm = che + axi + tri + sub + abd + sup + thi;
      if (sumMm > 0 && (tri > 0 || abd > 0 || sub > 0)) {
        if (evalSex === "MALE") {
          density = 1.112 - 0.00043499 * sumMm + 0.00000055 * (sumMm * sumMm) - 0.00028826 * ageNum;
        } else {
          density = 1.097 - 0.00046971 * sumMm + 0.00000056 * (sumMm * sumMm) - 0.00012828 * ageNum;
        }
      }
    } else if (protocol === "GUEDES_3") {
      if (evalSex === "MALE") {
        sumMm = tri + sup + abd;
        if (sumMm > 0) {
          density = 1.17136 - 0.06706 * Math.log10(sumMm);
        }
      } else {
        sumMm = sub + sup + thi;
        if (sumMm > 0) {
          density = 1.1665 - 0.07063 * Math.log10(sumMm);
        }
      }
    }

    if (density > 1.0) {
      const siri = (495 / density) - 450;
      if (siri > 2 && siri < 70) {
        calculatedFatPct = Number(siri.toFixed(1));
      }
    }

    const activeFatPct =
      protocol !== "DIRECT" && calculatedFatPct !== null
        ? calculatedFatPct
        : bodyFatInput
          ? Number(bodyFatInput)
          : null;

    const fatMassKg = w > 0 && activeFatPct !== null ? Number(((w * activeFatPct) / 100).toFixed(2)) : null;
    const leanMassKg = w > 0 && fatMassKg !== null ? Number((w - fatMassKg).toFixed(2)) : null;
    const bmi = w > 0 && hCm > 0 ? Number((w / Math.pow(hCm / 100, 2)).toFixed(1)) : null;
    const rcq = waist > 0 && hip > 0 ? Number((waist / hip).toFixed(2)) : null;
    const rce = waist > 0 && hCm > 0 ? Number((waist / hCm).toFixed(2)) : null;

    let bmiLabel = "-";
    if (bmi !== null) {
      if (bmi < 18.5) bmiLabel = "Baixo peso";
      else if (bmi < 25) bmiLabel = "Eutrofia (Peso ideal)";
      else if (bmi < 30) bmiLabel = "Sobrepeso";
      else if (bmi < 35) bmiLabel = "Obesidade Grau I";
      else if (bmi < 40) bmiLabel = "Obesidade Grau II";
      else bmiLabel = "Obesidade Grau III";
    }

    let rcqRisk = "-";
    if (rcq !== null) {
      if (evalSex === "MALE") {
        rcqRisk = rcq < 0.9 ? "Baixo risco CV" : rcq <= 0.99 ? "Risco moderado" : "Alto risco CV";
      } else {
        rcqRisk = rcq < 0.8 ? "Baixo risco CV" : rcq <= 0.85 ? "Risco moderado" : "Alto risco CV";
      }
    }

    return {
      sumMm: Number(sumMm.toFixed(1)),
      calculatedFatPct,
      activeFatPct,
      fatMassKg,
      leanMassKg,
      bmi,
      bmiLabel,
      rcq,
      rcqRisk,
      rce
    };
  }, [
    weightInput,
    evalHeightCm,
    evalAge,
    waistInput,
    hipInput,
    tricepsMm,
    subscapularMm,
    suprailiacMm,
    abdominalMm,
    thighMm,
    chestMm,
    midaxillaryMm,
    protocol,
    evalSex,
    bodyFatInput
  ]);

  // Automatically sync calculated fat % when skinfolds are typed
  useEffect(() => {
    if (protocol !== "DIRECT" && compositionCalc.calculatedFatPct !== null) {
      setBodyFatInput(String(compositionCalc.calculatedFatPct));
    }
  }, [protocol, compositionCalc.calculatedFatPct]);

  async function loadPatients() {
    const response = await fetch("/api/patients");
    const data = (await response.json()) as PatientsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Não foi possível carregar pacientes.");
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
      setMessage(data.error || "Não foi possível carregar evolução.");
      return;
    }

    setRecords(data.records);
  }

  function appendAnthropometrySummaryToNotes() {
    const parts: string[] = [];
    const protoLabel =
      protocol === "POLLOCK_3"
        ? "Pollock 3 Dobras"
        : protocol === "POLLOCK_7"
          ? "Pollock 7 Dobras"
          : protocol === "GUEDES_3"
            ? "Guedes 3 Dobras"
            : "Bioimpedância / Direto";

    parts.push(`[Protocolo: ${protoLabel}]`);
    if (compositionCalc.sumMm > 0) parts.push(`Σ Dobras: ${compositionCalc.sumMm} mm`);
    if (compositionCalc.activeFatPct !== null) parts.push(`%GC: ${compositionCalc.activeFatPct}%`);
    if (compositionCalc.leanMassKg !== null) parts.push(`Massa Magra: ${compositionCalc.leanMassKg} kg`);
    if (compositionCalc.fatMassKg !== null) parts.push(`Massa Gorda: ${compositionCalc.fatMassKg} kg`);
    if (compositionCalc.bmi !== null) parts.push(`IMC: ${compositionCalc.bmi} (${compositionCalc.bmiLabel})`);
    if (compositionCalc.rcq !== null) parts.push(`RCQ: ${compositionCalc.rcq} (${compositionCalc.rcqRisk})`);
    if (armRelaxedCm || armContractedCm) parts.push(`Braço R/C: ${armRelaxedCm || "-"} / ${armContractedCm || "-"} cm`);
    if (abdomenCm) parts.push(`Abdômen: ${abdomenCm} cm`);
    if (calfCm) parts.push(`Panturrilha: ${calfCm} cm`);

    const summaryLine = parts.join(" | ");
    setNotesInput((prev) => (prev ? `${prev}\n${summaryLine}` : summaryLine));
  }

  function handlePrintReport() {
    const win = window.open("", "_blank", "width=900,height=750");
    if (!win) return;
    const patientName = selectedPatient?.name || latestRecord?.patient?.name || "Paciente";
    const latestW = latestRecord ? toNumber(latestRecord.weightKg) : Number(weightInput) || 0;
    const latestFat = latestRecord?.bodyFatPct ? toNumber(latestRecord.bodyFatPct) : compositionCalc.activeFatPct || 0;
    const latestLean = latestW > 0 && latestFat > 0 ? (latestW * (1 - latestFat / 100)).toFixed(1) : "-";
    const latestFatKg = latestW > 0 && latestFat > 0 ? ((latestW * latestFat) / 100).toFixed(1) : "-";

    const rowsHtml = sortedAsc
      .map((rec) => {
        const w = toNumber(rec.weightKg);
        const bf = rec.bodyFatPct !== null ? toNumber(rec.bodyFatPct) : null;
        const fm = w > 0 && bf !== null ? ((w * bf) / 100).toFixed(1) : "-";
        const lm = w > 0 && bf !== null ? (w - (w * bf) / 100).toFixed(1) : "-";
        return `
          <tr>
            <td><strong>${formatDate(rec.date)}</strong></td>
            <td>${w ? `${w.toFixed(1)} kg` : "-"}</td>
            <td>${bf !== null ? `${bf.toFixed(1)}%` : "-"}</td>
            <td>${lm} kg</td>
            <td>${fm} kg</td>
            <td>${valueOrDash(rec.waistCm)} / ${valueOrDash(rec.hipCm)} cm</td>
            <td>${rec.notes || "-"}</td>
          </tr>
        `;
      })
      .join("");

    win.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Laudo de Avaliação Antropométrica — ${patientName}</title>
        <style>
          body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #0f172a; margin: 32px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 24px; font-weight: 800; color: #059669; }
          .subtitle { font-size: 13px; color: #475569; }
          .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
          .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; background: #f8fafc; }
          .card strong { display: block; font-size: 20px; color: #059669; }
          .card span { font-size: 12px; color: #64748b; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background: #ecfdf5; color: #065f46; font-weight: 700; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">NutriPlan — Laudo de Avaliação Antropométrica & Composição Corporal</div>
            <div class="subtitle">Paciente: <strong>${patientName}</strong> | Data de Emissão: ${new Intl.DateTimeFormat("pt-BR").format(new Date())}</div>
          </div>
          <div style="text-align:right;font-size:12px;color:#475569;">
            <strong>Avaliação Nutricional Clínica</strong><br/>Protocolos Jackson & Pollock / Guedes / OMS
          </div>
        </div>

        <div class="cards">
          <div class="card">
            <strong>${latestW ? `${latestW.toFixed(1)} kg` : "-"}</strong>
            <span>Peso Corporal Atual (${weightDelta !== null ? `${weightDelta >= 0 ? "+" : ""}${weightDelta.toFixed(1)} kg` : "Inicial"})</span>
          </div>
          <div class="card">
            <strong>${latestFat ? `${Number(latestFat).toFixed(1)}%` : "-"}</strong>
            <span>% Gordura Corporal (${fatDelta !== null ? `${fatDelta >= 0 ? "+" : ""}${fatDelta.toFixed(1)}%` : "Siri"})</span>
          </div>
          <div class="card">
            <strong>${latestLean} kg</strong>
            <span>Massa Livre de Gordura (Magra)</span>
          </div>
          <div class="card">
            <strong>${latestFatKg} kg</strong>
            <span>Massa Adiposa (Gorda)</span>
          </div>
        </div>

        <h3>Histórico Comparativo de Avaliações Físicas</h3>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Peso</th>
              <th>% Gordura</th>
              <th>Massa Magra</th>
              <th>Massa Gorda</th>
              <th>Cintura / Quadril</th>
              <th>Protocolo / Dobras e Observações</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="7">Sem avaliações registradas.</td></tr>'}
          </tbody>
        </table>

        <div class="footer">
          Documento gerado pelo NutriPlan — Software Especializado para Nutricionistas.
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
    win.document.close();
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
      setMessage(data.error || "Não foi possível salvar o registro corporal.");
      return;
    }

    if (editingRecord) {
      setEditingRecord(null);
      setMessage("Avaliação antropométrica atualizada com sucesso.");
    } else {
      setMessage("Avaliação antropométrica registrada com sucesso.");
    }

    await loadRecords(selectedPatientId);
  }

  async function handleDelete(record: BodyRecord) {
    const confirmed = window.confirm(`Excluir avaliação de ${formatDate(record.date)}?`);
    if (!confirmed) return;

    setDeletingId(record.id);
    setMessage(null);

    const response = await fetch(`/api/body-records/${record.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível excluir o registro.");
      return;
    }

    if (editingRecord?.id === record.id) {
      setEditingRecord(null);
    }

    setMessage("Registro excluído com sucesso.");
    await loadRecords(selectedPatientId);
  }

  return (
    <section className="workspace-grid">
      <div className="surface body-record-list">
        <div className="section-title-row" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="eyebrow">Antropometria & Composição Corporal</span>
            <h2>Evolução Corporal, Dobras Cutâneas & Laudo</h2>
          </div>
          <div className="row-actions" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button type="button" className="button secondary" onClick={handlePrintReport}>
              🖨️ Imprimir Laudo Antropométrico (PDF)
            </button>
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
            <option value="">Todos os pacientes</option>
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
            <strong>{latestRecord ? `${toNumber(latestRecord.weightKg).toFixed(1)} kg` : "-"}</strong>
            <span>Peso atual ({weightDelta === null ? "inicial" : `${weightDelta >= 0 ? "+" : ""}${weightDelta.toFixed(1)} kg`})</span>
          </div>
          <div>
            <strong>{latestRecord ? `${valueOrDash(latestRecord.bodyFatPct)}%` : "-"}</strong>
            <span>% Gordura ({fatDelta === null ? "Siri" : `${fatDelta >= 0 ? "+" : ""}${fatDelta.toFixed(1)}%`})</span>
          </div>
          <div>
            <strong>
              {latestRecord && latestRecord.weightKg && latestRecord.bodyFatPct
                ? `${(toNumber(latestRecord.weightKg) * (1 - toNumber(latestRecord.bodyFatPct) / 100)).toFixed(1)} kg`
                : compositionCalc.leanMassKg
                  ? `${compositionCalc.leanMassKg} kg`
                  : "-"}
            </strong>
            <span>Massa Magra (MLG)</span>
          </div>
          <div>
            <strong>
              {latestRecord && latestRecord.weightKg && latestRecord.bodyFatPct
                ? `${((toNumber(latestRecord.weightKg) * toNumber(latestRecord.bodyFatPct)) / 100).toFixed(1)} kg`
                : compositionCalc.fatMassKg
                  ? `${compositionCalc.fatMassKg} kg`
                  : "-"}
            </strong>
            <span>Massa Gorda (kg)</span>
          </div>
        </div>

        {/* Painel de Resultados Antropométricos em Tempo Real */}
        <div
          style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)",
            border: "1px solid #bbf7d0",
            borderRadius: "14px",
            padding: "16px",
            marginBottom: "18px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
            <strong style={{ color: "#065f46", fontSize: "0.95rem" }}>
              📐 Resultado Automático da Avaliação Atual ({protocol === "POLLOCK_3" ? "Jackson & Pollock 3 Dobras" : protocol === "POLLOCK_7" ? "Jackson & Pollock 7 Dobras" : protocol === "GUEDES_3" ? "Guedes 3 Dobras" : "Bioimpedância / Direto"})
            </strong>
            <button
              type="button"
              className="text-button"
              style={{ fontWeight: 700, color: "#059669" }}
              onClick={appendAnthropometrySummaryToNotes}
            >
              + Inserir Resumo Completo nas Observações
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: "10px", fontSize: "0.85rem" }}>
            <div style={{ background: "#fff", padding: "10px", borderRadius: "10px", border: "1px solid #dcfce7" }}>
              <span style={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>Soma das Dobras (Σ)</span>
              <strong style={{ fontSize: "1.05rem", color: "#0f172a" }}>{compositionCalc.sumMm > 0 ? `${compositionCalc.sumMm} mm` : "-"}</strong>
            </div>
            <div style={{ background: "#fff", padding: "10px", borderRadius: "10px", border: "1px solid #dcfce7" }}>
              <span style={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>% Gordura (Siri)</span>
              <strong style={{ fontSize: "1.05rem", color: "#059669" }}>
                {compositionCalc.activeFatPct !== null ? `${compositionCalc.activeFatPct}%` : "-"}
              </strong>
            </div>
            <div style={{ background: "#fff", padding: "10px", borderRadius: "10px", border: "1px solid #dcfce7" }}>
              <span style={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>Massa Magra / Gorda</span>
              <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                {compositionCalc.leanMassKg !== null ? `${compositionCalc.leanMassKg} kg / ${compositionCalc.fatMassKg} kg` : "-"}
              </strong>
            </div>
            <div style={{ background: "#fff", padding: "10px", borderRadius: "10px", border: "1px solid #dcfce7" }}>
              <span style={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>IMC ({compositionCalc.bmiLabel})</span>
              <strong style={{ fontSize: "1.05rem", color: "#0f172a" }}>{compositionCalc.bmi !== null ? `${compositionCalc.bmi} kg/m²` : "-"}</strong>
            </div>
            <div style={{ background: "#fff", padding: "10px", borderRadius: "10px", border: "1px solid #dcfce7" }}>
              <span style={{ color: "#64748b", display: "block", fontSize: "0.75rem" }}>RCQ ({compositionCalc.rcqRisk})</span>
              <strong style={{ fontSize: "1.05rem", color: "#0f172a" }}>{compositionCalc.rcq !== null ? compositionCalc.rcq : "-"}</strong>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Paciente</th>
                <th>Composição Corporal</th>
                <th>Perímetros</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const w = toNumber(record.weightKg);
                const bf = record.bodyFatPct !== null ? toNumber(record.bodyFatPct) : null;
                const leanKg = w > 0 && bf !== null ? (w * (1 - bf / 100)).toFixed(1) : null;
                const fatKg = w > 0 && bf !== null ? ((w * bf) / 100).toFixed(1) : null;
                return (
                  <tr key={record.id} className={editingRecord?.id === record.id ? "selected-row" : undefined}>
                    <td>
                      <strong>{formatDate(record.date)}</strong>
                      <span>{record.notes || "Sem observações"}</span>
                    </td>
                    <td>{record.patient.name}</td>
                    <td>
                      <strong>{valueOrDash(record.weightKg)} kg ({valueOrDash(record.bodyFatPct)}% GC)</strong>
                      <span>
                        {leanKg ? `Magra: ${leanKg} kg | Gorda: ${fatKg} kg` : "Informe peso e %GC"}
                      </span>
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
                );
              })}

              {!loading && records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Nenhuma avaliação antropométrica encontrada.
                  </td>
                </tr>
              ) : null}

              {loading ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Carregando avaliações...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">{editing ? "Edição" : "Nova Avaliação Física"}</span>
        <h2>{editing ? "Editar Antropometria" : "Registrar Dobras & Medidas"}</h2>
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
          <div className="form-row">
            <label>
              Data da Avaliação
              <input name="date" type="date" required defaultValue={formatDateInput(editingRecord?.date) || formatDateInput(new Date().toISOString())} />
            </label>
            <label>
              Protocolo de % Gordura
              <select value={protocol} onChange={(e) => setProtocol(e.target.value as SkinfoldProtocol)}>
                <option value="POLLOCK_3">Jackson & Pollock — 3 Dobras</option>
                <option value="POLLOCK_7">Jackson & Pollock — 7 Dobras</option>
                <option value="GUEDES_3">Guedes — 3 Dobras (Brasil)</option>
                <option value="DIRECT">Bioimpedância / % Direto</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Sexo Biológico
              <select value={evalSex} onChange={(e) => setEvalSex(e.target.value as "MALE" | "FEMALE")}>
                <option value="FEMALE">Feminino</option>
                <option value="MALE">Masculino</option>
              </select>
            </label>
            <label>
              Idade (anos)
              <input type="number" min="10" max="105" value={evalAge} onChange={(e) => setEvalAge(e.target.value)} />
            </label>
            <label>
              Altura (cm)
              <input type="number" min="100" max="230" step="0.5" value={evalHeightCm} onChange={(e) => setEvalHeightCm(e.target.value)} />
            </label>
          </div>

          {protocol !== "DIRECT" ? (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px" }}>
              <strong style={{ display: "block", fontSize: "0.8rem", color: "#0f172a", marginBottom: "8px" }}>
                📏 Dobras Cutâneas em milímetros (mm)
              </strong>
              <div className="form-row">
                {(protocol === "POLLOCK_7" || (protocol === "POLLOCK_3" && evalSex === "FEMALE") || (protocol === "GUEDES_3" && evalSex === "MALE")) && (
                  <label>
                    Tríceps (mm)
                    <input type="number" step="0.1" min="0" value={tricepsMm} onChange={(e) => setTricepsMm(e.target.value)} placeholder="Ex: 14.5" />
                  </label>
                )}
                {(protocol === "POLLOCK_7" || (protocol === "GUEDES_3" && evalSex === "FEMALE")) && (
                  <label>
                    Subescapular (mm)
                    <input type="number" step="0.1" min="0" value={subscapularMm} onChange={(e) => setSubscapularMm(e.target.value)} placeholder="Ex: 16.0" />
                  </label>
                )}
                {(protocol === "POLLOCK_7" || (protocol === "POLLOCK_3" && evalSex === "FEMALE") || protocol === "GUEDES_3") && (
                  <label>
                    Supra-ilíaca (mm)
                    <input type="number" step="0.1" min="0" value={suprailiacMm} onChange={(e) => setSuprailiacMm(e.target.value)} placeholder="Ex: 18.0" />
                  </label>
                )}
                {(protocol === "POLLOCK_7" || (protocol === "POLLOCK_3" && evalSex === "MALE") || (protocol === "GUEDES_3" && evalSex === "MALE")) && (
                  <label>
                    Abdominal (mm)
                    <input type="number" step="0.1" min="0" value={abdominalMm} onChange={(e) => setAbdominalMm(e.target.value)} placeholder="Ex: 21.0" />
                  </label>
                )}
                {(protocol === "POLLOCK_7" || protocol === "POLLOCK_3" || (protocol === "GUEDES_3" && evalSex === "FEMALE")) && (
                  <label>
                    Coxa (mm)
                    <input type="number" step="0.1" min="0" value={thighMm} onChange={(e) => setThighMm(e.target.value)} placeholder="Ex: 22.5" />
                  </label>
                )}
                {(protocol === "POLLOCK_7" || (protocol === "POLLOCK_3" && evalSex === "MALE")) && (
                  <label>
                    Peitoral (mm)
                    <input type="number" step="0.1" min="0" value={chestMm} onChange={(e) => setChestMm(e.target.value)} placeholder="Ex: 10.0" />
                  </label>
                )}
                {protocol === "POLLOCK_7" && (
                  <label>
                    Axilar Média (mm)
                    <input type="number" step="0.1" min="0" value={midaxillaryMm} onChange={(e) => setMidaxillaryMm(e.target.value)} placeholder="Ex: 11.5" />
                  </label>
                )}
              </div>
            </div>
          ) : null}

          <div className="form-row">
            <label>
              Peso (kg)
              <input
                name="weightKg"
                type="number"
                min="1"
                step="0.01"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
              />
            </label>
            <label>
              Gordura Corporal (%)
              <input
                name="bodyFatPct"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={bodyFatInput}
                onChange={(e) => setBodyFatInput(e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Cintura (cm)
              <input
                name="waistCm"
                type="number"
                min="1"
                step="0.1"
                value={waistInput}
                onChange={(e) => setWaistInput(e.target.value)}
              />
            </label>
            <label>
              Quadril (cm)
              <input
                name="hipCm"
                type="number"
                min="1"
                step="0.1"
                value={hipInput}
                onChange={(e) => setHipInput(e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Abdômen (cm)
              <input type="number" step="0.1" value={abdomenCm} onChange={(e) => setAbdomenCm(e.target.value)} placeholder="Ex: 82" />
            </label>
            <label>
              Braço Relax./Contr. (cm)
              <input type="text" value={armRelaxedCm} onChange={(e) => setArmRelaxedCm(e.target.value)} placeholder="Ex: 31 / 33.5" />
            </label>
            <label>
              Panturrilha (cm)
              <input type="number" step="0.1" value={calfCm} onChange={(e) => setCalfCm(e.target.value)} placeholder="Ex: 37" />
            </label>
          </div>
          <label>
            Observações e Resumo Antropométrico
            <textarea
              name="notes"
              rows={3}
              placeholder="Clique em '+ Inserir Resumo Completo' acima ou digite observações..."
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
            />
          </label>
          <button className="button" type="submit" disabled={saving || !selectedPatientId}>
            {saving ? "Salvando..." : editing ? "Salvar alterações" : "Salvar Avaliação Antropométrica"}
          </button>
          {!selectedPatientId ? <p className="form-message error">Selecione um paciente.</p> : null}
          {editing ? (
            <button className="button secondary" type="button" onClick={() => setEditingRecord(null)}>
              Cancelar edição
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
