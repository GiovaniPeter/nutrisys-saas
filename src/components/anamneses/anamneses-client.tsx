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

type FieldDef = [keyof AnamnesisAnswers, string, string];

const TEMPLATES: Record<string, FieldDef[]> = {
  "Evolução Multiprofissional (SOAP)": [
    ["mainComplaint", "S — Subjetivo (Relato do Paciente)", "Relato do paciente sobre sintomas, evolução desde a última consulta e adesão..."],
    ["clinicalHistory", "O — Objetivo (Exame Físico, Dados Antropométricos e Exames)", "PA, FC, peso, medidas, testes clínicos e resultados de exames..."],
    ["medications", "Medicamentos / Suplementos Atuais", "Fármacos, suplementos ou protocolos em uso..."],
    ["routine", "A — Avaliação (Raciocínio Clínico / Diagnóstico)", "Interpretação clínica da evolução e resposta terapêutica..."],
    ["goals", "Metas Pactuadas com o Paciente", "Metas até o próximo retorno..."],
    ["conduct", "P — Plano Terapêutico e Conduta", "Prescrições, encaminhamentos multiprofissionais e orientações..."]
  ],
  "Consulta Médica / Clínica Geral": [
    ["mainComplaint", "Queixa Principal (QP) e Duração", "Motivo principal da consulta e tempo de evolução..."],
    ["clinicalHistory", "História da Doença Atual (HDA) e Antecedentes", "Início, características dos sintomas, comorbidades e histórico familiar..."],
    ["medications", "Medicamentos de Uso Contínuo", "Nome, dose, frequência e tempo de uso..."],
    ["allergies", "Alergias Medicamentosas e Alimentares", "Reações adversas conhecidas..."],
    ["bowelFunction", "Exame Físico e Sinais Vitais (PA, FC, SatO2)", "Achados do exame físico geral e específico..."],
    ["sleep", "Sono, Humor e Nível de Estresse", "Qualidade do sono e aspectos emocionais..."],
    ["physicalActivity", "Hábitos de Vida (Atividade Física, Tabagismo, Etilismo)", "Rotina de exercícios e hábitos..."],
    ["routine", "Hipótese Diagnóstica / CID-10", "Hipóteses clínicas principais e secundárias..."],
    ["goals", "Exames Solicitados e Encaminhamentos", "Exames laboratoriais/imagem e interconsultas..."],
    ["conduct", "Conduta Médica e Prescrição", "Plano farmacológico e orientações clínicas..."]
  ],
  "Avaliação Psicológica / Saúde Mental": [
    ["mainComplaint", "Demanda Inicial / Queixa Principal", "Motivo da busca pelo atendimento psicológico..."],
    ["clinicalHistory", "Histórico de Vida, Familiar e Contexto Psicossocial", "Dinâmica familiar, eventos significativos e histórico prévio..."],
    ["medications", "Psicofármacos e Acompanhamento Psiquiátrico", "Medicações em uso e profissionais envolvidos..."],
    ["sleep", "Padrão de Sono, Humor, Afeto e Ansiedade", "Avaliação do estado mental, sono e regulação emocional..."],
    ["routine", "Rotina Diária, Trabalho e Rede de Apoio", "Relações sociais, ocupacionais e suporte..."],
    ["goals", "Objetivos Terapêuticos", "Demandas a serem trabalhadas no processo..."],
    ["conduct", "Síntese Clínica e Plano de Intervenção", "Abordagem, frequência das sessões e encaminhamentos..."]
  ],
  "Avaliação Fisioterapêutica / Reabilitação": [
    ["mainComplaint", "Queixa Funcional e Escala de Dor (EVA 0-10)", "Localização da dor, fatores de melhora/piora e limitação funcional..."],
    ["clinicalHistory", "Histórico da Lesão, Cirurgias e Exames de Imagem", "Mecanismo de lesão, pós-operatório e laudos..."],
    ["medications", "Medicamentos Analgésicos / Anti-inflamatórios", "Fármacos em uso..."],
    ["bowelFunction", "Inspeção, Palpação, ADM e Força Muscular", "Amplitude de movimento articular, trofismo e força..."],
    ["physicalActivity", "Testes Especiais e Avaliação Postural / Funcional", "Testes ortopédicos, neurológicos ou respiratórios..."],
    ["routine", "Diagnóstico Cinético-Funcional", "Conclusão funcional fisioterapêutica..."],
    ["goals", "Metas de Reabilitação (Curto e Médio Prazo)", "Ganho de ADM, analgesia, retorno ao esporte/AVDs..."],
    ["conduct", "Conduta Fisioterapêutica e Exercícios Domiciliares", "Recursos terapêuticos, cinesioterapia e orientações..."]
  ],
  "Avaliação Educação Física / Esportiva": [
    ["mainComplaint", "Objetivo Principal (Hipertrofia, Emagrecimento, Performance)", "Meta principal do aluno/paciente..."],
    ["clinicalHistory", "PAR-Q, Histórico Clínico e Lesões Musculoesqueléticas", "Restrições articulares, cardíacas ou dores ao movimento..."],
    ["physicalActivity", "Experiência de Treino, Modalidades e Frequência", "Histórico esportivo e disponibilidade semanal..."],
    ["sleep", "Recuperação, Sono e Nível de Energia Diário", "Horas de sono e fadiga percebida..."],
    ["waterIntake", "Hidratação e Nutrição Peritreino", "Ingestão hídrica e suplementação atual..."],
    ["routine", "Periodização e Divisão de Treinamento", "Estrutura de micro/mesociclo recomendada..."],
    ["goals", "Metas de Performance e Composição Corporal", "Indicadores de progresso..."],
    ["conduct", "Prescrição de Treino e Recomendações", "Volume, intensidade, cadência e cuidados..."]
  ],
  "Avaliação Fonoaudiológica / Odontológica": [
    ["mainComplaint", "Queixa Principal (Deglutição, Fala, Voz, Mastigação / Dor Orofacial)", "Descrição detalhada da queixa..."],
    ["clinicalHistory", "Histórico Clínico, Neurológico ou Odontológico", "Antecedentes, próteses, cirurgias ou disfagia..."],
    ["medications", "Medicamentos em Uso e Xerostomia", "Fármacos que afetam salivação/deglutição..."],
    ["bowelFunction", "Avaliação Motricidade Orofacial / Ausculta Cervical / Oclusão", "Achados clínicos da avaliação estrutural e funcional..."],
    ["foodPreferences", "Consistências Alimentares Seguras (IDDSI / Texturas)", "Líquido fino, néctar, mel, pudim, pastoso, sólido macio..."],
    ["goals", "Objetivos Terapêuticos", "Segurança de via oral, reabilitação fonatória ou oclusal..."],
    ["conduct", "Conduta Clínica e Exercícios / Orientações", "Manobras, espessantes, fonoterapia ou plano odontológico..."]
  ],
  "Anamnese Nutricional Completa": [
    ["mainComplaint", "Queixa Principal e Motivo da Consulta", "Objetivo e queixas relatadas..."],
    ["clinicalHistory", "Histórico Clínico e Patologias", "Diabetes, HAS, dislipidemia, SOP, gastrite..."],
    ["medications", "Medicamentos e Suplementos em Uso", "Posologia e horários..."],
    ["allergies", "Alergias e Intolerâncias Alimentares", "Lactose, glúten, APLV, frutos do mar..."],
    ["bowelFunction", "Funcionamento Intestinal (Escala de Bristol) e Digestão", "Frequência, consistência, gases, refluxo..."],
    ["sleep", "Qualidade do Sono e Estresse", "Horários de dormir/acordar e qualidade..."],
    ["waterIntake", "Ingestão Hídrica Diária", "Litros/dia e hábito de hidratação..."],
    ["physicalActivity", "Atividade Física (Tipo, Horário e Intensidade)", "Treinos e rotina de gasto energético..."],
    ["foodPreferences", "Preferências Alimentares", "Alimentos favoritos que não podem faltar..."],
    ["foodAversions", "Aversões e Restrições Alimentares", "Alimentos que não consome..."],
    ["routine", "Rotina Diária e Horários das Refeições", "Quem cozinha, onde faz as refeições, horários..."],
    ["goals", "Objetivos Antropométricos e de Saúde", "Metas de peso, massa magra e exames..."],
    ["conduct", "Conduta Nutricional Inicial", "Estratégia calórica, distribuição de macros e orientações..."]
  ]
};

const DEFAULT_TEMPLATE_KEY = "Anamnese Nutricional Completa";

export function AnamnesesClient() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [anamneses, setAnamneses] = useState<Anamnesis[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(() => searchParams.get("patientId") || "");
  const [selectedType, setSelectedType] = useState<string>(DEFAULT_TEMPLATE_KEY);
  const [editingAnamnesis, setEditingAnamnesis] = useState<Anamnesis | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editing = Boolean(editingAnamnesis);
  const latestAnamnesis = useMemo(() => anamneses[0] || null, [anamneses]);
  const activeFields = useMemo(
    () => TEMPLATES[selectedType] || TEMPLATES[DEFAULT_TEMPLATE_KEY],
    [selectedType]
  );

  useEffect(() => {
    void loadPatients();
  }, []);

  useEffect(() => {
    void loadAnamneses(selectedPatientId);
  }, [selectedPatientId]);

  useEffect(() => {
    if (editingAnamnesis) {
      if (TEMPLATES[editingAnamnesis.type]) {
        setSelectedType(editingAnamnesis.type);
      } else {
        setSelectedType(DEFAULT_TEMPLATE_KEY);
      }
    }
  }, [editingAnamnesis]);

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
      setMessage(data.error || "Não foi possível carregar o prontuário.");
      return;
    }

    setAnamneses(data.anamneses);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = getAnamnesisPayload(form, selectedPatientId, selectedType);

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
      setMessage(data.error || "Não foi possível salvar o registro no prontuário.");
      return;
    }

    if (editingAnamnesis) {
      setEditingAnamnesis(null);
      setMessage("Registro de prontuário atualizado com sucesso.");
    } else {
      formElement.reset();
      setMessage("Registro salvo no prontuário multiprofissional.");
    }

    await loadAnamneses(selectedPatientId);
  }

  async function handleDelete(anamnesis: Anamnesis) {
    const confirmed = window.confirm(`Excluir registro de prontuário de ${anamnesis.patient.name}?`);

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
      setMessage(data.error || "Não foi possível excluir o registro.");
      return;
    }

    if (editingAnamnesis?.id === anamnesis.id) {
      setEditingAnamnesis(null);
    }

    setMessage("Registro excluído com sucesso.");
    await loadAnamneses(selectedPatientId);
  }

  return (
    <section className="workspace-grid">
      <div className="surface anamnesis-list">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Prontuário Eletrônico Multiprofissional</span>
            <h2>Anamneses e Evoluções Clínicas</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo das anamneses">
            <span>{anamneses.length} registros</span>
            <span>{latestAnamnesis ? formatDate(latestAnamnesis.createdAt) : "sem histórico"}</span>
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
            <option value="">Todos os pacientes</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </label>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="plan-list">
          {anamneses.map((anamnesis) => {
            const templateFields = TEMPLATES[anamnesis.type] || TEMPLATES[DEFAULT_TEMPLATE_KEY];
            return (
              <article className="plan-card" key={anamnesis.id}>
                <div>
                  <span className="status-pill ok">{anamnesis.type}</span>
                  <h3>{anamnesis.patient.name}</h3>
                  <p>Registrado em {formatDate(anamnesis.createdAt)}</p>
                </div>
                <div className="answer-preview">
                  {templateFields.slice(0, 6).map(([key, label]) => (
                    <div key={key}>
                      <strong>{label}</strong>
                      <span>{anamnesis.answers[key] || "Não informado"}</span>
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
            );
          })}

          {!loading && anamneses.length === 0 ? <p className="empty-card">Nenhum registro clínico encontrado.</p> : null}
          {loading ? <p className="empty-card">Carregando prontuário...</p> : null}
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">{editing ? "Edição de Prontuário" : "Novo Registro Clínico"}</span>
        <h2>{editing ? "Editar prontuário" : "Registrar atendimento"}</h2>
        <form key={`${editingAnamnesis?.id || "new"}-${selectedType}`} className="form compact-form" onSubmit={handleSubmit}>
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
            Modelo de Prontuário / Especialidade
            <select
              name="type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {Object.keys(TEMPLATES).map((templateName) => (
                <option key={templateName} value={templateName}>
                  {templateName}
                </option>
              ))}
            </select>
          </label>

          {activeFields.map(([key, label, placeholder]) => (
            <label key={key}>
              {label}
              <textarea
                name={key}
                rows={key === "routine" || key === "conduct" || key === "clinicalHistory" ? 4 : 3}
                placeholder={placeholder}
                defaultValue={editingAnamnesis?.answers[key] || ""}
              />
            </label>
          ))}

          <button className="button" type="submit" disabled={saving || !selectedPatientId}>
            {saving ? "Salvando..." : editing ? "Salvar alterações" : "Salvar no prontuário"}
          </button>
          {!selectedPatientId ? <p className="form-message error">Selecione um paciente.</p> : null}
          {editing ? (
            <button className="button secondary" type="button" onClick={() => setEditingAnamnesis(null)}>
              Cancelar edição
            </button>
          ) : null}
        </form>
      </aside>
    </section>
  );
}

const ALL_ANSWER_KEYS: Array<keyof AnamnesisAnswers> = [
  "mainComplaint",
  "clinicalHistory",
  "medications",
  "allergies",
  "bowelFunction",
  "sleep",
  "waterIntake",
  "physicalActivity",
  "foodPreferences",
  "foodAversions",
  "routine",
  "goals",
  "conduct"
];

function getAnamnesisPayload(form: FormData, selectedPatientId: string, selectedType: string) {
  return {
    patientId: form.get("patientId") || selectedPatientId,
    type: form.get("type") || selectedType,
    answers: Object.fromEntries(ALL_ANSWER_KEYS.map((key) => [key, String(form.get(key) || "").trim()]))
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}
