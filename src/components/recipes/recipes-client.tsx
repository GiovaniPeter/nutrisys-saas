"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Food = {
  id: string;
  name: string;
  portion: string;
  calories: string | number;
  protein: string | number;
  carbs: string | number;
  fat: string | number;
  fiber: string | number | null;
};

type Ingredient = {
  id: string;
  foodId?: string | null;
  foodName: string;
  portion: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  position: number;
  notes?: string;
};

type Recipe = {
  id: string;
  name: string;
  category: string | null;
  prepTimeMin: number | null;
  servings: number;
  difficulty: string | null;
  tags: string[];
  steps: string[];
  notes: string | null;
  ingredients: Ingredient[];
};

type RecipesResponse = {
  recipes: Recipe[];
};

type FoodsResponse = {
  foods: Food[];
  total: number;
};

const categories = ["Cafe da manha", "Almoco", "Jantar", "Lanches", "Sobremesas", "Sopas", "Saladas", "Bebidas", "Fitness"];
const tags = ["Low carb", "Vegetariana", "Vegana", "Sem gluten", "Sem lactose", "Rica em proteina", "Rica em fibra", "Rapida", "Economica"];

export function RecipesClient() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [foodSearch, setFoodSearch] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [stepsText, setStepsText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedFood = foods.find((food) => food.id === selectedFoodId) || null;
  const totals = useMemo(() => sumIngredients(ingredients), [ingredients]);
  const editing = Boolean(editingRecipe);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadRecipes();
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [query, categoryFilter, tagFilter]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadFoods(foodSearch);
    }, 240);

    return () => window.clearTimeout(timeout);
  }, [foodSearch]);

  async function loadRecipes() {
    setLoading(true);
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (categoryFilter) params.set("category", categoryFilter);
    if (tagFilter) params.set("tag", tagFilter);

    const response = await fetch(`/api/recipes${params.size ? `?${params}` : ""}`);
    const data = (await response.json()) as RecipesResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar receitas.");
      return;
    }

    setRecipes(data.recipes);
  }

  async function loadFoods(search = "") {
    const params = new URLSearchParams({ limit: "80" });

    if (search.trim()) params.set("q", search.trim());

    const response = await fetch(`/api/foods?${params}`);
    const data = (await response.json()) as FoodsResponse & { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar alimentos.");
      return;
    }

    setFoods(data.foods);
    if (data.foods[0] && !data.foods.some((food) => food.id === selectedFoodId)) {
      setSelectedFoodId(data.foods[0].id);
    } else if (data.foods.length === 0) {
      setSelectedFoodId("");
    }
  }

  function addIngredient() {
    if (!selectedFood) {
      setMessage("Selecione um alimento para adicionar.");
      return;
    }

    const quantity = Number.isFinite(foodQuantity) && foodQuantity > 0 ? foodQuantity : 1;
    setIngredients((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        foodId: selectedFood.id,
        foodName: selectedFood.name,
        portion: selectedFood.portion,
        quantity,
        calories: round(toNumber(selectedFood.calories) * quantity),
        protein: round(toNumber(selectedFood.protein) * quantity),
        carbs: round(toNumber(selectedFood.carbs) * quantity),
        fat: round(toNumber(selectedFood.fat) * quantity),
        fiber: round(toNumber(selectedFood.fiber) * quantity),
        position: current.length,
        notes: ""
      }
    ]);
    setMessage(null);
  }

  function removeIngredient(ingredientId: string) {
    setIngredients((current) =>
      current.filter((ingredient) => ingredient.id !== ingredientId).map((ingredient, index) => ({ ...ingredient, position: index }))
    );
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  }

  function startEditing(recipe: Recipe) {
    setEditingRecipe(recipe);
    setIngredients(
      recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        quantity: toNumber(ingredient.quantity),
        calories: toNumber(ingredient.calories),
        protein: toNumber(ingredient.protein),
        carbs: toNumber(ingredient.carbs),
        fat: toNumber(ingredient.fat),
        fiber: toNumber(ingredient.fiber)
      }))
    );
    setStepsText(recipe.steps.join("\n"));
    setSelectedTags(recipe.tags);
    setMessage(null);
  }

  function cancelEditing() {
    setEditingRecipe(null);
    setIngredients([]);
    setStepsText("");
    setSelectedTags([]);
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (ingredients.length === 0) {
      setMessage("Adicione pelo menos um ingrediente.");
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = getRecipePayload(form, ingredients, selectedTags, stepsText);

    setSaving(true);
    setMessage(null);

    const response = await fetch(editingRecipe ? `/api/recipes/${editingRecipe.id}` : "/api/recipes", {
      method: editingRecipe ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel salvar a receita.");
      return;
    }

    formElement.reset();
    cancelEditing();
    setMessage(editingRecipe ? "Receita atualizada com sucesso." : "Receita criada com sucesso.");
    await loadRecipes();
  }

  async function handleDelete(recipe: Recipe) {
    const confirmed = window.confirm(`Excluir a receita "${recipe.name}"?`);

    if (!confirmed) return;

    setDeletingId(recipe.id);
    setMessage(null);

    const response = await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    setDeletingId(null);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel excluir a receita.");
      return;
    }

    if (editingRecipe?.id === recipe.id) cancelEditing();
    setMessage("Receita excluida.");
    await loadRecipes();
  }

  return (
    <section className="workspace-grid">
      <div className="surface recipe-list">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Biblioteca</span>
            <h2>Receitas cadastradas</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo de receitas">
            <span>{recipes.length} receitas</span>
            <span>{recipes.reduce((total, recipe) => total + recipe.ingredients.length, 0)} ingredientes</span>
          </div>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="filters-row recipe-filters">
          <label>
            Buscar
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome da receita" />
          </label>
          <label>
            Categoria
            <select className="inline-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tag
            <select className="inline-select" value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
              <option value="">Todas</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="plan-list">
          {recipes.map((recipe) => {
            const recipeTotals = sumIngredients(recipe.ingredients);
            const servingCalories = recipe.servings ? recipeTotals.calories / recipe.servings : recipeTotals.calories;

            return (
              <article className="plan-card" key={recipe.id}>
                <div>
                  <span className="status-pill ok">{recipe.category || "Geral"}</span>
                  <h3>{recipe.name}</h3>
                  <p>
                    {recipe.prepTimeMin || "?"} min - {recipe.servings} porcao(oes) - {recipe.difficulty || "Sem dificuldade"}
                  </p>
                </div>
                <div className="macro-grid">
                  <span>{Math.round(servingCalories)} kcal/porcao</span>
                  <span>{(recipeTotals.protein / recipe.servings).toFixed(1)}g prot</span>
                  <span>{(recipeTotals.carbs / recipe.servings).toFixed(1)}g carb</span>
                  <span>{(recipeTotals.fat / recipe.servings).toFixed(1)}g gord</span>
                </div>
                <div className="answer-preview">
                  {recipe.ingredients.slice(0, 4).map((ingredient) => (
                    <div key={ingredient.id}>
                      <strong>{ingredient.foodName}</strong>
                      <span>
                        {ingredient.quantity} x {ingredient.portion}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="row-actions">
                  <button className="text-button" type="button" onClick={() => startEditing(recipe)}>
                    Editar
                  </button>
                  <button className="text-button danger" type="button" disabled={deletingId === recipe.id} onClick={() => void handleDelete(recipe)}>
                    {deletingId === recipe.id ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </article>
            );
          })}

          {!loading && recipes.length === 0 ? <p className="empty-card">Nenhuma receita cadastrada.</p> : null}
          {loading ? <p className="empty-card">Carregando receitas...</p> : null}
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">{editing ? "Edicao" : "Nova receita"}</span>
        <h2>{editing ? "Editar receita" : "Cadastrar receita"}</h2>
        <form key={editingRecipe?.id || "new"} className="form compact-form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input name="name" required minLength={2} placeholder="Panqueca de banana" defaultValue={editingRecipe?.name || ""} />
          </label>
          <div className="form-row">
            <label>
              Categoria
              <select name="category" defaultValue={editingRecipe?.category || "Cafe da manha"}>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Dificuldade
              <select name="difficulty" defaultValue={editingRecipe?.difficulty || "Facil"}>
                <option>Facil</option>
                <option>Medio</option>
                <option>Dificil</option>
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Tempo min
              <input name="prepTimeMin" type="number" min="1" defaultValue={editingRecipe?.prepTimeMin || ""} />
            </label>
            <label>
              Porcoes
              <input name="servings" type="number" min="1" defaultValue={editingRecipe?.servings || 1} />
            </label>
          </div>

          <div className="tag-selector">
            {tags.map((tag) => (
              <button key={tag} className={selectedTags.includes(tag) ? "text-button active-tag" : "text-button"} type="button" onClick={() => toggleTag(tag)}>
                {tag}
              </button>
            ))}
          </div>

          <div className="item-builder">
            <label>
              Buscar alimento
              <input value={foodSearch} onChange={(event) => setFoodSearch(event.target.value)} placeholder="Digite banana, aveia..." />
            </label>
            <label>
              Ingrediente
              <select value={selectedFoodId} onChange={(event) => setSelectedFoodId(event.target.value)}>
                {foods.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name} - {food.portion} - {Math.round(toNumber(food.calories))} kcal
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantidade
              <input type="number" min="0.1" step="0.1" value={foodQuantity} onChange={(event) => setFoodQuantity(Number(event.target.value))} />
            </label>
            <button className="button secondary" type="button" onClick={addIngredient}>
              Adicionar ingrediente
            </button>
          </div>

          <div className="selected-items">
            {ingredients.map((ingredient) => (
              <div className="selected-item" key={ingredient.id}>
                <div>
                  <strong>{ingredient.foodName}</strong>
                  <span>
                    {ingredient.quantity} x {ingredient.portion} - {Math.round(ingredient.calories)} kcal
                  </span>
                </div>
                <button className="text-button danger" type="button" onClick={() => removeIngredient(ingredient.id)}>
                  Remover
                </button>
              </div>
            ))}
            {ingredients.length === 0 ? <p>Nenhum ingrediente adicionado.</p> : null}
          </div>

          <div className="macro-grid totals-grid">
            <span>{Math.round(totals.calories)} kcal</span>
            <span>{totals.protein.toFixed(1)}g prot</span>
            <span>{totals.carbs.toFixed(1)}g carb</span>
            <span>{totals.fat.toFixed(1)}g gord</span>
          </div>

          <label>
            Modo de preparo
            <textarea value={stepsText} onChange={(event) => setStepsText(event.target.value)} rows={5} placeholder="Um passo por linha" />
          </label>
          <label>
            Observacoes
            <textarea name="notes" rows={3} defaultValue={editingRecipe?.notes || ""} />
          </label>
          <button className="button" type="submit" disabled={saving}>
            {saving ? "Salvando..." : editing ? "Salvar alteracoes" : "Salvar receita"}
          </button>
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

function getRecipePayload(form: FormData, ingredients: Ingredient[], selectedTags: string[], stepsText: string) {
  const prepTimeMin = String(form.get("prepTimeMin") || "");
  const servings = String(form.get("servings") || "");

  return {
    name: form.get("name"),
    category: form.get("category"),
    prepTimeMin: prepTimeMin || undefined,
    servings: servings || 1,
    difficulty: form.get("difficulty"),
    tags: selectedTags,
    steps: stepsText
      .split("\n")
      .map((step) => step.trim())
      .filter(Boolean),
    notes: form.get("notes"),
    ingredients: ingredients.map(({ id: _id, ...ingredient }, index) => ({
      ...ingredient,
      position: index
    }))
  };
}

function sumIngredients(ingredients: Array<Pick<Ingredient, "calories" | "protein" | "carbs" | "fat" | "fiber">>) {
  return ingredients.reduce(
    (total, ingredient) => ({
      calories: total.calories + toNumber(ingredient.calories),
      protein: total.protein + toNumber(ingredient.protein),
      carbs: total.carbs + toNumber(ingredient.carbs),
      fat: total.fat + toNumber(ingredient.fat),
      fiber: toNumber(total.fiber) + toNumber(ingredient.fiber)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

function toNumber(value: string | number | null | undefined) {
  return Number(value || 0);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
