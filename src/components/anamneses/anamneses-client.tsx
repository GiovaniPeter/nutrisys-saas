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
  "Anamnese Nutricional Clínica Completa": [
    ["mainComplaint", "Queixa Principal e Motivo da Consulta", "Objetivo principal e queixas relatadas pelo paciente..."],
    ["clinicalHistory", "Histórico Clínico, Patologias e Cirurgias", "Diabetes, HAS, dislipidemia, hipotireoidismo, SOP, gastrite, cirurgia bariátrica..."],
    ["medications", "Medicamentos e Suplementos em Uso", "Nome, dosagem, horário e tempo de uso..."],
    ["allergies", "Alergias, Intolerâncias e Sensibilidades Alimentares", "Lactose, glúten/celíaca, APLV, frutos do mar, FODMAPs..."],
    ["bowelFunction", "Funcionamento Intestinal (Escala de Bristol) e Digestão", "Frequência evacuatória, consistência (Bristol 1-7), estufamento, gases, azia/refluxo..."],
    ["sleep", "Qualidade do Sono, Estresse e Ansiedade", "Horários de dormir/acordar, despertares noturnos e gatilhos emocionais..."],
    ["waterIntake", "Ingestão Hídrica Diária e Outras Bebidas", "Litros de água/dia, consumo de café, chás, refrigerantes e álcool..."],
    ["physicalActivity", "Atividade Física (Modalidade, Horário e Frequência)", "Musculação, corrida, crossfit, horário do treino para ajuste pré/pós-treino..."],
    ["foodPreferences", "Preferências Alimentares (Alimentos Favoritos)", "Alimentos que o paciente gosta e faz questão de manter no cardápio..."],
    ["foodAversions", "Aversões Alimentares (Não Consome)", "Alimentos que o paciente não come de jeito nenhum..."],
    ["routine", "Rotina Diária, Trabalho e Logística das Refeições", "Horários de trabalho, quem prepara as refeições, se leva marmita ou almoça fora..."],
    ["goals", "Objetivos Antropométricos e Metas Pactuadas", "Meta de peso, redução de % de gordura, ganho de massa magra..."],
    ["conduct", "Conduta Nutricional Inicial e Estratégia Dietética", "VET prescrito, divisão de macronutrientes, suplementação e orientações..."]
  ],
  "Nutrição Esportiva & Hipertrofia": [
    ["mainComplaint", "Objetivo Esportivo (Hipertrofia, Performance, Cutting, Endurance)", "Meta principal e calendário de competições/provas..."],
    ["physicalActivity", "Rotina de Treinamento (Modalidade, Volume, Intensidade e Horário)", "Divisão de treino, duração das sessões, duplo treino e gasto estimado..."],
    ["routine", "Nutrição Peritreino Atual (Pré, Intra e Pós-Treino)", "O que consome antes, durante e logo após os treinos..."],
    ["medications", "Suplementos, Ergogênicos e Recursos em Uso", "Whey, creatina, cafeína, beta-alanina, carboidratos em gel, recursos hormonais..."],
    ["sleep", "Recuperação Muscular, Sono e Sinais de Overtraining", "Qualidade do sono, dor muscular tardia (DOMS) e disposição..."],
    ["waterIntake", "Hidratação, Taxa de Sudorese e Reposição de Eletrólitos", "Consumo hídrico basal e durante os treinos..."],
    ["bowelFunction", "Conforto Gastrointestinal no Exercício", "Tolerância a carboidratos e fibras antes do treino..."],
    ["foodPreferences", "Alimentos Preferidos e Praticidade na Rotina", "Fontes proteicas e de carboidratos preferidas..."],
    ["goals", "Metas de Composição Corporal e Performance", "Meta de peso magro, % de gordura e rendimento..."],
    ["conduct", "Estratégia Nutricional e Periodização de Macros", "g/kg de proteína, carboidrato e lipídeos + protocolo de suplementação..."]
  ],
  "Emagrecimento & Comportamento Alimentar": [
    ["mainComplaint", "Histórico do Peso e Expectativa de Emagrecimento", "Evolução do peso nos últimos anos, efeito sanfona e peso desejado..."],
    ["clinicalHistory", "Dietas Anteriores e Tratamentos Prévios", "Estratégias já tentadas (low carb, jejum, medicamentos) e por que parou..."],
    ["sleep", "Fome Física vs. Fome Emocional e Compulsão", "Horários de maior vontade de doce/beliscar, ansiedade noturna e culpa ao comer..."],
    ["routine", "Rotina de Finais de Semana e Eventos Sociais", "Comportamento alimentar de sexta a domingo, delivery e bebidas alcoólicas..."],
    ["bowelFunction", "Saciedade, Digestão e Funcionamento Intestinal", "Percepção de saciedade após as refeições e trânsito intestinal..."],
    ["foodPreferences", "Alimentos de Conforto e Preferências", "Doces ou salgados favoritos para inclusão estratégica no plano..."],
    ["foodAversions", "Restrições e Aversões Alimentares", "Alimentos que não consome..."],
    ["goals", "Metas Comportamentais e Antropométricas", "Pequenas metas semanais de adesão e perda de gordura..."],
    ["conduct", "Conduta Nutricional (Déficit Calórico e Estratégia de Adesão)", "Estratégia para controle de saciedade, organização de marmitas/lanches..."]
  ],
  "Nutrição Funcional, Intolerâncias & Saúde Intestinal": [
    ["mainComplaint", "Queixas Gastrointestinais e Sintomas Sistêmicos", "Estufamento, distensão abdominal, diarreia/constipação, fadiga, queda de cabelo, pele..."],
    ["bowelFunction", "Avaliação Intestinal Detalhada (Escala de Bristol e Disbiose)", "Frequência, formato das fezes, muco, dor abdominal, SIBO/SII..."],
    ["allergies", "Hipersensibilidades, Intolerâncias e Gatilhos Alimentares", "Reação ao leite/derivados, trigo/glúten, leguminosas, alimentos fermentáveis (FODMAPs)..."],
    ["clinicalHistory", "Uso Recente de Antibióticos, IBP (Omeprazol) ou Anti-inflamatórios", "Histórico medicamentoso que impacta a microbiota..."],
    ["medications", "Suplementos, Probióticos e Fitoterápicos Atuais", "Cepas probióticas, glutamina, enzimas digestivas, vitaminas..."],
    ["waterIntake", "Hidratação, Chás Digestivos e Mastigação", "Velocidade da mastigação, ingestão de líquidos junto às refeições..."],
    ["goals", "Objetivos de Modulação Intestinal e Remissão de Sintomas", "Fases de remoção, reparo e reintrodução..."],
    ["conduct", "Protocolo Nutricional e Suplementação Funcional", "Dieta anti-inflamatória / Low FODMAP, fibras solúveis e nutracêuticos..."]
  ],
  "Nutrição Materno-Infantil & Gestante": [
    ["mainComplaint", "Fase Atual (Tentante, Trimestre Gestacional, Lactante ou Introdução Alimentar)", "Idade gestacional / idade da criança e motivo da consulta..."],
    ["clinicalHistory", "Peso Pré-Gestacional, Ganho Ponderal e Exames do Pré-Natal", "Curva de ganho de peso, glicemia, ferritina, vitamina D, B12, pressão arterial..."],
    ["bowelFunction", "Sintomas Gestacionais (Náuseas, Azia, Constipação, Desejos/Aversões)", "Enjoos matinais, refluxo, constipação ou seletividade alimentar..."],
    ["medications", "Suplementação Gestacional / Pediátrica em Uso", "Ácido fólico/metilfolato, ferro, ômega 3 DHA, polivitamínico, vitamina D..."],
    ["waterIntake", "Ingestão Hídrica e Produção Láctea / Hidratação", "Consumo de água ao longo do dia..."],
    ["routine", "Rotina Familiar e Rede de Apoio na Alimentação", "Preparo das refeições em casa e horários..."],
    ["goals", "Metas de Ganho de Peso Adequado e Nutrição Materno-Fetal", "Metas por trimestre ou desenvolvimento infantil..."],
    ["conduct", "Conduta Nutricional e Ajuste de Micronutrientes", "Fracionamento das refeições, manejo de enjoos e plano alimentar..."]
  ],
  "Consulta de Retorno Nutricional (Evolução SOAP)": [
    ["mainComplaint", "S — Subjetivo (Adesão ao Cardápio, Dificuldades e Conquistas)", "Como foi seguir o plano alimentar, horários em que sentiu mais fome ou dificuldade..."],
    ["clinicalHistory", "O — Objetivo (Evolução de Peso, Medidas, % de Gordura e Exames)", "Comparativo antropométrico e bioquímico em relação à consulta anterior..."],
    ["bowelFunction", "Evolução de Sintomas (Intestino, Disposição, Sono e Hidratação)", "Mudanças percebidas na energia diária, intestino e ingestão de água..."],
    ["routine", "A — Avaliação Nutricional da Evolução", "Análise da resposta metabólica e comportamental ao plano vigente..."],
    ["goals", "Novas Metas para o Próximo Ciclo", "Metas ajustadas até o próximo retorno..."],
    ["conduct", "P — Plano (Ajustes no Cardápio, Calorias e Suplementação)", "Alterações feitas nas refeições, novas substituições e orientações..."]
  ]
};

const DEFAULT_TEMPLATE_KEY = "Anamnese Nutricional Clínica Completa";

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
