"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pencil,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X
} from "lucide-react";
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

const PAGE_SIZE = 50;

const ORIGIN_TABS = [
  { id: "all", label: "Todos" },
  { id: "curated", label: "Curadoria" },
  { id: "supplements", label: "Suplementos & Clínico" },
  { id: "custom", label: "Da Clínica" },
  { id: "taco", label: "Tabela TACO" }
] as const;

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
  const [message, setMessage] = useState<{ text: string; tone: "ok" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalFoods, setTotalFoods] = useState(0);
  const [page, setPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
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
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  const editing = Boolean(editingFood);
  const customFoodsCount = useMemo(() => foods.filter((food) => food.organizationId).length, [foods]);
  const estimatedKcal = useMemo(() => {
    const p = Number(formProtein || 0);
    const c = Number(formCarbs || 0);
    const f = Number(formFat || 0);
    return Math.round((p * 4 + c * 4 + f * 9) * 10) / 10;
  }, [formProtein, formCarbs, formFat]);

  const hasActiveFilters = Boolean(
    query.trim() || categoryFilter || originFilter !== "all" || simulatorGrams !== ""
  );

  const totalPages = Math.max(1, Math.ceil(foods.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStartIndex = (safePage - 1) * PAGE_SIZE;
  const visibleFoods = useMemo(
    () => foods.slice(pageStartIndex, pageStartIndex + PAGE_SIZE),
    [foods, pageStartIndex]
  );

  useEffect(() => {
    setPage(1);
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
    }
    const timeout = window.setTimeout(() => {
      void loadFoods(query, categoryFilter, originFilter);
    }, query.trim() ? 180 : 0);

    return () => window.clearTimeout(timeout);
  }, [query, categoryFilter, originFilter]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && drawerOpen) {
        closeDrawer();
      }
      if (
        event.key === "/" &&
        !drawerOpen &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        document.activeElement?.tagName !== "SELECT"
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

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

  function openCreateDrawer() {
    setEditingFood(null);
    setCloningFood(null);
    populateForm(null);
    setDrawerOpen(true);
  }

  function openEditDrawer(food: Food) {
    setEditingFood(food);
    setCloningFood(null);
    populateForm(food, false);
    setDrawerOpen(true);
  }

  function openCloneDrawer(food: Food) {
    setEditingFood(null);
    setCloningFood(food);
    populateForm(food, true);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingFood(null);
    setCloningFood(null);
  }

  function clearFilters() {
    setQuery("");
    setCategoryFilter("");
    setOriginFilter("all");
    setSimulatorGrams("");
    searchInputRef.current?.focus();
  }

  function goToPage(nextPage: number) {
    const clamped = Math.max(1, Math.min(totalPages, nextPage));
    setPage(clamped);
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
    }
  }

  async function loadFoods(search = "", category = "", origin = "all") {
    setLoading(true);
    const params = new URLSearchParams();

    if (search.trim()) params.set("q", search.trim());
    if (category) params.set("category", category);
    if (origin && origin !== "all") params.set("origin", origin);
    params.set("limit", "1000");

    try {
      const response = await fetch(`/api/foods?${params}`);
      const data = (await response.json()) as FoodsResponse & { error?: string };

      if (!response.ok) {
        setMessage({ text: data.error || "Não foi possível carregar alimentos.", tone: "error" });
        return;
      }

      setFoods(data.foods);
      setTotalFoods(data.total ?? data.foods.length);
    } catch {
      setMessage({ text: "Erro de conexão ao carregar alimentos.", tone: "error" });
    } finally {
      setLoading(false);
    }
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
        setMessage({ text: data.error || "Não foi possível sincronizar a base oficial.", tone: "error" });
      } else {
        setMessage({
          text: `Base sincronizada: ${data.seededCount || 0} alimentos curados e ${data.enrichedCount || 0} medidas caseiras atualizadas.`,
          tone: "ok"
        });
        await loadFoods(query, categoryFilter, originFilter);
      }
    } catch {
      setMessage({ text: "Base curada ativa em memória local.", tone: "ok" });
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
      setMessage({ text: "O CSV precisa ter cabeçalho e pelo menos 1 linha de alimento.", tone: "error" });
      return;
    }

    const parsedFoods = lines
      .slice(1)
      .map((line) => {
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
      })
      .filter((item) => item.name.length >= 2);

    setSeeding(true);
    try {
      const response = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_import", foods: parsedFoods })
      });
      const data = (await response.json()) as { importedCount?: number; error?: string };

      if (!response.ok) {
        setMessage({ text: data.error || "Erro ao importar planilha CSV.", tone: "error" });
        return;
      }

      setMessage({ text: `${data.importedCount || parsedFoods.length} alimentos importados para sua clínica!`, tone: "ok" });
      await loadFoods(query, categoryFilter, originFilter);
    } finally {
      setSeeding(false);
      event.target.value = "";
    }
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

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage({ text: data.error || "Não foi possível salvar o alimento.", tone: "error" });
        return;
      }

      closeDrawer();
      populateForm(null);
      setMessage({
        text: isPatch
          ? "Alimento atualizado com sucesso."
          : "Alimento personalizado salvo na base da sua clínica!",
        tone: "ok"
      });
      await loadFoods(query, categoryFilter, originFilter);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(food: Food) {
    const confirmed = window.confirm(`Excluir "${food.name}" da base da sua clínica?`);
    if (!confirmed) return;

    setDeletingId(food.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/foods/${food.id}`, {
        method: "DELETE"
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage({ text: data.error || "Não foi possível excluir o alimento.", tone: "error" });
        return;
      }

      if (editingFood?.id === food.id) {
        closeDrawer();
        populateForm(null);
      }

      setMessage({ text: "Alimento excluído com sucesso.", tone: "ok" });
      await loadFoods(query, categoryFilter, originFilter);
    } finally {
      setDeletingId(null);
    }
  }

  const showingFrom = foods.length === 0 ? 0 : pageStartIndex + 1;
  const showingTo = Math.min(pageStartIndex + PAGE_SIZE, foods.length);

  return (
    <section className="foods-workspace">
      {/* Cabeçalho compacto em linha única */}
      <header className="foods-header">
        <div className="foods-header-title">
          <h1>Alimentos e Fórmulas</h1>
          <div className="foods-header-badges">
            <span className="foods-count-badge">{totalFoods} itens</span>
            {customFoodsCount > 0 ? (
              <span className="foods-count-badge clinic">{customFoodsCount} da clínica</span>
            ) : null}
          </div>
        </div>

        <div className="foods-header-actions">
          <button
            type="button"
            className="foods-btn secondary"
            disabled={seeding}
            onClick={() => void handleSeedCurated()}
            title="Sincronizar medidas caseiras e base oficial TACO/TBCA"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? "animate-spin" : ""}`} />
            <span>{seeding ? "Sincronizando..." : "Sincronizar"}</span>
          </button>

          <button
            type="button"
            className="foods-btn secondary"
            onClick={() => csvInputRef.current?.click()}
            title="Importar planilha CSV de alimentos"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar CSV</span>
          </button>

          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(e) => void handleCsvUpload(e)}
          />

          <button
            type="button"
            className="foods-btn primary"
            onClick={openCreateDrawer}
          >
            <Plus className="w-4 h-4" />
            <span>Novo alimento</span>
          </button>
        </div>
      </header>

      {/* Painel principal: filtros fixos no topo + tabela compacta */}
      <div className="foods-panel">
        {/* Linha 1: Busca + Categoria + Simulador de Porção na MESMA linha */}
        <div className="foods-toolbar">
          <div className="foods-search-wrap">
            <Search className="foods-input-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="foods-input foods-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar ingrediente, fórmula ou medida (ex: leite, arroz, frango, whey)..."
              aria-label="Buscar alimento"
            />
            {query ? (
              <button
                type="button"
                className="foods-input-clear"
                onClick={() => {
                  setQuery("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="foods-kbd" title="Pressione / para buscar">
                /
              </kbd>
            )}
          </div>

          <select
            className="foods-input foods-select"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filtrar por categoria"
          >
            <option value="">Todas as categorias</option>
            {FOOD_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className={`foods-sim-wrap ${simulatorGrams ? "active" : ""}`}>
            <Scale className="foods-input-icon" />
            <input
              type="number"
              min="1"
              step="5"
              className="foods-input foods-sim-input"
              value={simulatorGrams}
              onChange={(event) =>
                setSimulatorGrams(event.target.value ? Math.max(1, Number(event.target.value)) : "")
              }
              placeholder="Simular g/ml"
              title="Digite um peso em gramas ou ml (ex: 45, 150, 200) para recalcular todos os macros da tabela"
              aria-label="Simular porção em gramas ou ml"
            />
            {simulatorGrams ? (
              <button
                type="button"
                className="foods-input-clear"
                onClick={() => setSimulatorGrams("")}
                aria-label="Limpar simulação de porção"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="foods-sim-unit">g/ml</span>
            )}
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              className="foods-btn ghost"
              onClick={clearFilters}
              title="Limpar todos os filtros"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          ) : null}
        </div>

        {/* Linha 2: Abas de origem compactas + contador de resultados */}
        <div className="foods-subbar">
          <div className="foods-tabs" role="tablist" aria-label="Filtrar por origem">
            {ORIGIN_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={originFilter === tab.id}
                onClick={() => setOriginFilter(tab.id)}
                className={`foods-tab ${originFilter === tab.id ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="foods-meta">
            {loading ? (
              <span>Buscando...</span>
            ) : (
              <span>
                {foods.length > 0
                  ? `${showingFrom}–${showingTo} de ${totalFoods}`
                  : "0 resultados"}
              </span>
            )}
          </div>
        </div>

        {/* Alerta compacto e dispensável (não ocupa espaço permanente) */}
        {message ? (
          <div className={`foods-toast ${message.tone}`} role="status">
            <div className="foods-toast-content">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message.text}</span>
            </div>
            <button
              type="button"
              className="foods-toast-close"
              onClick={() => setMessage(null)}
              aria-label="Fechar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null}

        {/* Tabela de alta densidade com cabeçalho fixo */}
        <div ref={tableScrollRef} className="foods-table-scroll">
          <table className="foods-table">
            <thead>
              <tr>
                <th className="col-name">Alimento / Fórmula</th>
                <th className="col-portion">Porção & Medida Caseira</th>
                <th className="col-macros">
                  Macros {simulatorGrams ? `(p/ ${simulatorGrams} g)` : "(na porção)"}
                </th>
                <th className="col-origin">Origem</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && foods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="foods-empty">
                    Carregando base nutricional...
                  </td>
                </tr>
              ) : null}

              {!loading && visibleFoods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="foods-empty">
                    <div>Nenhum ingrediente encontrado para esse filtro.</div>
                    {hasActiveFilters ? (
                      <button type="button" className="foods-btn secondary mt-2" onClick={clearFilters}>
                        Limpar filtros
                      </button>
                    ) : null}
                  </td>
                </tr>
              ) : null}

              {visibleFoods.map((food) => {
                const custom = Boolean(food.organizationId);
                const baseGrams = extractGramsFromPortion(food.portion);
                const factor = simulatorGrams && baseGrams > 0 ? Number(simulatorGrams) / baseGrams : 1;

                const kcal = toNumber(food.calories) * factor;
                const prot = toNumber(food.protein) * factor;
                const carb = toNumber(food.carbs) * factor;
                const fat = toNumber(food.fat) * factor;
                const fib = toNumber(food.fiber) * factor;

                const originMeta = getOriginMeta(food, custom);
                const isSelected = editingFood?.id === food.id || cloningFood?.id === food.id;

                return (
                  <tr key={food.id} className={isSelected ? "is-selected" : undefined}>
                    <td className="col-name">
                      <div className="foods-cell-stack">
                        <strong className="foods-name">{food.name}</strong>
                        <span className="foods-category">
                          {food.category || "Cereais, Pães e Tubérculos"}
                        </span>
                      </div>
                    </td>

                    <td className="col-portion">
                      <div className="foods-cell-stack">
                        <div className="foods-portion-line">
                          <strong className="foods-portion">
                            {simulatorGrams ? `${simulatorGrams} g` : food.portion}
                          </strong>
                          {simulatorGrams ? (
                            <span className="foods-sim-badge">simulado</span>
                          ) : null}
                        </div>
                        <span
                          className="foods-measure"
                          title={food.householdMeasure || "4 colheres de sopa (100 g)"}
                        >
                          {food.householdMeasure || "4 colheres de sopa (100 g)"}
                        </span>
                      </div>
                    </td>

                    <td className="col-macros">
                      <div className="foods-cell-stack">
                        <strong className="foods-kcal">{kcal.toFixed(0)} kcal</strong>
                        <div className="foods-macro-pills">
                          <span className="foods-macro ptn">P {prot.toFixed(1)}g</span>
                          <span className="foods-macro cho">C {carb.toFixed(1)}g</span>
                          <span className="foods-macro lip">G {fat.toFixed(1)}g</span>
                          {fib > 0 ? (
                            <span className="foods-macro fib">Fib {fib.toFixed(1)}g</span>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    <td className="col-origin">
                      <span className={`foods-origin-pill ${originMeta.tone}`}>
                        {originMeta.label}
                      </span>
                    </td>

                    <td className="col-actions">
                      <div className="foods-row-actions">
                        {custom ? (
                          <>
                            <button
                              type="button"
                              className="foods-action-btn"
                              onClick={() => openEditDrawer(food)}
                              title="Editar alimento da clínica"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              className="foods-action-btn danger"
                              disabled={deletingId === food.id}
                              onClick={() => void handleDelete(food)}
                              title="Excluir alimento da clínica"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="sr-only">Excluir</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="foods-action-btn"
                            onClick={() => openCloneDrawer(food)}
                            title="Cria uma cópia editável deste item para sua clínica ajustar porção ou medida caseira"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Personalizar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé de paginação compacto */}
        {foods.length > PAGE_SIZE ? (
          <div className="foods-pagination">
            <span className="foods-pagination-info">
              Página <strong>{safePage}</strong> de <strong>{totalPages}</strong> · mostrando {showingFrom}–{showingTo} de {foods.length}
            </span>
            <div className="foods-pagination-controls">
              <button
                type="button"
                className="foods-btn secondary"
                disabled={safePage <= 1}
                onClick={() => goToPage(safePage - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <button
                type="button"
                className="foods-btn secondary"
                disabled={safePage >= totalPages}
                onClick={() => goToPage(safePage + 1)}
              >
                <span>Próxima</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Drawer lateral para Cadastrar / Editar / Personalizar sem precisar rolar a página */}
      {drawerOpen ? (
        <div
          className="foods-drawer-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="foods-drawer-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeDrawer();
            }
          }}
        >
          <aside className="foods-drawer">
            <div className="foods-drawer-header">
              <div>
                <span className="foods-drawer-eyebrow">
                  {editing
                    ? "Edição da Clínica"
                    : cloningFood
                      ? "Personalizar Item Global"
                      : "Novo Alimento / Suplemento"}
                </span>
                <h2 id="foods-drawer-title">
                  {editing
                    ? "Editar alimento"
                    : cloningFood
                      ? "Salvar versão da clínica"
                      : "Cadastrar ingrediente"}
                </h2>
              </div>
              <button
                type="button"
                className="foods-drawer-close"
                onClick={closeDrawer}
                aria-label="Fechar painel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form className="foods-drawer-form" onSubmit={handleSubmit}>
              <div className="foods-drawer-body">
                <label className="foods-field">
                  <span>Nome do alimento, fórmula ou suplemento</span>
                  <input
                    name="name"
                    required
                    minLength={2}
                    placeholder="Ex: Pão de fermentação natural / Whey Isolado"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </label>

                <label className="foods-field">
                  <span>Categoria</span>
                  <select
                    name="category"
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

                <label className="foods-field">
                  <span>Medida caseira rápida (sugestão automática)</span>
                  <select
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

                <div className="foods-field-grid">
                  <label className="foods-field">
                    <span>Porção base (g ou ml)</span>
                    <input
                      name="portion"
                      required
                      placeholder="100 g"
                      value={formPortion}
                      onChange={(e) => setFormPortion(e.target.value)}
                    />
                  </label>
                  <label className="foods-field">
                    <span>Medida caseira</span>
                    <input
                      name="householdMeasure"
                      placeholder="Ex: 1 copo (200 ml)"
                      value={formMeasure}
                      onChange={(e) => setFormMeasure(e.target.value)}
                    />
                  </label>
                </div>

                <div className="foods-field-grid">
                  <label className="foods-field">
                    <span>Proteína (g)</span>
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
                  <label className="foods-field">
                    <span>Carboidrato (g)</span>
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

                <div className="foods-field-grid">
                  <label className="foods-field">
                    <span>Gordura Total (g)</span>
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
                  <label className="foods-field">
                    <span>Fibra Alimentar (g)</span>
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

                <div className="foods-kcal-row">
                  <label className="foods-field">
                    <span>Calorias (kcal)</span>
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
                    className="foods-btn secondary foods-auto-kcal"
                    onClick={() => setFormCalories(String(estimatedKcal))}
                    title="Calcula 4 kcal/g Proteína + 4 kcal/g Carbo + 9 kcal/g Gordura"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto ({estimatedKcal})</span>
                  </button>
                </div>
              </div>

              <div className="foods-drawer-footer">
                <button type="button" className="foods-btn secondary" onClick={closeDrawer}>
                  Cancelar
                </button>
                <button type="submit" className="foods-btn primary" disabled={saving}>
                  {saving
                    ? "Salvando..."
                    : editing
                      ? "Salvar alterações"
                      : cloningFood
                        ? "Salvar versão personalizada"
                        : "Cadastrar na clínica"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </section>
  );
}

function getOriginMeta(food: Food, custom: boolean): { label: string; tone: string } {
  if (custom) return { label: "Clínica", tone: "clinic" };
  if (food.source?.includes("Curadoria")) return { label: "Curada", tone: "curated" };
  if (food.source?.includes("Suplement") || food.source?.includes("Protocolo")) {
    return { label: "Clínico", tone: "clinical" };
  }
  return { label: "Global", tone: "global" };
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
