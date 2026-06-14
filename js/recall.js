/* ============================================
   NutreClin - Recordatório 24h (Recall)
   Formulário padronizado de recordatório alimentar
   ============================================ */

const Recall = {
    currentView: 'list',
    currentRecallId: null,

    MEAL_SLOTS: [
        { key: 'despertar', label: 'Ao Despertar', icon: 'wb_twilight', time: '06:00' },
        { key: 'cafe_manha', label: 'Café da Manhã', icon: 'free_breakfast', time: '07:30' },
        { key: 'lanche_manha', label: 'Lanche da Manhã', icon: 'bakery_dining', time: '10:00' },
        { key: 'almoco', label: 'Almoço', icon: 'lunch_dining', time: '12:30' },
        { key: 'lanche_tarde', label: 'Lanche da Tarde', icon: 'coffee', time: '15:30' },
        { key: 'jantar', label: 'Jantar', icon: 'dinner_dining', time: '19:00' },
        { key: 'ceia', label: 'Ceia', icon: 'nightlight', time: '21:00' },
        { key: 'extra', label: 'Outros / Beliscos', icon: 'more_horiz', time: '' }
    ],

    render() {
        if (this.currentView === 'detail') return this.renderDetail(this.currentRecallId);
        return this.renderList();
    },

    renderList() {
        const recalls = DB.getAll(DB.KEYS.RECALL);
        const patients = DB.getPatients();

        return `
            <div class="section-header flex justify-between items-center mb-3">
                <div>
                    <h3 style="font-weight:700;font-size:1.15rem">Recordatório Alimentar 24h</h3>
                    <p class="text-muted text-small">${recalls.length} recordatório(s)</p>
                </div>
                <button class="btn btn-primary" onclick="Recall.openCreate()">
                    <span class="material-icons-outlined">add</span> Novo Recordatório
                </button>
            </div>

            <div class="card mb-2" style="padding:16px">
                <div class="flex gap-2 items-center" style="flex-wrap:wrap">
                    <input type="text" id="recall-search" placeholder="Buscar por paciente..." 
                           onkeyup="Recall.filterList()" class="form-control" style="max-width:280px">
                </div>
            </div>

            <div class="table-container">
                <table class="table" id="recall-table">
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Data Referente</th>
                            <th>Kcal Total</th>
                            <th>Refeições</th>
                            <th>Criado em</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recalls.length === 0
                            ? '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-light)">Nenhum recordatório registrado</td></tr>'
                            : recalls.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(r => {
                                const pat = patients.find(p => p.id === r.patientId);
                                const totalCal = this._calcTotalCal(r);
                                const mealCount = Object.keys(r.meals || {}).filter(k => (r.meals[k].items || []).length > 0).length;
                                return `<tr>
                                    <td><strong>${App.escapeHtml(pat ? pat.name : '—')}</strong></td>
                                    <td>${r.referenceDate ? new Date(r.referenceDate + 'T12:00').toLocaleDateString('pt-BR') : '—'}</td>
                                    <td><strong>${Math.round(totalCal)} kcal</strong></td>
                                    <td>${mealCount}/${this.MEAL_SLOTS.length}</td>
                                    <td>${new Date(r.createdAt).toLocaleDateString('pt-BR')}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline" onclick="Recall.viewRecall('${r.id}')" title="Ver">
                                            <span class="material-icons-outlined" style="font-size:16px">visibility</span>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="Recall.confirmDelete('${r.id}')" title="Excluir">
                                            <span class="material-icons-outlined" style="font-size:16px">delete</span>
                                        </button>
                                    </td>
                                </tr>`;
                            }).join('')
                        }
                    </tbody>
                </table>
            </div>
        `;
    },

    filterList() {
        const q = (document.getElementById('recall-search')?.value || '').toLowerCase();
        const patients = DB.getPatients();
        const rows = document.querySelectorAll('#recall-table tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(q) ? '' : 'none';
        });
    },

    viewRecall(id) {
        this.currentView = 'detail';
        this.currentRecallId = id;
        App.renderPage('recall');
    },

    backToList() {
        this.currentView = 'list';
        this.currentRecallId = null;
        App.renderPage('recall');
    },

    renderDetail(id) {
        const recall = DB.getById(DB.KEYS.RECALL, id);
        if (!recall) return '<p>Recordatório não encontrado.</p>';

        const patient = DB.getPatient(recall.patientId);
        const totalCal = this._calcTotalCal(recall);
        const totalP = this._calcTotalMacro(recall, 'protein');
        const totalC = this._calcTotalMacro(recall, 'carbs');
        const totalF = this._calcTotalMacro(recall, 'fat');

        return `
            <div class="flex justify-between items-center mb-3">
                <button class="btn btn-outline" onclick="Recall.backToList()">
                    <span class="material-icons-outlined">arrow_back</span> Voltar
                </button>
                <div class="flex gap-1">
                    <button class="btn btn-outline" onclick="Recall.printRecall('${id}')">
                        <span class="material-icons-outlined">print</span> Imprimir
                    </button>
                    <button class="btn btn-danger" onclick="Recall.confirmDelete('${id}')">
                        <span class="material-icons-outlined">delete</span>
                    </button>
                </div>
            </div>

            <div class="card mb-2" style="padding:24px">
                <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px">Recordatório 24h</h2>
                <p class="text-muted">Paciente: <strong>${App.escapeHtml(patient ? patient.name : '—')}</strong>
                    · Data referente: <strong>${recall.referenceDate ? new Date(recall.referenceDate + 'T12:00').toLocaleDateString('pt-BR') : '—'}</strong></p>
            </div>

            <div class="recall-summary-cards mb-2">
                <div class="recall-sum-card"><strong>${Math.round(totalCal)}</strong><span>kcal</span></div>
                <div class="recall-sum-card" style="border-left-color:#057b64"><strong>${totalP.toFixed(1)}g</strong><span>Proteína</span></div>
                <div class="recall-sum-card" style="border-left-color:#f39c12"><strong>${totalC.toFixed(1)}g</strong><span>Carboidrato</span></div>
                <div class="recall-sum-card" style="border-left-color:#e74c3c"><strong>${totalF.toFixed(1)}g</strong><span>Gordura</span></div>
            </div>

            ${this.MEAL_SLOTS.map(slot => {
                const meal = (recall.meals || {})[slot.key] || {};
                const items = meal.items || [];
                if (!items.length) return '';
                const mCal = items.reduce((s, it) => s + ((it.calories || 0) * (it.qty || 1)), 0);

                return `
                    <div class="card mb-2 recall-meal-block">
                        <div class="recall-meal-header">
                            <span class="material-icons-outlined">${slot.icon}</span>
                            <strong>${slot.label}</strong>
                            <span class="text-muted">${meal.time || slot.time}</span>
                            <span class="recall-meal-cal">${Math.round(mCal)} kcal</span>
                        </div>
                        <table class="table">
                            <thead><tr><th>Alimento</th><th>Porção</th><th>Qty</th><th>Kcal</th><th>P</th><th>C</th><th>G</th></tr></thead>
                            <tbody>
                                ${items.map(it => `<tr>
                                    <td>${App.escapeHtml(it.name || it.description || '')}</td>
                                    <td>${App.escapeHtml(it.portion || '')}</td>
                                    <td>${it.qty || 1}</td>
                                    <td>${Math.round((it.calories || 0) * (it.qty || 1))}</td>
                                    <td>${((it.protein || 0) * (it.qty || 1)).toFixed(1)}</td>
                                    <td>${((it.carbs || 0) * (it.qty || 1)).toFixed(1)}</td>
                                    <td>${((it.fat || 0) * (it.qty || 1)).toFixed(1)}</td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                        ${meal.notes ? `<p style="padding:8px 16px;font-size:0.85rem;color:var(--text-light)"><em>Obs: ${App.escapeHtml(meal.notes)}</em></p>` : ''}
                    </div>
                `;
            }).join('')}

            ${recall.generalNotes ? `<div class="card mt-2" style="padding:20px"><strong>Observações Gerais:</strong><p class="mt-1">${App.escapeHtml(recall.generalNotes)}</p></div>` : ''}
        `;
    },

    // ───── CRIAR ─────
    openCreate() {
        this._tempMeals = {};
        this.MEAL_SLOTS.forEach(s => {
            this._tempMeals[s.key] = { time: s.time, items: [], notes: '' };
        });

        const patients = DB.getPatients();
        const html = `
            <form onsubmit="Recall.handleSave(event)" id="recall-form">
                <div class="form-row">
                    <div class="form-group" style="flex:2">
                        <label>Paciente *</label>
                        <select name="patientId" class="form-control" required>
                            <option value="">Selecione...</option>
                            ${patients.map(p => `<option value="${p.id}">${App.escapeHtml(p.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Data Referente</label>
                        <input type="date" name="referenceDate" value="${new Date().toISOString().split('T')[0]}" class="form-control">
                    </div>
                </div>

                <p class="text-muted text-small mt-2 mb-2">Informe tudo que o paciente consumiu nas últimas 24h. Clique em cada refeição para adicionar alimentos.</p>

                ${this.MEAL_SLOTS.map(slot => `
                    <div class="recall-form-meal">
                        <div class="recall-form-meal-header">
                            <span class="material-icons-outlined">${slot.icon}</span>
                            <strong>${slot.label}</strong>
                            <input type="time" value="${slot.time}" class="form-control" style="width:100px"
                                onchange="Recall._tempMeals['${slot.key}'].time=this.value">
                        </div>
                        <div id="recall-items-${slot.key}">
                            ${this._renderMealItems(slot.key)}
                        </div>
                        <div class="flex gap-1 mt-1">
                            <button type="button" class="btn btn-sm btn-outline" onclick="Recall.addItemFromDB('${slot.key}')">
                                <span class="material-icons-outlined" style="font-size:14px">search</span> Do Banco
                            </button>
                            <button type="button" class="btn btn-sm btn-outline" onclick="Recall.addManualItem('${slot.key}')">
                                <span class="material-icons-outlined" style="font-size:14px">edit</span> Manual
                            </button>
                        </div>
                        <div class="form-group mt-1">
                            <input type="text" placeholder="Observação desta refeição..." class="form-control" style="font-size:0.85rem"
                                onchange="Recall._tempMeals['${slot.key}'].notes=this.value">
                        </div>
                    </div>
                `).join('')}

                <div class="form-group mt-2">
                    <label>Observações Gerais</label>
                    <textarea name="generalNotes" rows="2" class="form-control" placeholder="Nível de estresse, sono, hidratação, atividade física..."></textarea>
                </div>

                <div class="flex justify-between mt-3">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">
                        <span class="material-icons-outlined">save</span> Salvar Recordatório
                    </button>
                </div>
            </form>
        `;
        App.openModal('Novo Recordatório 24h', html, 'modal-xl');
    },

    _renderMealItems(slotKey) {
        const items = (this._tempMeals[slotKey]?.items) || [];
        if (!items.length) return '<p class="text-muted text-small" style="padding:4px 0">Nenhum item</p>';
        return `<table class="table"><tbody>
            ${items.map((it, i) => `<tr>
                <td>${App.escapeHtml(it.name || it.description)}</td>
                <td>${App.escapeHtml(it.portion || '')}</td>
                <td><input type="number" value="${it.qty || 1}" min="0.25" step="0.25" style="width:60px" class="form-control"
                    onchange="Recall.updateItemQty('${slotKey}',${i},this.value)"></td>
                <td>${Math.round((it.calories || 0) * (it.qty || 1))} kcal</td>
                <td><button type="button" class="btn btn-sm btn-danger" onclick="Recall.removeItem('${slotKey}',${i})">
                    <span class="material-icons-outlined" style="font-size:14px">close</span></button></td>
            </tr>`).join('')}
        </tbody></table>`;
    },

    addItemFromDB(slotKey) {
        this._activeSlot = slotKey;
        const foods = DB.getFoods();
        const overlay = document.createElement('div');
        overlay.id = 'recall-food-overlay';
        overlay.className = 'recipe-food-overlay';
        overlay.innerHTML = `<div class="recipe-food-modal">
            <div class="flex justify-between items-center mb-2">
                <h3 style="font-weight:700">Selecionar Alimento</h3>
                <button class="btn btn-sm btn-outline" onclick="document.getElementById('recall-food-overlay').remove()">
                    <span class="material-icons-outlined">close</span></button>
            </div>
            <input type="text" id="recall-food-search" placeholder="Buscar..." class="form-control mb-2"
                onkeyup="Recall._filterFoodOverlay()">
            <div id="recall-food-results" style="max-height:400px;overflow-y:auto">
                ${foods.map(f => `
                    <div class="recipe-food-item" onclick="Recall.pickFromDB('${slotKey}','${f.id}')">
                        <strong>${App.escapeHtml(f.name)}</strong>
                        <span class="text-muted text-small">${App.escapeHtml(f.portion)} · ${f.calories} kcal</span>
                    </div>
                `).join('')}
            </div>
        </div>`;
        document.body.appendChild(overlay);
    },

    _filterFoodOverlay() {
        const q = (document.getElementById('recall-food-search')?.value || '').toLowerCase();
        const container = document.getElementById('recall-food-results');
        if (!container) return;
        const foods = DB.getFoods().filter(f => f.name.toLowerCase().includes(q));
        container.innerHTML = foods.map(f => `
            <div class="recipe-food-item" onclick="Recall.pickFromDB('${Recall._activeSlot || ''}','${f.id}')">
                <strong>${App.escapeHtml(f.name)}</strong>
                <span class="text-muted text-small">${App.escapeHtml(f.portion)} · ${f.calories} kcal</span>
            </div>
        `).join('');
    },

    pickFromDB(slotKey, foodId) {
        const f = DB.getFoods().find(x => x.id === foodId);
        if (!f) return;
        this._tempMeals[slotKey].items.push({
            foodId: f.id, name: f.name, portion: f.portion,
            calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat,
            fiber: f.fiber, qty: 1
        });
        const overlay = document.getElementById('recall-food-overlay');
        if (overlay) overlay.remove();
        const el = document.getElementById('recall-items-' + slotKey);
        if (el) el.innerHTML = this._renderMealItems(slotKey);
    },

    addManualItem(slotKey) {
        const name = prompt('Nome do alimento/preparação:');
        if (!name) return;
        const portion = prompt('Porção (ex: 1 fatia, 200ml):') || '';
        const cal = parseFloat(prompt('Calorias estimadas:') || 0);

        this._tempMeals[slotKey].items.push({
            name: name.trim(), portion: portion.trim(), description: name.trim(),
            calories: cal, protein: 0, carbs: 0, fat: 0, fiber: 0, qty: 1
        });
        const el = document.getElementById('recall-items-' + slotKey);
        if (el) el.innerHTML = this._renderMealItems(slotKey);
    },

    updateItemQty(slotKey, idx, val) {
        this._tempMeals[slotKey].items[idx].qty = parseFloat(val) || 1;
        const el = document.getElementById('recall-items-' + slotKey);
        if (el) el.innerHTML = this._renderMealItems(slotKey);
    },

    removeItem(slotKey, idx) {
        this._tempMeals[slotKey].items.splice(idx, 1);
        const el = document.getElementById('recall-items-' + slotKey);
        if (el) el.innerHTML = this._renderMealItems(slotKey);
    },

    handleSave(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const patientId = fd.get('patientId');
        if (!patientId) return App.showToast('Selecione o paciente', 'error');

        const data = {
            patientId: patientId,
            referenceDate: fd.get('referenceDate'),
            meals: this._tempMeals,
            generalNotes: fd.get('generalNotes')?.trim() || ''
        };

        DB.add(DB.KEYS.RECALL, data);
        App.closeModal();
        App.showToast('Recordatório salvo!', 'success');
        App.renderPage('recall');
    },

    confirmDelete(id) {
        if (confirm('Excluir este recordatório?')) {
            DB.remove(DB.KEYS.RECALL, id);
            App.showToast('Recordatório excluído', 'info');
            this.backToList();
        }
    },

    printRecall(id) {
        const recall = DB.getById(DB.KEYS.RECALL, id);
        if (!recall) return;
        const patient = DB.getPatient(recall.patientId);
        const settings = DB.getSettings();

        let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Recordatório - ${App.escapeHtml(patient?.name || '—')}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 24px; font-size: 12px; color: #333; }
            h1 { color: #057b64; font-size: 18px; margin-bottom: 4px; }
            h2 { font-size: 14px; color: #057b64; border-bottom: 2px solid #057b64; padding-bottom: 4px; margin: 16px 0 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            th, td { padding: 5px 8px; text-align: left; border-bottom: 1px solid #eee; font-size: 11px; }
            th { background: #f5f6fa; font-weight: 600; }
            .total { font-weight: 700; background: #e8f8f5; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style></head><body>`;
        html += `<h1>${App.escapeHtml(settings.clinicName || 'NutreClin')}</h1>
            <p>Recordatório Alimentar 24h · Paciente: <strong>${App.escapeHtml(patient?.name || '—')}</strong>
            · Data: ${recall.referenceDate ? new Date(recall.referenceDate + 'T12:00').toLocaleDateString('pt-BR') : '—'}</p>`;

        this.MEAL_SLOTS.forEach(slot => {
            const meal = (recall.meals || {})[slot.key] || {};
            const items = meal.items || [];
            if (!items.length) return;
            html += `<h2>${slot.label} ${meal.time ? '(' + meal.time + ')' : ''}</h2>`;
            html += `<table><thead><tr><th>Alimento</th><th>Porção</th><th>Qty</th><th>Kcal</th><th>P</th><th>C</th><th>G</th></tr></thead><tbody>`;
            let mc = 0, mp = 0, mca = 0, mf = 0;
            items.forEach(it => {
                const q = it.qty || 1;
                mc += (it.calories || 0) * q;
                mp += (it.protein || 0) * q;
                mca += (it.carbs || 0) * q;
                mf += (it.fat || 0) * q;
                html += `<tr><td>${App.escapeHtml(it.name || '')}</td><td>${App.escapeHtml(it.portion || '')}</td><td>${q}</td>
                    <td>${Math.round((it.calories || 0) * q)}</td><td>${((it.protein || 0) * q).toFixed(1)}</td>
                    <td>${((it.carbs || 0) * q).toFixed(1)}</td><td>${((it.fat || 0) * q).toFixed(1)}</td></tr>`;
            });
            html += `<tr class="total"><td colspan="3">Subtotal</td><td>${Math.round(mc)}</td><td>${mp.toFixed(1)}</td><td>${mca.toFixed(1)}</td><td>${mf.toFixed(1)}</td></tr>`;
            html += `</tbody></table>`;
            if (meal.notes) html += `<p><em>Obs: ${App.escapeHtml(meal.notes)}</em></p>`;
        });

        const totalCal = this._calcTotalCal(recall);
        html += `<h2>Total do Dia</h2><p><strong>${Math.round(totalCal)} kcal</strong></p>`;
        if (recall.generalNotes) html += `<p><strong>Observações:</strong> ${App.escapeHtml(recall.generalNotes)}</p>`;
        html += `<p style="margin-top:24px;font-size:10px;color:#999">Gerado por NutreClin</p></body></html>`;

        const w = window.open('', '_blank');
        w.document.write(html);
        w.document.close();
        setTimeout(() => w.print(), 600);
    },

    _calcTotalCal(recall) {
        let total = 0;
        Object.values(recall.meals || {}).forEach(meal => {
            (meal.items || []).forEach(it => { total += (it.calories || 0) * (it.qty || 1); });
        });
        return total;
    },

    _calcTotalMacro(recall, prop) {
        let total = 0;
        Object.values(recall.meals || {}).forEach(meal => {
            (meal.items || []).forEach(it => { total += (it[prop] || 0) * (it.qty || 1); });
        });
        return total;
    }
};
