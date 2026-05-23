"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

export function FoodsClient() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalFoods, setTotalFoods] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  const editing = Boolean(editingFood);
  const customFoods = useMemo(() => foods.filter((food) => food.organizationId).length, [foods]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadFoods(query);
    }, query.trim() ? 220 : 0);

    return () => window.clearTimeout(timeout);
  }, [query]);

  async function loadFoods(search = "") {
    setLoading(true);
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("q", search.trim());
    }

    params.set("limit", "1000");

    const response = await fetch(`/api/foods?${params}`);
    const data = (await response.json()) as FoodsResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar alimentos.");
      return;
    }

    setFoods(data.foods);
    setTotalFoods(data.total ?? data.foods.length);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = getFoodPayload(form);

    setSaving(true);
    setMessage(null);

    const response = await fetch(editingFood ? `/api/foods/${editingFood.id}` : "/api/foods", {
      method: editingFood ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel salvar o alimento.");
      return;
    }

    if (editingFood) {
      setEditingFood(null);
      setMessage("Alimento atualizado com sucesso.");
    } else {
      formElement.reset();
      setMessage("Alimento cadastrado com sucesso.");
    }

    await loadFoods(query);
  }

  async function handleDelete(food: Food) {
    const confirmed = window.confirm(`Excluir ${food.name}?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(food.id);
    setMessage(null);

    const response = await fetch(`/api/foods/${food.id}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel excluir o alimento.");
      return;
    }

    if (editingFood?.id === food.id) {
      setEditingFood(null);
    }

    setMessage("Alimento excluido com sucesso.");
    await loadFoods(query);
  }

  return (
    <section className="workspace-grid">
      <div className="surface food-list">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Tabela</span>
            <h2>Base de alimentos</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo de alimentos">
            <span>{totalFoods} no banco</span>
            <span>{customFoods} personalizados</span>
          </div>
        </div>

        <label className="search-field">
          <span>Buscar</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Arroz, frango, banana..." />
        </label>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alimento</th>
                <th>Porcao</th>
                <th>Macros</th>
                <th>Origem</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => {
                const custom = Boolean(food.organizationId);

                return (
                  <tr key={food.id} className={editingFood?.id === food.id ? "selected-row" : undefined}>
                    <td>
                      <strong>{food.name}</strong>
                      <span>{food.category || "Sem categoria"}</span>
                    </td>
                    <td>
                      <strong>{food.portion}</strong>
                      <span>{food.householdMeasure || "Medida caseira nao informada"}</span>
                    </td>
                    <td>
                      <strong>{toNumber(food.calories).toFixed(0)} kcal</strong>
                      <span>
                        P {toNumber(food.protein).toFixed(1)}g | C {toNumber(food.carbs).toFixed(1)}g | G{" "}
                        {toNumber(food.fat).toFixed(1)}g
                      </span>
                    </td>
                    <td>
                      <span className={custom ? "status-pill ok" : "status-pill"}>{custom ? "Clinica" : "Global"}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="text-button"
                          type="button"
                          disabled={!custom}
                          onClick={() => {
                            setEditingFood(food);
                            setMessage(null);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="text-button danger"
                          type="button"
                          disabled={!custom || deletingId === food.id}
                          onClick={() => void handleDelete(food)}
                        >
                          {deletingId === food.id ? "Excluindo..." : "Excluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && foods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Nenhum alimento encontrado.
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
        <span className="eyebrow">{editing ? "Edicao" : "Novo alimento"}</span>
        <h2>{editing ? "Editar alimento" : "Cadastrar alimento"}</h2>
        <form key={editingFood?.id || "new"} className="form compact-form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input name="name" required minLength={2} placeholder="Iogurte natural" defaultValue={editingFood?.name || ""} />
          </label>
          <div className="form-row">
            <label>
              Porcao
              <input name="portion" required placeholder="100 g" defaultValue={editingFood?.portion || ""} />
            </label>
            <label>
              Medida caseira
              <input name="householdMeasure" placeholder="1 unidade" defaultValue={editingFood?.householdMeasure || ""} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Calorias
              <input name="calories" type="number" min="0" step="0.01" required defaultValue={valueForInput(editingFood?.calories)} />
            </label>
            <label>
              Proteina g
              <input name="protein" type="number" min="0" step="0.01" required defaultValue={valueForInput(editingFood?.protein)} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Carbo g
              <input name="carbs" type="number" min="0" step="0.01" required defaultValue={valueForInput(editingFood?.carbs)} />
            </label>
            <label>
              Gordura g
              <input name="fat" type="number" min="0" step="0.01" required defaultValue={valueForInput(editingFood?.fat)} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Fibra g
              <input name="fiber" type="number" min="0" step="0.01" defaultValue={valueForInput(editingFood?.fiber)} />
            </label>
            <label>
              Categoria
              <input name="category" placeholder="Laticinios" defaultValue={editingFood?.category || ""} />
            </label>
          </div>
          <button className="button" type="submit" disabled={saving}>
            {saving ? "Salvando..." : editing ? "Salvar alteracoes" : "Cadastrar alimento"}
          </button>
          {editing ? (
            <button className="button secondary" type="button" onClick={() => setEditingFood(null)}>
              Cancelar edicao
            </button>
          ) : null}
        </form>
      </aside>
    </section>
  );
}

function getFoodPayload(form: FormData) {
  const fiber = String(form.get("fiber") || "");

  return {
    name: form.get("name"),
    portion: form.get("portion"),
    householdMeasure: form.get("householdMeasure"),
    calories: form.get("calories"),
    protein: form.get("protein"),
    carbs: form.get("carbs"),
    fat: form.get("fat"),
    fiber: fiber || undefined,
    category: form.get("category"),
    source: "custom"
  };
}

function toNumber(value: string | number | null | undefined) {
  return Number(value || 0);
}

function valueForInput(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}
