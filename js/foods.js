/* ============================================
   NutreClin - Módulo de Alimentos
   ============================================ */

const Foods = {
    render() {
        const foods = DB.getFoods();
        const categories = [...new Set(foods.map(f => f.category))].sort();

        return `
            <div class="search-bar">
                <div class="search-input">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" id="search-foods" placeholder="Buscar alimento..." oninput="Foods.filterList()">
                </div>
                <select id="filter-food-category" class="btn btn-outline" style="min-width:160px" onchange="Foods.filterList()">
                    <option value="">Todas categorias</option>
                    ${categories.map(c => `<option value="${App.escapeHtml(c)}">${App.escapeHtml(c)}</option>`).join('')}
                </select>
                <button class="btn btn-primary" onclick="Foods.openAddModal()">
                    <span class="material-icons-outlined">add</span> Novo Alimento
                </button>
            </div>
            <div class="card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Alimento</th>
                                <th>Porção</th>
                                <th>Medida Caseira</th>
                                <th>Calorias</th>
                                <th>Proteínas</th>
                                <th>Carboidratos</th>
                                <th>Gorduras</th>
                                <th>Fibras</th>
                                <th>Categoria</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="foods-table-body">
                            ${foods.map(f => this._renderRow(f)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    _renderRow(f) {
        return `
            <tr data-food-row data-name="${App.escapeHtml(f.name.toLowerCase())}" data-category="${App.escapeHtml(f.category || '')}">
                <td><strong>${App.escapeHtml(f.name)}</strong> ${f.source ? `<span class="badge badge-info" style="font-size:0.65rem;padding:1px 5px">${App.escapeHtml(f.source)}</span>` : ''}</td>
                <td>${App.escapeHtml(f.portion)}</td>
                <td class="text-muted text-small">${App.escapeHtml(f.householdMeasure || '-')}</td>
                <td>${f.calories} kcal</td>
                <td>${f.protein}g</td>
                <td>${f.carbs}g</td>
                <td>${f.fat}g</td>
                <td>${f.fiber}g</td>
                <td><span class="badge badge-purple">${App.escapeHtml(f.category || '-')}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn-icon" title="Editar" onclick="Foods.openEditModal('${f.id}')">
                            <span class="material-icons-outlined">edit</span>
                        </button>
                        <button class="btn-icon" title="Excluir" onclick="Foods.confirmDelete('${f.id}')">
                            <span class="material-icons-outlined">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    filterList() {
        const query = document.getElementById('search-foods').value.toLowerCase();
        const category = document.getElementById('filter-food-category').value;
        document.querySelectorAll('[data-food-row]').forEach(row => {
            const name = row.getAttribute('data-name');
            const cat = row.getAttribute('data-category');
            const matchName = name.includes(query);
            const matchCat = !category || cat === category;
            row.style.display = (matchName && matchCat) ? '' : 'none';
        });
    },

    openAddModal() {
        App.openModal('Novo Alimento', this._renderForm());
    },

    openEditModal(id) {
        const f = DB.getById(DB.KEYS.FOODS, id);
        if (!f) return;
        App.openModal('Editar Alimento', this._renderForm(f));
    },

    _renderForm(f = {}) {
        return `
            <form id="food-form" onsubmit="Foods.handleSave(event, '${f.id || ''}')">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome do alimento *</label>
                        <input type="text" name="name" required maxlength="100" value="${App.escapeHtml(f.name || '')}">
                    </div>
                    <div class="form-group">
                        <label>Porção *</label>
                        <input type="text" name="portion" required maxlength="50" placeholder="Ex: 100g, 1 unidade" value="${App.escapeHtml(f.portion || '')}">
                    </div>
                </div>
                <div class="form-row-3">
                    <div class="form-group">
                        <label>Calorias (kcal) *</label>
                        <input type="number" name="calories" required min="0" step="0.1" value="${f.calories || ''}">
                    </div>
                    <div class="form-group">
                        <label>Proteínas (g)</label>
                        <input type="number" name="protein" min="0" step="0.1" value="${f.protein || 0}">
                    </div>
                    <div class="form-group">
                        <label>Carboidratos (g)</label>
                        <input type="number" name="carbs" min="0" step="0.1" value="${f.carbs || 0}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Medida Caseira</label>
                        <input type="text" name="householdMeasure" maxlength="60" placeholder="Ex: 4 colheres de sopa" value="${App.escapeHtml(f.householdMeasure || '')}">
                    </div>
                    <div class="form-group">
                        <label>Fonte</label>
                        <select name="source">
                            <option value="">Nenhuma</option>
                            <option value="TACO" ${f.source === 'TACO' ? 'selected' : ''}>TACO</option>
                            <option value="IBGE" ${f.source === 'IBGE' ? 'selected' : ''}>IBGE</option>
                            <option value="Manual" ${f.source === 'Manual' ? 'selected' : ''}>Manual</option>
                        </select>
                    </div>
                </div>
                <div class="form-row-3">
                    <div class="form-group">
                        <label>Gorduras (g)</label>
                        <input type="number" name="fat" min="0" step="0.1" value="${f.fat || 0}">
                    </div>
                    <div class="form-group">
                        <label>Fibras (g)</label>
                        <input type="number" name="fiber" min="0" step="0.1" value="${f.fiber || 0}">
                    </div>
                    <div class="form-group">
                        <label>Categoria</label>
                        <select name="category">
                            <option value="">Selecione</option>
                            ${['Cereais','Leguminosas','Carnes','Peixes','Ovos','Frutas','Verduras','Tubérculos','Laticínios','Oleaginosas','Óleos','Suplementos','Outros'].map(
                                c => `<option value="${c}" ${f.category === c ? 'selected' : ''}>${c}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:8px">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${f.id ? 'Salvar' : 'Cadastrar'}</button>
                </div>
            </form>
        `;
    },

    handleSave(e, id) {
        e.preventDefault();
        const form = document.getElementById('food-form');
        const data = {
            name: form.name.value.trim(),
            portion: form.portion.value.trim(),
            householdMeasure: form.householdMeasure.value.trim(),
            source: form.source.value,
            calories: parseFloat(form.calories.value) || 0,
            protein: parseFloat(form.protein.value) || 0,
            carbs: parseFloat(form.carbs.value) || 0,
            fat: parseFloat(form.fat.value) || 0,
            fiber: parseFloat(form.fiber.value) || 0,
            category: form.category.value,
        };

        if (id) {
            DB.updateFood(id, data);
            App.showToast('Alimento atualizado!', 'success');
        } else {
            DB.addFood(data);
            App.showToast('Alimento cadastrado!', 'success');
        }

        App.closeModal();
        App.renderPage('foods');
    },

    confirmDelete(id) {
        const f = DB.getById(DB.KEYS.FOODS, id);
        if (!f) return;
        App.openModal('Confirmar Exclusão', `
            <p>Excluir o alimento <strong>${App.escapeHtml(f.name)}</strong>?</p>
            <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
                <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-danger" onclick="Foods.doDelete('${id}')">Excluir</button>
            </div>
        `);
    },

    doDelete(id) {
        DB.removeFood(id);
        App.closeModal();
        App.renderPage('foods');
        App.showToast('Alimento excluído', 'info');
    }
};
