/* ============================================
   NutriSys - Receitas Inteligentes
   Banco de receitas vinculado ao cardápio
   ============================================ */

const Recipes = {
    currentView: 'list',
    currentRecipeId: null,

    CATEGORIES: [
        'Café da Manhã', 'Almoço', 'Jantar', 'Lanches', 'Sobremesas',
        'Sopas & Cremes', 'Saladas', 'Smoothies & Sucos', 'Fitness'
    ],

    TAGS: [
        'Low Carb', 'Vegetariana', 'Vegana', 'Sem Glúten', 'Sem Lactose',
        'Rica em Proteína', 'Rica em Fibra', 'Anti-inflamatória', 'Rápida (< 20 min)',
        'Econômica', 'Detox', 'Termogênica'
    ],

    render() {
        if (this.currentView === 'detail') return this.renderDetail(this.currentRecipeId);
        return this.renderList();
    },

    renderList() {
        const recipes = DB.getAll(DB.KEYS.RECIPES);
        return `
            <div class="section-header flex justify-between items-center mb-3">
                <div>
                    <h3 style="font-weight:700;font-size:1.15rem">Banco de Receitas</h3>
                    <p class="text-muted text-small">${recipes.length} receita(s) cadastrada(s)</p>
                </div>
                <button class="btn btn-primary" onclick="Recipes.openAddModal()">
                    <span class="material-icons-outlined">add</span> Nova Receita
                </button>
            </div>

            <div class="card mb-2" style="padding:16px">
                <div class="flex gap-2 items-center" style="flex-wrap:wrap">
                    <input type="text" id="recipe-search" placeholder="Buscar receita..." 
                           onkeyup="Recipes.filterList()" class="form-control" style="max-width:280px">
                    <select id="recipe-cat-filter" onchange="Recipes.filterList()" class="form-control" style="max-width:200px">
                        <option value="">Todas Categorias</option>
                        ${this.CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <select id="recipe-tag-filter" onchange="Recipes.filterList()" class="form-control" style="max-width:200px">
                        <option value="">Todas Tags</option>
                        ${this.TAGS.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="recipes-grid" id="recipes-grid">
                ${recipes.length === 0 ? this._emptyState() : recipes.map(r => this._renderCard(r)).join('')}
            </div>
        `;
    },

    _emptyState() {
        return `
            <div class="empty-state" style="grid-column:1/-1;text-align:center;padding:60px 20px">
                <span class="material-icons-outlined" style="font-size:64px;color:var(--text-muted)">menu_book</span>
                <h3 style="margin:16px 0 8px">Nenhuma receita ainda</h3>
                <p class="text-muted">Cadastre receitas para vincular aos cardápios dos pacientes.</p>
                <button class="btn btn-primary mt-2" onclick="Recipes.openAddModal()">
                    <span class="material-icons-outlined">add</span> Criar Primeira Receita
                </button>
                <button class="btn btn-secondary mt-2" onclick="Recipes.seedDefaults()">
                    <span class="material-icons-outlined">auto_awesome</span> Carregar Receitas Exemplo
                </button>
            </div>
        `;
    },

    _renderCard(r) {
        const totalCal = this._calcTotal(r, 'calories');
        const totalP = this._calcTotal(r, 'protein');
        const totalC = this._calcTotal(r, 'carbs');
        const totalF = this._calcTotal(r, 'fat');
        const servings = r.servings || 1;
        const perServing = Math.round(totalCal / servings);
        const tagHtml = (r.tags || []).slice(0, 3).map(t =>
            `<span class="recipe-tag">${App.escapeHtml(t)}</span>`
        ).join('');

        return `
            <div class="recipe-card" onclick="Recipes.viewRecipe('${r.id}')">
                <div class="recipe-card-header" style="background:${this._catColor(r.category)}">
                    <span class="material-icons-outlined">${this._catIcon(r.category)}</span>
                    <span class="recipe-cat-label">${App.escapeHtml(r.category || 'Geral')}</span>
                </div>
                <div class="recipe-card-body">
                    <h4>${App.escapeHtml(r.name)}</h4>
                    <div class="recipe-tags">${tagHtml}</div>
                    <div class="recipe-macros">
                        <span title="Calorias por porção"><strong>${perServing}</strong> kcal</span>
                        <span title="Proteína">P: ${(totalP/servings).toFixed(1)}g</span>
                        <span title="Carboidrato">C: ${(totalC/servings).toFixed(1)}g</span>
                        <span title="Gordura">G: ${(totalF/servings).toFixed(1)}g</span>
                    </div>
                    <div class="recipe-meta">
                        <span><span class="material-icons-outlined" style="font-size:16px">schedule</span> ${r.prepTime || '?'} min</span>
                        <span><span class="material-icons-outlined" style="font-size:16px">group</span> ${servings} porç${servings > 1 ? 'ões' : 'ão'}</span>
                        <span><span class="material-icons-outlined" style="font-size:16px">restaurant</span> ${(r.ingredients || []).length} itens</span>
                    </div>
                </div>
            </div>
        `;
    },

    filterList() {
        const search = (document.getElementById('recipe-search')?.value || '').toLowerCase();
        const cat = document.getElementById('recipe-cat-filter')?.value || '';
        const tag = document.getElementById('recipe-tag-filter')?.value || '';
        let recipes = DB.getAll(DB.KEYS.RECIPES);

        if (search) recipes = recipes.filter(r => r.name.toLowerCase().includes(search));
        if (cat) recipes = recipes.filter(r => r.category === cat);
        if (tag) recipes = recipes.filter(r => (r.tags || []).includes(tag));

        const grid = document.getElementById('recipes-grid');
        if (grid) {
            grid.innerHTML = recipes.length === 0
                ? '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-light)">Nenhuma receita encontrada</div>'
                : recipes.map(r => this._renderCard(r)).join('');
        }
    },

    viewRecipe(id) {
        this.currentView = 'detail';
        this.currentRecipeId = id;
        App.renderPage('recipes');
    },

    backToList() {
        this.currentView = 'list';
        this.currentRecipeId = null;
        App.renderPage('recipes');
    },

    renderDetail(id) {
        const r = DB.getById(DB.KEYS.RECIPES, id);
        if (!r) return '<p>Receita não encontrada.</p>';

        const totalCal = this._calcTotal(r, 'calories');
        const totalP = this._calcTotal(r, 'protein');
        const totalC = this._calcTotal(r, 'carbs');
        const totalF = this._calcTotal(r, 'fat');
        const totalFi = this._calcTotal(r, 'fiber');
        const servings = r.servings || 1;

        return `
            <div class="flex justify-between items-center mb-3">
                <button class="btn btn-outline" onclick="Recipes.backToList()">
                    <span class="material-icons-outlined">arrow_back</span> Voltar
                </button>
                <div class="flex gap-1">
                    <button class="btn btn-primary" onclick="Recipes.openEditModal('${r.id}')">
                        <span class="material-icons-outlined">edit</span> Editar
                    </button>
                    <button class="btn btn-danger" onclick="Recipes.confirmDelete('${r.id}')">
                        <span class="material-icons-outlined">delete</span>
                    </button>
                </div>
            </div>

            <div class="card mb-2" style="padding:28px">
                <div class="flex justify-between items-center" style="flex-wrap:wrap;gap:12px">
                    <div>
                        <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:4px">${App.escapeHtml(r.name)}</h2>
                        <span class="recipe-tag" style="background:${this._catColor(r.category)};color:#fff">${App.escapeHtml(r.category)}</span>
                        ${(r.tags || []).map(t => `<span class="recipe-tag">${App.escapeHtml(t)}</span>`).join('')}
                    </div>
                    <div class="flex gap-2" style="font-size:0.85rem;color:var(--text-light)">
                        <span>⏱ ${r.prepTime || '?'} min</span>
                        <span>🍽 ${servings} porções</span>
                        <span>🔥 ${r.difficulty || 'Fácil'}</span>
                    </div>
                </div>
            </div>

            <div class="recipe-detail-grid">
                <div class="card" style="padding:24px">
                    <h3 style="font-weight:700;margin-bottom:16px">
                        <span class="material-icons-outlined" style="vertical-align:middle">shopping_basket</span> Ingredientes
                    </h3>
                    <table class="table">
                        <thead><tr><th>Alimento</th><th>Porção</th><th>Qty</th><th>Kcal</th><th>P</th><th>C</th><th>G</th></tr></thead>
                        <tbody>
                            ${(r.ingredients || []).map(ing => `
                                <tr>
                                    <td>${App.escapeHtml(ing.name)}</td>
                                    <td>${App.escapeHtml(ing.portion || '')}</td>
                                    <td>${ing.qty || 1}</td>
                                    <td>${Math.round((ing.calories || 0) * (ing.qty || 1))}</td>
                                    <td>${((ing.protein || 0) * (ing.qty || 1)).toFixed(1)}</td>
                                    <td>${((ing.carbs || 0) * (ing.qty || 1)).toFixed(1)}</td>
                                    <td>${((ing.fat || 0) * (ing.qty || 1)).toFixed(1)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="font-weight:700">
                                <td colspan="3">Total da Receita</td>
                                <td>${Math.round(totalCal)}</td>
                                <td>${totalP.toFixed(1)}</td>
                                <td>${totalC.toFixed(1)}</td>
                                <td>${totalF.toFixed(1)}</td>
                            </tr>
                            <tr style="color:var(--primary);font-weight:600">
                                <td colspan="3">Por Porção (÷${servings})</td>
                                <td>${Math.round(totalCal/servings)}</td>
                                <td>${(totalP/servings).toFixed(1)}</td>
                                <td>${(totalC/servings).toFixed(1)}</td>
                                <td>${(totalF/servings).toFixed(1)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div>
                    <div class="card mb-2" style="padding:24px">
                        <h3 style="font-weight:700;margin-bottom:16px">
                            <span class="material-icons-outlined" style="vertical-align:middle">pie_chart</span> Macros por Porção
                        </h3>
                        <div class="recipe-macro-bars">
                            ${this._macroBar('Proteína', totalP/servings, '#057b64')}
                            ${this._macroBar('Carboidrato', totalC/servings, '#f39c12')}
                            ${this._macroBar('Gordura', totalF/servings, '#e74c3c')}
                            ${this._macroBar('Fibra', totalFi/servings, '#6c5ce7')}
                        </div>
                    </div>

                    <div class="card" style="padding:24px">
                        <h3 style="font-weight:700;margin-bottom:16px">
                            <span class="material-icons-outlined" style="vertical-align:middle">receipt_long</span> Modo de Preparo
                        </h3>
                        <div class="recipe-steps">
                            ${(r.steps || []).map((s, i) => `
                                <div class="recipe-step">
                                    <span class="recipe-step-num">${i + 1}</span>
                                    <p>${App.escapeHtml(s)}</p>
                                </div>
                            `).join('') || '<p class="text-muted">Nenhum passo cadastrado.</p>'}
                        </div>
                        ${r.notes ? `<div class="mt-2" style="padding:12px;background:var(--bg);border-radius:8px;font-size:0.85rem"><strong>Observações:</strong> ${App.escapeHtml(r.notes)}</div>` : ''}
                    </div>
                </div>
            </div>

            <div class="card mt-2" style="padding:20px;text-align:center">
                <h4 style="margin-bottom:12px">Vincular ao Cardápio</h4>
                <p class="text-muted text-small mb-2">Adicione esta receita como item de um cardápio existente</p>
                <button class="btn btn-primary" onclick="Recipes.addToMealPlan('${r.id}')">
                    <span class="material-icons-outlined">playlist_add</span> Adicionar a Cardápio
                </button>
            </div>
        `;
    },

    _macroBar(label, value, color) {
        const max = 100;
        const pct = Math.min((value / max) * 100, 100);
        return `
            <div class="recipe-macro-row">
                <span class="recipe-macro-label">${label}</span>
                <div class="recipe-macro-track">
                    <div class="recipe-macro-fill" style="width:${pct}%;background:${color}"></div>
                </div>
                <span class="recipe-macro-val">${value.toFixed(1)}g</span>
            </div>
        `;
    },

    // ───── CRUD ─────
    openAddModal() {
        this._editingId = null;
        this._tempIngredients = [];
        this._tempSteps = [''];
        App.openModal('Nova Receita', this._renderForm(), 'modal-xl');
    },

    openEditModal(id) {
        const r = DB.getById(DB.KEYS.RECIPES, id);
        if (!r) return;
        this._editingId = id;
        this._tempIngredients = JSON.parse(JSON.stringify(r.ingredients || []));
        this._tempSteps = r.steps && r.steps.length ? [...r.steps] : [''];
        App.openModal('Editar Receita', this._renderForm(r), 'modal-xl');
    },

    _renderForm(r) {
        r = r || {};
        return `
            <form onsubmit="Recipes.handleSave(event)" id="recipe-form">
                <div class="form-row">
                    <div class="form-group" style="flex:2">
                        <label>Nome da Receita *</label>
                        <input type="text" name="name" value="${App.escapeHtml(r.name || '')}" required class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Categoria</label>
                        <select name="category" class="form-control">
                            ${this.CATEGORIES.map(c => `<option value="${c}" ${r.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Tempo de Preparo (min)</label>
                        <input type="number" name="prepTime" value="${r.prepTime || ''}" min="1" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Porções</label>
                        <input type="number" name="servings" value="${r.servings || 1}" min="1" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Dificuldade</label>
                        <select name="difficulty" class="form-control">
                            <option value="Fácil" ${r.difficulty === 'Fácil' ? 'selected' : ''}>Fácil</option>
                            <option value="Médio" ${r.difficulty === 'Médio' ? 'selected' : ''}>Médio</option>
                            <option value="Difícil" ${r.difficulty === 'Difícil' ? 'selected' : ''}>Difícil</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Tags</label>
                    <div class="recipe-tags-selector">
                        ${this.TAGS.map(t => `
                            <label class="recipe-tag-check">
                                <input type="checkbox" name="tags" value="${t}" ${(r.tags || []).includes(t) ? 'checked' : ''}>
                                <span>${t}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <h4 style="margin:20px 0 12px;font-weight:700">
                    <span class="material-icons-outlined" style="vertical-align:middle">shopping_basket</span> Ingredientes
                </h4>
                <div id="recipe-ingredients-list">
                    ${this._renderIngredientsList()}
                </div>
                <button type="button" class="btn btn-outline mt-1" onclick="Recipes.openAddIngredientModal()">
                    <span class="material-icons-outlined">add</span> Adicionar Ingrediente
                </button>

                <h4 style="margin:20px 0 12px;font-weight:700">
                    <span class="material-icons-outlined" style="vertical-align:middle">receipt_long</span> Modo de Preparo
                </h4>
                <div id="recipe-steps-list">
                    ${this._renderStepsList()}
                </div>
                <button type="button" class="btn btn-outline mt-1" onclick="Recipes.addStep()">
                    <span class="material-icons-outlined">add</span> Adicionar Passo
                </button>

                <div class="form-group mt-2">
                    <label>Observações</label>
                    <textarea name="notes" rows="2" class="form-control">${App.escapeHtml(r.notes || '')}</textarea>
                </div>

                <div class="flex justify-between mt-3">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">
                        <span class="material-icons-outlined">save</span> Salvar Receita
                    </button>
                </div>
            </form>
        `;
    },

    _renderIngredientsList() {
        if (!this._tempIngredients.length) return '<p class="text-muted text-small">Nenhum ingrediente adicionado.</p>';
        return `<table class="table"><thead><tr><th>Alimento</th><th>Porção</th><th>Qty</th><th>Kcal</th><th></th></tr></thead><tbody>
            ${this._tempIngredients.map((ing, i) => `
                <tr>
                    <td>${App.escapeHtml(ing.name)}</td>
                    <td>${App.escapeHtml(ing.portion || '')}</td>
                    <td><input type="number" value="${ing.qty || 1}" min="0.25" step="0.25" style="width:60px" class="form-control"
                        onchange="Recipes.updateIngQty(${i}, this.value)"></td>
                    <td>${Math.round((ing.calories || 0) * (ing.qty || 1))}</td>
                    <td><button type="button" class="btn btn-sm btn-danger" onclick="Recipes.removeIngredient(${i})">
                        <span class="material-icons-outlined" style="font-size:16px">close</span></button></td>
                </tr>
            `).join('')}
        </tbody></table>`;
    },

    _renderStepsList() {
        return this._tempSteps.map((s, i) => `
            <div class="flex gap-1 items-center mb-1">
                <span style="font-weight:700;color:var(--primary);min-width:28px">${i + 1}.</span>
                <input type="text" value="${App.escapeHtml(s)}" class="form-control" placeholder="Descreva o passo..."
                    onchange="Recipes._tempSteps[${i}]=this.value">
                <button type="button" class="btn btn-sm btn-danger" onclick="Recipes.removeStep(${i})">
                    <span class="material-icons-outlined" style="font-size:16px">close</span>
                </button>
            </div>
        `).join('');
    },

    openAddIngredientModal() {
        const foods = DB.getFoods();
        const html = `
            <input type="text" id="recipe-food-search" placeholder="Buscar alimento..." class="form-control mb-2"
                onkeyup="Recipes._filterFoodList()">
            <div id="recipe-food-results" style="max-height:400px;overflow-y:auto">
                ${foods.map(f => `
                    <div class="recipe-food-item" onclick="Recipes.pickIngredient('${f.id}')">
                        <strong>${App.escapeHtml(f.name)}</strong>
                        <span class="text-muted text-small">${App.escapeHtml(f.portion)} · ${f.calories} kcal · P:${f.protein}g C:${f.carbs}g G:${f.fat}g</span>
                    </div>
                `).join('')}
            </div>
        `;
        // Use a secondary overlay approach
        const overlay = document.createElement('div');
        overlay.id = 'recipe-food-overlay';
        overlay.className = 'recipe-food-overlay';
        overlay.innerHTML = `<div class="recipe-food-modal">
            <div class="flex justify-between items-center mb-2">
                <h3 style="font-weight:700">Selecionar Alimento</h3>
                <button class="btn btn-sm btn-outline" onclick="document.getElementById('recipe-food-overlay').remove()">
                    <span class="material-icons-outlined">close</span></button>
            </div>
            ${html}
        </div>`;
        document.body.appendChild(overlay);
    },

    _filterFoodList() {
        const q = (document.getElementById('recipe-food-search')?.value || '').toLowerCase();
        const container = document.getElementById('recipe-food-results');
        if (!container) return;
        const foods = DB.getFoods().filter(f => f.name.toLowerCase().includes(q));
        container.innerHTML = foods.map(f => `
            <div class="recipe-food-item" onclick="Recipes.pickIngredient('${f.id}')">
                <strong>${App.escapeHtml(f.name)}</strong>
                <span class="text-muted text-small">${App.escapeHtml(f.portion)} · ${f.calories} kcal · P:${f.protein}g C:${f.carbs}g G:${f.fat}g</span>
            </div>
        `).join('');
    },

    pickIngredient(foodId) {
        const f = DB.getFoods().find(x => x.id === foodId);
        if (!f) return;
        this._tempIngredients.push({
            foodId: f.id, name: f.name, portion: f.portion, householdMeasure: f.householdMeasure,
            calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat, fiber: f.fiber,
            category: f.category, qty: 1
        });
        const overlay = document.getElementById('recipe-food-overlay');
        if (overlay) overlay.remove();
        const list = document.getElementById('recipe-ingredients-list');
        if (list) list.innerHTML = this._renderIngredientsList();
    },

    updateIngQty(idx, val) {
        this._tempIngredients[idx].qty = parseFloat(val) || 1;
        const list = document.getElementById('recipe-ingredients-list');
        if (list) list.innerHTML = this._renderIngredientsList();
    },

    removeIngredient(idx) {
        this._tempIngredients.splice(idx, 1);
        const list = document.getElementById('recipe-ingredients-list');
        if (list) list.innerHTML = this._renderIngredientsList();
    },

    addStep() {
        this._tempSteps.push('');
        const list = document.getElementById('recipe-steps-list');
        if (list) list.innerHTML = this._renderStepsList();
    },

    removeStep(idx) {
        this._tempSteps.splice(idx, 1);
        const list = document.getElementById('recipe-steps-list');
        if (list) list.innerHTML = this._renderStepsList();
    },

    handleSave(e) {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        const tags = Array.from(form.querySelectorAll('input[name="tags"]:checked')).map(c => c.value);
        // Sync steps from inputs
        const stepInputs = document.querySelectorAll('#recipe-steps-list input[type="text"]');
        const steps = Array.from(stepInputs).map(inp => inp.value.trim()).filter(Boolean);

        const data = {
            name: fd.get('name').trim(),
            category: fd.get('category'),
            prepTime: parseInt(fd.get('prepTime')) || 0,
            servings: parseInt(fd.get('servings')) || 1,
            difficulty: fd.get('difficulty'),
            tags: tags,
            ingredients: this._tempIngredients,
            steps: steps,
            notes: fd.get('notes').trim()
        };

        if (!data.name) return App.showToast('Informe o nome da receita', 'error');

        if (this._editingId) {
            DB.update(DB.KEYS.RECIPES, this._editingId, data);
            App.showToast('Receita atualizada!', 'success');
        } else {
            DB.add(DB.KEYS.RECIPES, data);
            App.showToast('Receita criada!', 'success');
        }
        App.closeModal();
        App.renderPage('recipes');
    },

    confirmDelete(id) {
        if (confirm('Excluir esta receita?')) {
            DB.remove(DB.KEYS.RECIPES, id);
            App.showToast('Receita excluída', 'info');
            this.backToList();
        }
    },

    // ───── VINCULAR AO CARDÁPIO ─────
    addToMealPlan(recipeId) {
        const r = DB.getById(DB.KEYS.RECIPES, recipeId);
        if (!r) return;
        const plans = DB.getMealPlans();
        if (!plans.length) return App.showToast('Crie um cardápio primeiro', 'error');

        const mealTypes = ['cafe_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia'];
        const mealLabels = { cafe_manha: 'Café da Manhã', lanche_manha: 'Lanche da Manhã', almoco: 'Almoço', lanche_tarde: 'Lanche da Tarde', jantar: 'Jantar', ceia: 'Ceia' };

        const html = `
            <form onsubmit="Recipes.doAddToMealPlan(event, '${recipeId}')">
                <div class="form-group">
                    <label>Selecione o Cardápio</label>
                    <select name="planId" class="form-control" required>
                        ${plans.map(p => {
                            const pat = DB.getPatient(p.patientId);
                            return `<option value="${p.id}">${App.escapeHtml(p.name)} ${pat ? '(' + App.escapeHtml(pat.name) + ')' : ''}</option>`;
                        }).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Adicionar na Refeição</label>
                    <select name="mealType" class="form-control" required>
                        ${mealTypes.map(t => `<option value="${t}">${mealLabels[t]}</option>`).join('')}
                    </select>
                </div>
                <div class="flex justify-between mt-3">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">
                        <span class="material-icons-outlined">playlist_add</span> Adicionar
                    </button>
                </div>
            </form>
        `;
        App.openModal('Vincular ao Cardápio', html);
    },

    doAddToMealPlan(e, recipeId) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const planId = fd.get('planId');
        const mealType = fd.get('mealType');
        const recipe = DB.getById(DB.KEYS.RECIPES, recipeId);
        const plan = DB.getMealPlan(planId);
        if (!recipe || !plan) return;

        let meal = plan.meals.find(m => m.type === mealType);
        if (!meal) {
            meal = { type: mealType, time: '', foods: [] };
            plan.meals.push(meal);
        }

        const servings = recipe.servings || 1;
        (recipe.ingredients || []).forEach(ing => {
            meal.foods.push({
                foodId: ing.foodId, name: ing.name + ' (' + recipe.name + ')',
                portion: ing.portion, householdMeasure: ing.householdMeasure,
                calories: Math.round(ing.calories / servings * 10) / 10,
                protein: Math.round(ing.protein / servings * 100) / 100,
                carbs: Math.round(ing.carbs / servings * 100) / 100,
                fat: Math.round(ing.fat / servings * 100) / 100,
                fiber: Math.round((ing.fiber || 0) / servings * 100) / 100,
                category: ing.category, qty: ing.qty || 1
            });
        });

        DB.updateMealPlan(planId, { meals: plan.meals });
        App.closeModal();
        App.showToast(`Receita "${recipe.name}" adicionada ao cardápio!`, 'success');
    },

    // ───── RECEITAS EXEMPLO ─────
    seedDefaults() {
        const foods = DB.getFoods();
        const find = (name) => foods.find(f => f.name.toLowerCase().includes(name.toLowerCase()));

        const defaults = [
            {
                name: 'Bowl de Açaí Proteico',
                category: 'Café da Manhã',
                prepTime: 10, servings: 1, difficulty: 'Fácil',
                tags: ['Rica em Proteína', 'Fitness', 'Rápida (< 20 min)'],
                ingredients: [
                    find('banana') || { name: 'Banana', portion: '100g', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, qty: 1 },
                    find('aveia') || { name: 'Aveia em flocos', portion: '30g', calories: 117, protein: 4.4, carbs: 20, fat: 2.4, fiber: 2.8, qty: 1 },
                    find('mel') || { name: 'Mel', portion: '15g', calories: 46, protein: 0, carbs: 12.4, fat: 0, fiber: 0, qty: 1 },
                ].map(f => ({ ...f, foodId: f.id || '', qty: f.qty || 1 })),
                steps: ['Bata a banana congelada no liquidificador com um pouco de água.', 'Coloque em um bowl e adicione a aveia por cima.', 'Finalize com mel e frutas a gosto.'],
                notes: 'Pode adicionar whey protein para aumentar a proteína.'
            },
            {
                name: 'Frango Grelhado com Legumes',
                category: 'Almoço',
                prepTime: 30, servings: 2, difficulty: 'Fácil',
                tags: ['Rica em Proteína', 'Low Carb', 'Fitness'],
                ingredients: [
                    find('frango') || { name: 'Peito de frango grelhado', portion: '150g', calories: 239, protein: 32, carbs: 0, fat: 11, fiber: 0, qty: 2 },
                    find('brócoli') || find('brocol') || { name: 'Brócolis cozido', portion: '100g', calories: 25, protein: 2.1, carbs: 4, fat: 0.2, fiber: 2.9, qty: 1 },
                    find('cenoura') || { name: 'Cenoura cozida', portion: '100g', calories: 30, protein: 0.8, carbs: 6.7, fat: 0.2, fiber: 2.6, qty: 1 },
                ].map(f => ({ ...f, foodId: f.id || '', qty: f.qty || 1 })),
                steps: ['Tempere o frango com sal, pimenta e ervas.', 'Grelhe em fogo médio por 6 min de cada lado.', 'Cozinhe os legumes no vapor por 8 minutos.', 'Sirva o frango fatiado sobre os legumes.'],
                notes: 'Perfeito para meal prep semanal.'
            },
            {
                name: 'Sopa de Abóbora com Gengibre',
                category: 'Sopas & Cremes',
                prepTime: 35, servings: 4, difficulty: 'Fácil',
                tags: ['Anti-inflamatória', 'Sem Glúten', 'Vegana', 'Econômica'],
                ingredients: [
                    find('abóbora') || { name: 'Abóbora cozida', portion: '200g', calories: 40, protein: 1.4, carbs: 9, fat: 0.2, fiber: 2.5, qty: 3 },
                    find('cebola') || { name: 'Cebola', portion: '50g', calories: 20, protein: 0.6, carbs: 4.7, fat: 0, fiber: 0.7, qty: 1 },
                ].map(f => ({ ...f, foodId: f.id || '', qty: f.qty || 1 })),
                steps: ['Refogue a cebola com um fio de azeite.', 'Adicione a abóbora em cubos e cubra com água.', 'Cozinhe por 20 min. Adicione gengibre ralado.', 'Bata no liquidificador até ficar cremosa.'],
                notes: 'Adicione uma pitada de noz-moscada para realçar o sabor.'
            }
        ];

        defaults.forEach(r => DB.add(DB.KEYS.RECIPES, r));
        App.showToast('3 receitas exemplo adicionadas!', 'success');
        App.renderPage('recipes');
    },

    // ───── UTILITÁRIOS ─────
    _calcTotal(recipe, prop) {
        return (recipe.ingredients || []).reduce((sum, ing) => sum + ((ing[prop] || 0) * (ing.qty || 1)), 0);
    },

    _catColor(cat) {
        const map = {
            'Café da Manhã': '#f39c12', 'Almoço': '#057b64', 'Jantar': '#6c5ce7',
            'Lanches': '#fd79a8', 'Sobremesas': '#e74c3c', 'Sopas & Cremes': '#3498db',
            'Saladas': '#07bd53', 'Smoothies & Sucos': '#00b894', 'Fitness': '#e84393'
        };
        return map[cat] || '#636e72';
    },

    _catIcon(cat) {
        const map = {
            'Café da Manhã': 'free_breakfast', 'Almoço': 'lunch_dining', 'Jantar': 'dinner_dining',
            'Lanches': 'bakery_dining', 'Sobremesas': 'cake', 'Sopas & Cremes': 'soup_kitchen',
            'Saladas': 'eco', 'Smoothies & Sucos': 'local_cafe', 'Fitness': 'fitness_center'
        };
        return map[cat] || 'restaurant';
    }
};
