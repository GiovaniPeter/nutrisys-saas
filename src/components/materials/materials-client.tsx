"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Material = {
  id: string;
  title: string;
  category: string;
  audience: string | null;
  description: string | null;
  content: string | null;
  designUrl: string | null;
  imageUrl: string | null;
  tags: string[];
  createdAt: string;
};

type Patient = {
  id: string;
  name: string;
  phone: string | null;
};

type MaterialsResponse = {
  materials: Material[];
};

type PatientsResponse = {
  patients: Patient[];
};

type Template = {
  title: string;
  description: string;
  category: string;
  search: string;
  content: string;
  tags: string[];
};

const categories = ["Postagem", "Material para paciente", "Consultorio", "Lista", "Guia", "Outro"];

const nutritionTemplates: Template[] = [
  {
    title: "Guia de substituicoes",
    description: "Tabela simples para trocar alimentos mantendo o plano.",
    category: "Guia",
    search: "food substitution guide nutrition",
    tags: ["trocas", "educativo"],
    content: "Use este guia para substituir alimentos do plano por opcoes equivalentes. Priorize porcoes semelhantes e observe sinais de fome e saciedade."
  },
  {
    title: "Lista de compras saudavel",
    description: "Modelo semanal para mercado e feira.",
    category: "Lista",
    search: "healthy grocery shopping list template",
    tags: ["compras", "organizacao"],
    content: "Monte sua lista por grupos: proteinas, vegetais, frutas, carboidratos, gorduras boas e itens de preparo. Evite ir ao mercado com fome."
  },
  {
    title: "Diario alimentar impresso",
    description: "Template para paciente anotar refeicoes.",
    category: "Material para paciente",
    search: "food diary template printable",
    tags: ["diario", "adesao"],
    content: "Anote horario, refeicao, fome antes, saciedade depois e observacoes. O objetivo e entender padroes, nao julgar escolhas."
  },
  {
    title: "Prato saudavel",
    description: "Infografico com composicao do prato.",
    category: "Material para paciente",
    search: "healthy plate infographic nutrition",
    tags: ["prato", "educativo"],
    content: "Metade do prato com vegetais, um quarto com proteina e um quarto com carboidrato. Ajustes dependem do objetivo e da rotina."
  },
  {
    title: "Post de mitos e verdades",
    description: "Conteudo para rede social.",
    category: "Postagem",
    search: "nutrition myths facts instagram template",
    tags: ["instagram", "educativo"],
    content: "Mito ou verdade? Carboidrato a noite engorda. Resposta: mito. O contexto alimentar do dia importa mais que o horario isolado."
  },
  {
    title: "Cartao de visita",
    description: "Modelo profissional para consultorio.",
    category: "Consultorio",
    search: "nutritionist business card template",
    tags: ["marca", "consultorio"],
    content: "Inclua nome, CRN, telefone, endereco, redes sociais e um convite claro para agendamento."
  }
];

const clinicalTemplates: Template[] = [
  {
    title: "Orientações pós-consulta",
    description: "Recomendações gerais e próximos passos.",
    category: "Guia",
    search: "medical post consultation guide template",
    tags: ["orientacoes", "educativo"],
    content: "Siga o tratamento prescrito, observe os horários das medicações e retorne na data agendada ou caso os sintomas persistam."
  },
  {
    title: "Checklist de exames",
    description: "Lista de exames solicitados e preparos.",
    category: "Lista",
    search: "medical test checklist template",
    tags: ["exames", "organizacao"],
    content: "Lembre-se de realizar o jejum recomendado e não suspender as medicações de uso contínuo, salvo orientação contrária."
  },
  {
    title: "Diário de sintomas",
    description: "Template para paciente registrar a evolução.",
    category: "Material para paciente",
    search: "symptom tracker diary template",
    tags: ["diario", "adesao"],
    content: "Anote a data, intensidade da dor ou sintoma (de 0 a 10), possíveis gatilhos e a duração. Traga este registro no retorno."
  },
  {
    title: "Prontuário e evolução",
    description: "Folha padrão para acompanhamento clínico.",
    category: "Consultorio",
    search: "medical evolution form template",
    tags: ["prontuario", "clinica"],
    content: "Template para registro objetivo da evolução clínica do paciente a cada encontro."
  },
  {
    title: "Cartão de visita",
    description: "Modelo profissional para consultório.",
    category: "Consultorio",
    search: "doctor business card template",
    tags: ["marca", "consultorio"],
    content: "Inclua nome, especialidade, registro no conselho, telefone, endereço, redes sociais e um convite para agendamento."
  }
];

export function MaterialsClient({ isProfessional }: { isProfessional?: boolean }) {
  const activeTemplates = isProfessional ? clinicalTemplates : nutritionTemplates;

  const [materials, setMaterials] = useState<Material[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [sharingMaterial, setSharingMaterial] = useState<Material | null>(null);
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [shareMessage, setShareMessage] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const visibleCategories = useMemo(() => Array.from(new Set([...categories, ...materials.map((material) => material.category)])), [materials]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadMaterials();
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [query, categoryFilter]);

  useEffect(() => {
    void loadPatients();
  }, []);

  useEffect(() => {
    if (!editingMaterial) {
      setSelectedTags([]);
      return;
    }

    setSelectedTags(editingMaterial.tags);
  }, [editingMaterial]);

  async function loadMaterials() {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (categoryFilter) params.set("category", categoryFilter);

    const response = await fetch(`/api/materials${params.size ? `?${params}` : ""}`);
    const data = (await response.json()) as MaterialsResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar materiais.");
      return;
    }

    setMaterials(data.materials);
  }

  async function loadPatients() {
    const response = await fetch("/api/patients");
    const data = (await response.json()) as PatientsResponse & { error?: string };

    if (response.ok) {
      setPatients(data.patients);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get("title"),
      category: form.get("category"),
      audience: form.get("audience"),
      description: form.get("description"),
      content: form.get("content"),
      designUrl: form.get("designUrl"),
      imageUrl: form.get("imageUrl"),
      tags: selectedTags
    };

    setSaving(true);
    setMessage(null);

    const response = await fetch(editingMaterial ? `/api/materials/${editingMaterial.id}` : "/api/materials", {
      method: editingMaterial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel salvar o material.");
      return;
    }

    event.currentTarget.reset();
    setEditingMaterial(null);
    setSelectedTags([]);
    setMessage(editingMaterial ? "Material atualizado." : "Material salvo.");
    await loadMaterials();
  }

  async function deleteMaterial(material: Material) {
    const confirmed = window.confirm(`Remover "${material.title}"?`);
    if (!confirmed) return;

    setDeletingId(material.id);
    const response = await fetch(`/api/materials/${material.id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel remover o material.");
      return;
    }

    if (editingMaterial?.id === material.id) setEditingMaterial(null);
    setMessage("Material removido.");
    await loadMaterials();
  }

  function applyTemplate(template: Template) {
    setEditingMaterial({
      id: "",
      title: template.title,
      category: template.category,
      audience: "Pacientes em acompanhamento",
      description: template.description,
      content: template.content,
      designUrl: "",
      imageUrl: "",
      tags: template.tags,
      createdAt: new Date().toISOString()
    });
    setSelectedTags(template.tags);
    setMessage(`Template "${template.title}" aplicado no formulario.`);
  }

  function openCanva(template: Template) {
    window.open(`https://www.canva.com/search/templates?q=${encodeURIComponent(template.search)}`, "_blank", "noopener,noreferrer");
  }

  function startShare(material: Material) {
    setSharingMaterial(material);
    setSelectedPatientIds([]);
    setShareMessage(buildShareMessage(material));
  }

  function togglePatient(patientId: string) {
    setSelectedPatientIds((current) => (current.includes(patientId) ? current.filter((id) => id !== patientId) : [...current, patientId]));
  }

  function shareViaWhatsApp() {
    if (!sharingMaterial) return;
    const selectedPatients = patients.filter((patient) => selectedPatientIds.includes(patient.id) && patient.phone);

    if (!selectedPatients.length) {
      setMessage("Selecione pelo menos um paciente com telefone.");
      return;
    }

    selectedPatients.forEach((patient) => {
      const phone = normalizePhone(patient.phone as string);
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(shareMessage)}`, "_blank", "noopener,noreferrer");
    });

    setSharingMaterial(null);
    setMessage("Links de WhatsApp abertos.");
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  }

  return (
    <section className="workspace-grid materials-layout">
      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Biblioteca</span>
            <h2>Materiais salvos</h2>
          </div>
          <div className="mini-stats">
            <span>{materials.length} materiais</span>
            <span>{visibleCategories.length} categorias</span>
          </div>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="filters-row">
          <label>
            Buscar
            <input value={query} placeholder="Nome, texto ou descricao" onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label>
            Categoria
            <select className="inline-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="">Todas</option>
              {visibleCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="materials-gallery">
          {materials.map((material) => (
            <article className="material-card" key={material.id}>
              {material.imageUrl ? (
                <img src={material.imageUrl} alt="" />
              ) : (
                <div className="material-placeholder">
                  <strong>{initials(material.title)}</strong>
                </div>
              )}
              <div>
                <span className="status-pill">{material.category}</span>
                <h3>{material.title}</h3>
                <p>{material.description || material.content || "Sem descricao."}</p>
                <small>{formatDate(material.createdAt)}</small>
              </div>
              <div className="tag-selector material-tags">
                {material.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="row-actions">
                {material.designUrl ? (
                  <a className="text-button" href={material.designUrl} target="_blank" rel="noreferrer">
                    Abrir
                  </a>
                ) : null}
                <button className="text-button" type="button" onClick={() => startShare(material)}>
                  Compartilhar
                </button>
                <button className="text-button" type="button" onClick={() => setEditingMaterial(material)}>
                  Editar
                </button>
                <button className="text-button danger" type="button" disabled={deletingId === material.id} onClick={() => void deleteMaterial(material)}>
                  {deletingId === material.id ? "Removendo..." : "Remover"}
                </button>
              </div>
            </article>
          ))}

          {!loading && materials.length === 0 ? <p className="empty-card">Nenhum material salvo ainda.</p> : null}
          {loading ? <p className="empty-card">Carregando materiais...</p> : null}
        </div>

        <div className="materials-template-section">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">CANVA</span>
              <h2>Templates sugeridos</h2>
            </div>
            <a className="text-button" href="https://www.canva.com" target="_blank" rel="noreferrer">
              Abrir Canva
            </a>
          </div>
          <div className="template-grid">
            {activeTemplates.map((template) => (
              <article key={template.title}>
                <strong>{template.title}</strong>
                <span>{template.description}</span>
                <div className="row-actions">
                  <button className="text-button" type="button" onClick={() => applyTemplate(template)}>
                    Usar texto
                  </button>
                  <button className="text-button" type="button" onClick={() => openCanva(template)}>
                    Ver no Canva
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <aside className="surface patient-form-panel">
        {sharingMaterial ? (
          <div className="share-panel">
            <span className="eyebrow">Compartilhar</span>
            <h2>{sharingMaterial.title}</h2>
            <label className="search-field">
              Mensagem
              <textarea value={shareMessage} rows={5} onChange={(event) => setShareMessage(event.target.value)} />
            </label>
            <div className="compact-list">
              {patients.map((patient) => (
                <article key={patient.id}>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={selectedPatientIds.includes(patient.id)} onChange={() => togglePatient(patient.id)} />
                    <span>
                      <strong>{patient.name}</strong>
                      {patient.phone || "Sem telefone"}
                    </span>
                  </label>
                </article>
              ))}
            </div>
            <div className="row-actions notification-actions">
              <button className="text-button" type="button" onClick={shareViaWhatsApp}>
                Enviar WhatsApp
              </button>
              <button className="text-button" type="button" onClick={() => setSharingMaterial(null)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className="eyebrow">{editingMaterial?.id ? "Edicao" : "Novo material"}</span>
            <h2>{editingMaterial?.id ? "Editar material" : "Cadastrar material"}</h2>
            <form key={editingMaterial?.id || editingMaterial?.title || "new"} className="form compact-form" onSubmit={(event) => void handleSubmit(event)}>
              <label>
                Titulo
                <input name="title" required defaultValue={editingMaterial?.title || ""} />
              </label>
              <div className="form-row">
                <label>
                  Categoria
                  <select name="category" defaultValue={editingMaterial?.category || "Material para paciente"}>
                    {visibleCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Publico
                  <input name="audience" placeholder="Ex.: Gestantes" defaultValue={editingMaterial?.audience || ""} />
                </label>
              </div>
              <label>
                Descricao
                <textarea name="description" rows={3} defaultValue={editingMaterial?.description || ""} />
              </label>
              <label>
                Conteudo / mensagem
                <textarea name="content" rows={6} defaultValue={editingMaterial?.content || ""} />
              </label>
              <label>
                Link do Canva ou arquivo
                <input name="designUrl" type="url" placeholder="https://www.canva.com/design/..." defaultValue={editingMaterial?.designUrl || ""} />
              </label>
              <label>
                Imagem de capa
                <input name="imageUrl" type="url" placeholder="https://..." defaultValue={editingMaterial?.imageUrl || ""} />
              </label>
              <div className="tag-selector">
                {["educativo", "instagram", "compras", "trocas", "adesao", "consultorio", "receitas", "hidratacao"].map((tag) => (
                  <button key={tag} className={selectedTags.includes(tag) ? "text-button active-tag" : "text-button"} type="button" onClick={() => toggleTag(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
              <button className="button" type="submit" disabled={saving}>
                {saving ? "Salvando..." : editingMaterial?.id ? "Salvar alteracoes" : "Salvar material"}
              </button>
              {editingMaterial ? (
                <button className="button secondary" type="button" onClick={() => setEditingMaterial(null)}>
                  Cancelar
                </button>
              ) : null}
            </form>
          </>
        )}
      </aside>
    </section>
  );
}

function buildShareMessage(material: Material) {
  const link = material.designUrl ? `\n\n${material.designUrl}` : "";
  return `Ola! Preparei um material para voce: ${material.title}.\n\n${material.content || material.description || "Espero que ajude na sua rotina."}${link}`;
}

function normalizePhone(phone: string) {
  const clean = phone.replace(/\D/g, "");
  return clean.startsWith("55") ? clean : `55${clean}`;
}

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
