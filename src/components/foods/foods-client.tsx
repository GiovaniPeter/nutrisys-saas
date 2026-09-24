"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FOOD_CATEGORIES } from "@/lib/brazilian-foods-seed";

type Food = {
  id: string;
  organizationId: string | null;
  name: string;
  portion: string;
  householdMeasure: string | null;
  calories: string | number;
  protein: string | number;
  carbs: string | number;
  fat: string | number;
  fiber: string | number | null;
  category: string | null;
  source: string | null;
};

type FoodsResponse = {
  foods: Food[];
  total?: number;
};

const HOUSEHOLD_MEASURE_PRESETS = [
  { label: "4 colheres de sopa cheias (100 g)", portion: "100 g" },
  { label: "1 concha média cheia (100 g)", portion: "100 g" },
  { label: "1 filé / bife médio grelhado (100 g)", portion: "100 g" },
  { label: "1 unidade média (50 g)", portion: "50 g" },
  { label: "1 unidade grande (130 g)", portion: "130 g" },
  { label: "1 fatia média (30 g)", portion: "30 g" },
  { label: "2 fatias médias (50 g)", portion: "50 g" },
  { label: "1 colher de sopa cheia (20 g)", portion: "20 g" },
  { label: "2 colheres de sopa cheias (30 g)", portion: "30 g" },
  { label: "1 scoop dosador cheio (30 g)", portion: "30 g" },
  { label: "1 dosador de 5g / 1 colher de chá (5 g)", portion: "5 g" },
  { label: "1 copo americano (200 ml)", portion: "200 ml" },
  { label: "1 pote / copo individual (170 g)", portion: "170 g" },
  { label: "1 frasco / etapa enteral (200 ml)", portion: "200 ml" }
];

export function FoodsClient() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("all");
  const [simulatorGrams, setSimulatorGrams] = useState<number | "">("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalFoods, setTotalFoods] = useState(0);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [cloningFood, setCloningFood] = useState<Food | null>(null);

  // Controlled form inputs for smart macro/calorie calculation
  const [formName, setFormName] = useState("");
  const [formPortion, setFormPortion] = useState("100 g");
  const [formMeasure, setFormMeasure] = useState("");
  const [formCalories, setFormCalories] = useState("");
  const [formProtein, setFormProtein] = useState("");
  const [formCarbs, setFormCarbs] = useState("");
  const [formFat, setFormFat] = useState("");
  const [formFiber, setFormFiber] = useState("");
  const [formCategory, setFormCategory] = useState<string>(FOOD_CATEGORIES[0]);

  const csvInputRef = useRef<HTMLInputElement | null>(null);

  const editing = Boolean(editingFood);
  const customFoodsCount = useMemo(() => foods.filter((food) => food.organizationId).length, [foods]);
  const estimatedKcal = useMemo(() => {
    const p = Number(formProtein || 0);
    const c = Number(formCarbs || 0);
    const f = Number(formFat || 0);
    return Math.round((p * 4 + c * 4 + f * 9) * 10) / 10;
  }, [formProtein, formCarbs, formFat]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadFoods(query, categoryFilter, originFilter);
    }, query.trim() ? 180 : 0);

    return () => window.clearTimeout(timeout);
  }, [query, categoryFilter, originFilter]);

  function populateForm(food: Food | null, isClone = false) {
    if (!food) {
      setFormName("");
      setFormPortion("100 g");
      setFormMeasure("");
      setFormCalories("");
      setFormProtein("");
      setFormCarbs("");
      setFormFat("");
      setFormFiber("");
      setFormCategory(FOOD_CATEGORIES[0]);
      return;
    }

    setFormName(isClone ? `${food.name} (Personalizado)` : food.name);
    setFormPortion(food.portion || "100 g");
    setFormMeasure(food.householdMeasure || "");
    setFormCalories(valueForInput(food.calories));
    setFormProtein(valueForInput(food.protein));
    setFormCarbs(valueForInput(food.carbs));
    setFormFat(valueForInput(food.fat));
    setFormFiber(valueForInput(food.fiber));
    setFormCategory(food.category || FOOD_CATEGORIES[0]);
  }

  async function loadFoods(search = "", category = "", origin = "all") {
    setLoading(true);
    const params = new URLSearchParams();

    if (search.trim()) params.set("q", search.trim());
    if (category) params.set("category", category);
    if (origin && origin !== "all") params.set("origin", origin);
    params.set("limit", "1000");

    const response = await fetch(`/api/foods?${params}`);
    const data = (await response.json()) as FoodsResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível carregar alimentos.");
      return;
    }

    setFoods(data.foods);
    setTotalFoods(data.total ?? data.foods.length);
  }

  async function handleSeedCurated() {
    setSeeding(true);
    setMessage(null);

    try {
      const response = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_curated" })
      });
      const data = (await response.json()) as { seededCount?: number; enrichedCount?: number; error?: string };

      if (!response.ok) {
        setMessage(data.error || "Não foi possível sincronizar a base oficial.");
      } else {
        setMessage(
          `Base sincronizada com sucesso! ${data.seededCount || 0} alimentos curados e ${data.enrichedCount || 0} medidas caseiras atualizadas no banco.`
        );
        await loadFoods(query, categoryFilter, originFilter);
      }
    } catch {
      setMessage("Base curada ativa em memória local.");
    } finally {
      setSeeding(false);
    }
  }

  async function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      setMessage("O arquivo CSV precisa ter cabeçalho e pelo menos 1 linha de alimento.");
      return;
    }

    const parsedFoods = lines.slice(1).map((line) => {
      const cols = line.split(/[;,]/).map((c) => c.trim().replace(/^"|"$/g, ""));
      return {
        name: cols[0] || "Alimento Importado",
        portion: cols[1] || "100 g",
        householdMeasure: cols[2] || "4 colheres de sopa (100 g)",
        calories: Number(cols[3] || 0),
        protein: Number(cols[4] || 0),
        carbs: Number(cols[5] || 0),
        fat: Number(cols[6] || 0),
        fiber: Number(cols[7] || 0),
        category: cols[8] || "Cereais, Pães e Tubérculos"
      };
    }).filter((item) => item.name.length >= 2);

    setSeeding(true);
    const response = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bulk_import", foods: parsedFoods })
    });
    const data = (await response.json()) as { importedCount?: number; error?: string };
    setSeeding(false);
    event.target.value = "";

    if (!response.ok) {
      setMessage(data.error || "Erro ao importar planilha CSV.");
      return;
    }

    setMessage(`${data.importedCount || parsedFoods.length} alimentos importados para sua clínica!`);
    await loadFoods(query, categoryFilter, originFilter);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name: formName.trim(),
      portion: formPortion.trim() || "100 g",
      householdMeasure: formMeasure.trim() || undefined,
      calories: Number(formCalories || 0),
      protein: Number(formProtein || 0),
      carbs: Number(formCarbs || 0),
      fat: Number(formFat || 0),
      fiber: formFiber ? Number(formFiber) : undefined,
      category: formCategory || undefined,
      source: "Personalizado (Clínica)"
    };

    setSaving(true);
    setMessage(null);

    const isPatch = Boolean(editingFood && editingFood.organizationId);
    const url = isPatch ? `/api/foods/${editingFood!.id}` : "/api/foods";
    const method = isPatch ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível salvar o alimento.");
      return;
    }

    if (isPatch) {
      setEditingFood(null);
      setCloningFood(null);
      populateForm(null);
      setMessage("Alimento atualizado com sucesso.");
    } else {
      setEditingFood(null);
      setCloningFood(null);
      populateForm(null);
      setMessage("Alimento personalizado salvo na base da sua clínica!");
    }

    await loadFoods(query, categoryFilter, originFilter);
  }

  async function handleDelete(food: Food) {
    const confirmed = window.confirm(`Excluir ${food.name}?`);
    if (!confirmed) return;

    setDeletingId(food.id);
    setMessage(null);

    const response = await fetch(`/api/foods/${food.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível excluir o alimento.");
      return;
    }

    if (editingFood?.id === food.id) {
      setEditingFood(null);
      populateForm(null);
    }

    setMessage("Alimento excluído com sucesso.");
    await loadFoods(query, categoryFilter, originFilter);
  }

  return (
    <section className="workspace-grid">
      <div className="surface food-list">
        <div className="section-title-row" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="eyebrow">Catálogo Multiprofissional</span>
            <h2>Base de Alimentos, Suplementos e Fórmulas</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo de alimentos" style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span>{totalFoods} disponíveis</span>
            <span>{customFoodsCount} da clínica</span>
            <button
              type="button"
              className="button secondary"
              style={{ padding: "6px 12px", fontSize: "0.82rem" }}
              disabled={seeding}
              onClick={() => void handleSeedCurated()}
            >
              {seeding ? "Sincronizando..." : "⚡ Sincronizar Medidas Caseiras & Base Oficial"}
            </button>
            <button
              type="button"
              className="button secondary"
              style={{ padding: "6px 12px", fontSize: "0.82rem" }}
              onClick={() => csvInputRef.current?.click()}
            >
              📥 Importar CSV
            </button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,.txt"
              style={{ display: "none" }}
              onChange={(e) => void handleCsvUpload(e)}
            />
          </div>
        </div>

        {/* Filtros de Origem (Abas rápidas) */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          {[
            { id: "all", label: "Todos" },
            { id: "curated", label: "⭐ Curadoria com Medidas Caseiras" },
            { id: "supplements", label: "💊 Suplementos & Nutrição Clínica/Enteral" },
            { id: "custom", label: "🏥 Personalizados da Clínica" },
            { id: "taco", label: "📚 Tabela TACO" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setOriginFilter(tab.id)}
              className={originFilter === tab.id ? "status-pill ok" : "status-pill"}
              style={{
                cursor: "pointer",
                border: originFilter === tab.id ? "1px solid var(--primary, #00b894)" : "1px solid var(--border)",
                padding: "6px 12px",
                fontWeight: originFilter === tab.id ? 600 : 400
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Linha de Busca + Categoria + Simulador de Porção em Gramas */}
        <div className="form-row" style={{ gap: "12px", marginBottom: "12px", alignItems: "flex-end" }}>
          <label className="search-field" style={{ flex: 2, margin: 0 }}>
            <span>Buscar (aceita com ou sem acento)</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex: pao frances, arroz, frango, whey, espessante, maca..."
            />
          </label>

          <label className="search-field" style={{ flex: 1.4, margin: 0 }}>
            <span>Categoria</span>
            <select
              className="inline-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="">Todas as categorias</option>
              {FOOD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="search-field" style={{ flex: 0.9, margin: 0 }}>
            <span>Simular porção (g/ml)</span>
            <input
              type="number"
              min="1"
              step="5"
              value={simulatorGrams}
              onChange={(event) =>
                setSimulatorGrams(event.target.value ? Math.max(1, Number(event.target.value)) : "")
              }
              placeholder="Porção original"
              title="Digite um peso em gramas (ex: 45, 120, 150) para recalcular todos os macros da tabela instantaneamente"
            />
          </label>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alimento / Fórmula</th>
                <th>Porção & Medida Caseira</th>
                <th>Macros {simulatorGrams ? `(Simulado p/ ${simulatorGrams}g)` : "(Na porção)"}</th>
                <th>Origem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => {
                const custom = Boolean(food.organizationId);
                const baseGrams = extractGramsFromPortion(food.portion);
                const factor = simulatorGrams && baseGrams > 0 ? Number(simulatorGrams) / baseGrams : 1;

                const kcal = toNumber(food.calories) * factor;
                const prot = toNumber(food.protein) * factor;
                const carb = toNumber(food.carbs) * factor;
                const fat = toNumber(food.fat) * factor;
                const fib = toNumber(food.fiber) * factor;

                return (
                  <tr
                    key={food.id}
                    className={
                      editingFood?.id === food.id || cloningFood?.id === food.id ? "selected-row" : undefined
                    }
                  >
                    <td>
                      <strong>{food.name}</strong>
                      <span>{food.category || "Cereais, Pães e Tubérculos"}</span>
                    </td>
                    <td>
                      <strong>{simulatorGrams ? `${simulatorGrams} g (simulado)` : food.portion}</strong>
                      <span>{food.householdMeasure || "4 colheres de sopa (100 g)"}</span>
                    </td>
                    <td>
                      <strong>{kcal.toFixed(0)} kcal</strong>
                      <span>
                        P {prot.toFixed(1)}g | C {carb.toFixed(1)}g | G {fat.toFixed(1)}g
                        {fib > 0 ? ` | Fib ${fib.toFixed(1)}g` : ""}
                      </span>
                    </td>
                    <td>
                      <span className={custom ? "status-pill ok" : "status-pill"}>
                        {custom ? "Clínica" : food.source?.includes("Curadoria") ? "Curada" : food.source?.includes("Suplement") || food.source?.includes("Protocolo") ? "Clínico" : "Global"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        {custom ? (
                          <>
                            <button
                              className="text-button"
                              type="button"
                              onClick={() => {
                                setEditingFood(food);
                                setCloningFood(null);
                                populateForm(food, false);
                                setMessage(null);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="text-button danger"
                              type="button"
                              disabled={deletingId === food.id}
                              onClick={() => void handleDelete(food)}
                            >
                              {deletingId === food.id ? "Excluindo..." : "Excluir"}
                            </button>
                          </>
                        ) : (
                          <button
                            className="text-button"
                            type="button"
                            title="Cria uma cópia editável deste item para sua clínica ajustar porção ou medida caseira"
                            onClick={() => {
                              setEditingFood(null);
                              setCloningFood(food);
                              populateForm(food, true);
                              setMessage(`Personalizando cópia de "${food.name}" para sua clínica.`);
                            }}
                          >
                            Personalizar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && foods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Nenhum alimento encontrado para esse filtro.
                  </td>
                </tr>
              ) : null}

              {loading ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Carregando alimentos...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">
          {editing ? "Edição da Clínica" : cloningFood ? "Personalizar Item Global" : "Novo Alimento / Suplemento"}
        </span>
        <h2>
          {editing ? "Editar alimento" : cloningFood ? "Salvar versão da clínica" : "Cadastrar item"}
        </h2>

        <form className="form compact-form" onSubmit={handleSubmit}>
          <label>
            Nome do alimento, fórmula ou suplemento
            <input
              name="name"
              required
              minLength={2}
              placeholder="Ex: Pão de fermentação natural / Whey Isolado"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </label>

          <label>
            Medida caseira rápida (sugestão automática)
            <select
              className="inline-select"
              value=""
              onChange={(e) => {
                const preset = HOUSEHOLD_MEASURE_PRESETS.find((p) => p.label === e.target.value);
                if (preset) {
                  setFormMeasure(preset.label);
                  setFormPortion(preset.portion);
                }
              }}
            >
              <option value="">Escolher medida caseira padrão...</option>
              {HOUSEHOLD_MEASURE_PRESETS.map((preset) => (
                <option key={preset.label} value={preset.label}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <div className="form-row">
            <label>
              Porção base (g ou ml)
              <input
                name="portion"
                required
                placeholder="100 g"
                value={formPortion}
                onChange={(e) => setFormPortion(e.target.value)}
              />
            </label>
            <label>
              Descrição da medida caseira
              <input
                name="householdMeasure"
                placeholder="Ex: 2 fatias médias (50 g)"
                value={formMeasure}
                onChange={(e) => setFormMeasure(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Proteína (g)
              <input
                name="protein"
                type="number"
                min="0"
                step="0.01"
                required
                value={formProtein}
                onChange={(e) => setFormProtein(e.target.value)}
              />
            </label>
            <label>
              Carboidrato (g)
              <input
                name="carbs"
                type="number"
                min="0"
                step="0.01"
                required
                value={formCarbs}
                onChange={(e) => setFormCarbs(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Gordura Total (g)
              <input
                name="fat"
                type="number"
                min="0"
                step="0.01"
                required
                value={formFat}
                onChange={(e) => setFormFat(e.target.value)}
              />
            </label>
            <label>
              Fibra Alimentar (g)
              <input
                name="fiber"
                type="number"
                min="0"
                step="0.01"
                value={formFiber}
                onChange={(e) => setFormFiber(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row" style={{ alignItems: "flex-end" }}>
            <label style={{ flex: 1 }}>
              Calorias (kcal)
              <input
                name="calories"
                type="number"
                min="0"
                step="0.01"
                required
                value={formCalories}
                onChange={(e) => setFormCalories(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="button secondary"
              style={{ height: "42px", padding: "0 12px", fontSize: "0.8rem" }}
              onClick={() => setFormCalories(String(estimatedKcal))}
              title="Calcula 4 kcal/g Proteína + 4 kcal/g Carbo + 9 kcal/g Gordura"
            >
              Auto ({estimatedKcal} kcal)
            </button>
          </div>

          <label>
            Categoria
            <select
              name="category"
              className="inline-select"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
            >
              {FOOD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <button className="button" type="submit" disabled={saving}>
            {saving
              ? "Salvando..."
              : editing
                ? "Salvar alterações"
                : cloningFood
                  ? "Salvar versão personalizada"
                  : "Cadastrar na clínica"}
          </button>

          {editing || cloningFood ? (
            <button
              className="button secondary"
              type="button"
              onClick={() => {
                setEditingFood(null);
                setCloningFood(null);
                populateForm(null);
              }}
            >
              Cancelar
            </button>
          ) : null}
        </form>
      </aside>
    </section>
  );
}

export function extractGramsFromPortion(portion: string): number {
  const match = String(portion || "").match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return 100;
  const parsed = Number(match[1].replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
}

function toNumber(value: string | number | null | undefined) {
  return Number(value || 0);
}

function valueForInput(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}
