/* ============================================
   NutreClin - Módulo de Cardápios (Planos Alimentares)
   Com: Metas de macros, Substituições, PDF white-label, Lista de compras
   ============================================ */

const MealPlans = {
    currentView: 'list',
    currentPlanId: null,

    MEAL_TYPES: [
        { key: 'cafe_manha', label: 'Café da Manhã', icon: 'free_breakfast', time: '07:00' },
        { key: 'lanche_manha', label: 'Lanche da Manhã', icon: 'bakery_dining', time: '10:00' },
        { key: 'almoco', label: 'Almoço', icon: 'lunch_dining', time: '12:30' },
        { key: 'lanche_tarde', label: 'Lanche da Tarde', icon: 'coffee', time: '15:30' },
        { key: 'jantar', label: 'Jantar', icon: 'dinner_dining', time: '19:00' },
        { key: 'ceia', label: 'Ceia', icon: 'nightlight', time: '21:00' },
    ],

    SHOPPING_SECTIONS: {
        'Carnes': 'Açougue', 'Peixes': 'Peixaria', 'Ovos': 'Mercearia',
        'Frutas': 'Hortifrúti', 'Verduras': 'Hortifrúti', 'Tubérculos': 'Hortifrúti',
        'Cereais': 'Mercearia', 'Leguminosas': 'Mercearia', 'Laticínios': 'Laticínios',
        'Oleaginosas': 'Mercearia', 'Óleos': 'Mercearia', 'Suplementos': 'Suplementos',
        'Proteínas Vegetais': 'Mercearia', 'Outros': 'Outros',
    },

    render() {
        if (this.currentView === 'detail' && this.currentPlanId) return this.renderDetail(this.currentPlanId);
        if (this.currentView === 'create') return this.renderCreate();
        return this.renderList();
    },

    // =============================================
    // LISTA DE CARDÁPIOS
    // =============================================
    renderList() {
        const plans = DB.getMealPlans();
        return `
            <div class="search-bar">
                <div class="search-input">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" id="search-plans" placeholder="Buscar cardápio..." oninput="MealPlans.filterList()">
                </div>
                <button class="btn btn-primary" onclick="MealPlans.openCreate()">
                    <span class="material-icons-outlined">add</span> Novo Cardápio
                </button>
            </div>
            <div class="card">
                ${plans.length > 0 ? `
                    <div class="table-container">
                        <table>
                            <thead><tr>
                                <th>Nome do Cardápio</th><th>Paciente</th><th>Calorias</th><th>Data</th><th>Ações</th>
                            </tr></thead>
                            <tbody id="plans-table-body">
                                ${plans.map(plan => {
                                    const patient = DB.getPatient(plan.patientId);
                                    const totalCal = this._calcPlanTotal(plan, 'calories');
                                    return `
                                        <tr data-plan-row data-name="${App.escapeHtml(plan.name.toLowerCase())}">
                                            <td><strong>${App.escapeHtml(plan.name)}</strong></td>
                                            <td>${patient ? App.escapeHtml(patient.name) : '-'}</td>
                                            <td><strong>${totalCal.toFixed(0)}</strong> kcal</td>
                                            <td>${App.formatDate(plan.createdAt)}</td>
                                            <td>
                                                <div class="actions">
                                                    <button class="btn-icon" title="Ver" onclick="MealPlans.viewPlan('${plan.id}')"><span class="material-icons-outlined">visibility</span></button>
                                                    <button class="btn-icon" title="Editar" onclick="MealPlans.editPlan('${plan.id}')"><span class="material-icons-outlined">edit</span></button>
                                                    <button class="btn-icon" title="Usar como Template" onclick="MealPlans.clonePlan('${plan.id}')"><span class="material-icons-outlined">content_copy</span></button>
                                                    <button class="btn-icon" title="PDF" onclick="MealPlans.generatePDF('${plan.id}')"><span class="material-icons-outlined">picture_as_pdf</span></button>
                                                    <button class="btn-icon" title="Lista de Compras" onclick="MealPlans.showShoppingList('${plan.id}')"><span class="material-icons-outlined">shopping_cart</span></button>
                                                    <button class="btn-icon" title="Excluir" onclick="MealPlans.confirmDelete('${plan.id}')"><span class="material-icons-outlined">delete</span></button>
                                                </div>
                                            </td>
                                        </tr>`;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div class="empty-state">
                        <span class="material-icons-outlined">restaurant_menu</span>
                        <h3>Nenhum cardápio criado</h3>
                        <p>Crie o primeiro plano alimentar para seus pacientes</p>
                        <button class="btn btn-primary" onclick="MealPlans.openCreate()"><span class="material-icons-outlined">add</span> Criar Cardápio</button>
                    </div>
                `}
            </div>`;
    },

    filterList() {
        const q = document.getElementById('search-plans').value.toLowerCase();
        document.querySelectorAll('[data-plan-row]').forEach(r => {
            r.style.display = r.getAttribute('data-name').includes(q) ? '' : 'none';
        });
    },

    // =============================================
    // VISUALIZAR CARDÁPIO
    // =============================================
    viewPlan(id) { this.currentView = 'detail'; this.currentPlanId = id; App.renderPage('mealplans'); },

    renderDetail(id) {
        const plan = DB.getMealPlan(id);
        if (!plan) return '<p>Cardápio não encontrado.</p>';
        const patient = DB.getPatient(plan.patientId);
        const totalCal = this._calcPlanTotal(plan, 'calories');
        const totalProt = this._calcPlanTotal(plan, 'protein');
        const totalCarbs = this._calcPlanTotal(plan, 'carbs');
        const totalFat = this._calcPlanTotal(plan, 'fat');
        const totalFiber = this._calcPlanTotal(plan, 'fiber');

        let targetHtml = '';
        if (plan.targetCalories) {
            const diff = totalCal - plan.targetCalories;
            const cls = Math.abs(diff) < 50 ? 'badge-success' : (diff > 0 ? 'badge-danger' : 'badge-warning');
            const txt = Math.abs(diff) < 50 ? 'Na meta!' : (diff > 0 ? `+${diff.toFixed(0)} kcal acima` : `${Math.abs(diff).toFixed(0)} kcal abaixo`);
            targetHtml = `
                <div class="macro-target-bar mb-3">
                    <div class="macro-target-item"><span>Meta Calórica</span><strong>${plan.targetCalories} kcal</strong></div>
                    <div class="macro-target-item"><span>Status</span><strong><span class="badge ${cls}">${txt}</span></strong></div>
                    ${plan.targetProtein ? `<div class="macro-target-item"><span>Prot. meta</span><strong>${plan.targetProtein}g (atual: ${totalProt.toFixed(0)}g)</strong></div>` : ''}
                    ${plan.targetCarbs ? `<div class="macro-target-item"><span>Carb. meta</span><strong>${plan.targetCarbs}g (atual: ${totalCarbs.toFixed(0)}g)</strong></div>` : ''}
                    ${plan.targetFat ? `<div class="macro-target-item"><span>Gord. meta</span><strong>${plan.targetFat}g (atual: ${totalFat.toFixed(0)}g)</strong></div>` : ''}
                </div>`;
        }

        return `
            <button class="btn btn-outline mb-3" onclick="MealPlans.backToList()"><span class="material-icons-outlined">arrow_back</span> Voltar</button>
            <div class="flex items-center justify-between mb-3">
                <div>
                    <h2 style="font-size:1.4rem">${App.escapeHtml(plan.name)}</h2>
                    <p class="text-muted">Paciente: <strong>${patient ? App.escapeHtml(patient.name) : '-'}</strong> · Criado em ${App.formatDate(plan.createdAt)}</p>
                </div>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline" onclick="MealPlans.editPlan('${id}')"><span class="material-icons-outlined" style="font-size:16px">edit</span> Editar</button>
                    <button class="btn btn-sm btn-outline" onclick="MealPlans.clonePlan('${id}')"><span class="material-icons-outlined" style="font-size:16px">content_copy</span> Usar como Template</button>
                    <button class="btn btn-sm btn-primary" onclick="MealPlans.generatePDF('${id}')"><span class="material-icons-outlined" style="font-size:16px">picture_as_pdf</span> Gerar PDF</button>
                    <button class="btn btn-sm btn-outline" onclick="MealPlans.showShoppingList('${id}')"><span class="material-icons-outlined" style="font-size:16px">shopping_cart</span> Lista de Compras</button>
                </div>
            </div>
            ${targetHtml}
            <div class="plan-totals-bar">
                <div class="plan-total"><span>Calorias</span><strong>${totalCal.toFixed(0)} kcal</strong></div>
                <div class="plan-total"><span>Proteínas</span><strong>${totalProt.toFixed(1)}g</strong></div>
                <div class="plan-total"><span>Carboidratos</span><strong>${totalCarbs.toFixed(1)}g</strong></div>
                <div class="plan-total"><span>Gorduras</span><strong>${totalFat.toFixed(1)}g</strong></div>
                <div class="plan-total"><span>Fibras</span><strong>${totalFiber.toFixed(1)}g</strong></div>
            </div>
            ${(plan.meals || []).map(meal => {
                const mt = this.MEAL_TYPES.find(m => m.key === meal.type) || { label: meal.type, icon: 'restaurant' };
                const mCal = this._calcMealTotal(meal, 'calories');
                const mProt = this._calcMealTotal(meal, 'protein');
                const mCarbs = this._calcMealTotal(meal, 'carbs');
                const mFat = this._calcMealTotal(meal, 'fat');
                return `
                    <div class="meal-plan-card">
                        <div class="meal-plan-header">
                            <h4><span class="material-icons-outlined">${mt.icon}</span> ${App.escapeHtml(mt.label)} ${meal.time ? '· ' + meal.time : ''}</h4>
                            <span class="badge badge-success">${mCal.toFixed(0)} kcal</span>
                        </div>
                        <div class="meal-plan-body">
                            ${(meal.foods || []).length > 0 ? meal.foods.map(f => {
                                const subs = this._getSubstitutions(f);
                                return `
                                    <div class="food-item-detail">
                                        <div class="food-item">
                                            <span class="food-item-name">${App.escapeHtml(f.name)}</span>
                                            <span class="food-item-qty">${f.qty}x ${App.escapeHtml(f.portion)} ${f.householdMeasure ? '<span class=text-muted>(' + App.escapeHtml(f.householdMeasure) + ')</span>' : ''}</span>
                                            <span class="food-item-cal">${(f.calories * f.qty).toFixed(0)} kcal</span>
                                        </div>
                                        ${subs.length > 0 ? `<div class="food-substitutions"><em>Substituições: ${subs.map(s => App.escapeHtml(s)).join(', ')}</em></div>` : ''}
                                    </div>`;
                            }).join('') : '<p class="text-muted text-small">Nenhum alimento</p>'}
                            <div class="meal-totals">
                                <div class="meal-total-item"><span>Prot</span><strong>${mProt.toFixed(1)}g</strong></div>
                                <div class="meal-total-item"><span>Carb</span><strong>${mCarbs.toFixed(1)}g</strong></div>
                                <div class="meal-total-item"><span>Gord</span><strong>${mFat.toFixed(1)}g</strong></div>
                            </div>
                        </div>
                    </div>`;
            }).join('')}
            ${plan.observations ? `<div class="card mt-3"><div class="card-header"><h3>Observações</h3></div><p style="white-space:pre-wrap">${App.escapeHtml(plan.observations)}</p></div>` : ''}`;
    },

    // =============================================
    // MOTOR DE SUBSTITUIÇÕES AUTOMÁTICAS
    // =============================================
    _getSubstitutions(food, maxResults = 3) {
        const allFoods = DB.getFoods();
        const candidates = allFoods.filter(f => f.name !== food.name && f.category === (food.category || '') && f.calories > 0);
        if (candidates.length === 0) return [];
        const refCal = food.calories || 1;
        const refProt = food.protein / refCal;
        const refCarb = food.carbs / refCal;
        const refFat = food.fat / refCal;
        const scored = candidates.map(c => {
            const cCal = c.calories || 1;
            const score = Math.abs((c.protein / cCal) - refProt) + Math.abs((c.carbs / cCal) - refCarb) + Math.abs((c.fat / cCal) - refFat);
            const ratio = food.calories / c.calories;
            const portionG = this._extractGrams(food.portion) * ratio;
            return { food: c, score, portionG };
        });
        scored.sort((a, b) => a.score - b.score);
        return scored.slice(0, maxResults).map(s => {
            return s.portionG > 0 ? `${Math.round(s.portionG)}g de ${s.food.name}` : s.food.name;
        });
    },

    _extractGrams(portion) {
        const m = String(portion).match(/(\d+)\s*g/);
        return m ? parseInt(m[1]) : 100;
    },

    // =============================================
    // CRIAR / EDITAR (com metas de macros do GET)
    // =============================================
    openCreate() {
        this.currentView = 'create';
        this._editingPlan = null;
        this._tempPlan = {
            name: '', patientId: '', observations: '',
            targetCalories: 0, targetProtein: 0, targetCarbs: 0, targetFat: 0, calorieDeficit: 0,
            meals: this.MEAL_TYPES.map(mt => ({ type: mt.key, time: mt.time, foods: [] }))
        };
        App.renderPage('mealplans');
    },

    openCreateForPatient(patientId) {
        const patient = DB.getPatient(patientId);
        this.currentView = 'create';
        this._editingPlan = null;
        this._tempPlan = {
            name: patient ? `Cardápio - ${patient.name}` : '',
            patientId: patientId, observations: '',
            targetCalories: 0, targetProtein: 0, targetCarbs: 0, targetFat: 0, calorieDeficit: 0,
            meals: this.MEAL_TYPES.map(mt => ({ type: mt.key, time: mt.time, foods: [] }))
        };
        App.navigate('mealplans');
    },

    editPlan(id) {
        const plan = DB.getMealPlan(id);
        if (!plan) return;
        this.currentView = 'create';
        this._editingPlan = id;
        this._tempPlan = JSON.parse(JSON.stringify(plan));
        App.renderPage('mealplans');
    },

    _calcPatientGET(patient) {
        if (!patient || !patient.gender || !patient.weight || !patient.height || !patient.birthDate) return null;
        const age = Patients._calcAge(patient.birthDate);
        let tmb;
        if (patient.gender === 'M') {
            tmb = (10 * patient.weight) + (6.25 * patient.height) - (5 * age) + 5;
        } else {
            tmb = (10 * patient.weight) + (6.25 * patient.height) - (5 * age) - 161;
        }
        return { tmb: Math.round(tmb), get: Math.round(tmb * 1.55) };
    },

    renderCreate() {
        const plan = this._tempPlan;
        const patients = DB.getPatients();
        const currentCal = this._calcPlanTotal(plan, 'calories');
        const currentProt = this._calcPlanTotal(plan, 'protein');
        const currentCarbs = this._calcPlanTotal(plan, 'carbs');
        const currentFat = this._calcPlanTotal(plan, 'fat');
        const targetCal = plan.targetCalories || 0;
        const calPct = targetCal > 0 ? Math.min((currentCal / targetCal) * 100, 120) : 0;
        const protPct = plan.targetProtein > 0 ? Math.min((currentProt / plan.targetProtein) * 100, 120) : 0;
        const carbPct = plan.targetCarbs > 0 ? Math.min((currentCarbs / plan.targetCarbs) * 100, 120) : 0;
        const fatPct = plan.targetFat > 0 ? Math.min((currentFat / plan.targetFat) * 100, 120) : 0;
        const pClass = (pct) => pct > 105 ? 'progress-over' : pct >= 90 ? 'progress-ok' : 'progress-under';

        return `
            <button class="btn btn-outline mb-3" onclick="MealPlans.backToList()"><span class="material-icons-outlined">arrow_back</span> Voltar</button>

            <div class="card mb-3">
                <h3 class="mb-2">${this._editingPlan ? 'Editar Cardápio' : 'Novo Cardápio'}</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome do Cardápio *</label>
                        <input type="text" id="plan-name" maxlength="100" value="${App.escapeHtml(plan.name)}" placeholder="Ex: Plano de emagrecimento">
                    </div>
                    <div class="form-group">
                        <label>Paciente *</label>
                        <select id="plan-patient" onchange="MealPlans.onPatientChange()">
                            <option value="">Selecione o paciente</option>
                            ${patients.map(p => `<option value="${p.id}" ${plan.patientId === p.id ? 'selected' : ''}>${App.escapeHtml(p.name)}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <!-- METAS ENERGÉTICAS -->
            <div class="card mb-3" id="macro-targets-card">
                <div class="card-header">
                    <h3><span class="material-icons-outlined" style="font-size:20px;vertical-align:middle">track_changes</span> Metas Energéticas</h3>
                    <button class="btn btn-sm btn-outline" onclick="MealPlans.autoCalcTargets()">
                        <span class="material-icons-outlined" style="font-size:16px">calculate</span> Calcular pelo GET
                    </button>
                </div>
                <div class="form-row" style="grid-template-columns:1fr 1fr 1fr 1fr 1fr">
                    <div class="form-group">
                        <label>Déficit/Superávit (kcal)</label>
                        <input type="number" id="plan-deficit" value="${plan.calorieDeficit || 0}" step="50" onchange="MealPlans.updateDeficit()">
                    </div>
                    <div class="form-group">
                        <label>Meta Calórica (kcal)</label>
                        <input type="number" id="plan-target-cal" value="${plan.targetCalories || ''}" step="50" onchange="MealPlans.updateTargetManual()">
                    </div>
                    <div class="form-group">
                        <label>Proteínas (g)</label>
                        <input type="number" id="plan-target-prot" value="${plan.targetProtein || ''}" step="5">
                    </div>
                    <div class="form-group">
                        <label>Carboidratos (g)</label>
                        <input type="number" id="plan-target-carbs" value="${plan.targetCarbs || ''}" step="5">
                    </div>
                    <div class="form-group">
                        <label>Gorduras (g)</label>
                        <input type="number" id="plan-target-fat" value="${plan.targetFat || ''}" step="5">
                    </div>
                </div>
                <div id="get-info-text" class="text-muted text-small"></div>
                ${targetCal > 0 ? `
                <div class="macro-progress-grid mt-2">
                    <div class="macro-progress-item">
                        <div class="macro-progress-label">Calorias <strong>${currentCal.toFixed(0)}/${targetCal}</strong></div>
                        <div class="progress-bar"><div class="progress-fill ${pClass(calPct)}" style="width:${Math.min(calPct,100)}%"></div></div>
                    </div>
                    ${plan.targetProtein ? `<div class="macro-progress-item"><div class="macro-progress-label">Proteínas <strong>${currentProt.toFixed(0)}g/${plan.targetProtein}g</strong></div><div class="progress-bar"><div class="progress-fill ${pClass(protPct)}" style="width:${Math.min(protPct,100)}%"></div></div></div>` : ''}
                    ${plan.targetCarbs ? `<div class="macro-progress-item"><div class="macro-progress-label">Carboidratos <strong>${currentCarbs.toFixed(0)}g/${plan.targetCarbs}g</strong></div><div class="progress-bar"><div class="progress-fill ${pClass(carbPct)}" style="width:${Math.min(carbPct,100)}%"></div></div></div>` : ''}
                    ${plan.targetFat ? `<div class="macro-progress-item"><div class="macro-progress-label">Gorduras <strong>${currentFat.toFixed(0)}g/${plan.targetFat}g</strong></div><div class="progress-bar"><div class="progress-fill ${pClass(fatPct)}" style="width:${Math.min(fatPct,100)}%"></div></div></div>` : ''}
                </div>` : ''}
            </div>

            <div id="meals-container">
                ${(plan.meals || []).map((meal, mi) => {
                    const mt = this.MEAL_TYPES.find(m => m.key === meal.type) || { label: meal.type, icon: 'restaurant' };
                    return `
                        <div class="meal-plan-card" id="meal-${mi}">
                            <div class="meal-plan-header" onclick="MealPlans.toggleMeal(${mi})">
                                <h4><span class="material-icons-outlined">${mt.icon}</span> ${App.escapeHtml(mt.label)}</h4>
                                <div class="flex items-center gap-1">
                                    <span class="badge badge-success" id="meal-cal-${mi}">${this._calcMealTotal(meal, 'calories').toFixed(0)} kcal</span>
                                    <span class="material-icons-outlined" style="font-size:18px">expand_more</span>
                                </div>
                            </div>
                            <div class="meal-plan-body" id="meal-body-${mi}">
                                <div class="form-group mb-2">
                                    <label>Horário</label>
                                    <input type="time" value="${meal.time || ''}" onchange="MealPlans.updateMealTime(${mi}, this.value)" style="max-width:150px">
                                </div>
                                <div id="meal-foods-${mi}">
                                    ${(meal.foods || []).map((f, fi) => `
                                        <div class="food-item">
                                            <span class="food-item-name">${App.escapeHtml(f.name)} ${f.householdMeasure ? '<span class=text-muted text-small>(' + App.escapeHtml(f.householdMeasure) + ')</span>' : ''}</span>
                                            <span class="food-item-qty">
                                                <input type="number" value="${f.qty}" min="0.25" step="0.25" style="width:60px;padding:4px 6px;text-align:center;border:1px solid var(--border);border-radius:4px"
                                                    onchange="MealPlans.updateFoodQty(${mi}, ${fi}, this.value)">
                                                x ${App.escapeHtml(f.portion)}
                                            </span>
                                            <span class="food-item-cal">${(f.calories * f.qty).toFixed(0)} kcal</span>
                                            <button class="btn-icon" onclick="MealPlans.removeFood(${mi}, ${fi})">
                                                <span class="material-icons-outlined" style="font-size:18px;color:var(--danger)">close</span>
                                            </button>
                                        </div>`).join('')}
                                </div>
                                <button class="btn btn-sm btn-outline mt-2" onclick="MealPlans.openAddFoodModal(${mi})">
                                    <span class="material-icons-outlined" style="font-size:16px">add</span> Adicionar Alimento
                                </button>
                            </div>
                        </div>`;
                }).join('')}
            </div>

            <div class="card mt-3">
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="plan-observations" rows="3" maxlength="500" placeholder="Orientações gerais, substituições permitidas...">${App.escapeHtml(plan.observations || '')}</textarea>
                </div>
            </div>
            <div class="flex justify-between mt-3">
                <button class="btn btn-outline" onclick="MealPlans.backToList()">Cancelar</button>
                <button class="btn btn-primary" onclick="MealPlans.savePlan()">
                    <span class="material-icons-outlined">save</span> ${this._editingPlan ? 'Salvar Alterações' : 'Salvar Cardápio'}
                </button>
            </div>`;
    },

    onPatientChange() {
        const pid = document.getElementById('plan-patient').value;
        if (pid) this._tempPlan.patientId = pid;
        const info = document.getElementById('get-info-text');
        if (pid && info) {
            const patient = DB.getPatient(pid);
            const result = this._calcPatientGET(patient);
            info.textContent = result
                ? `TMB estimada (Mifflin): ${result.tmb} kcal · GET estimado (fator 1.55): ${result.get} kcal`
                : 'Complete os dados do paciente (sexo, peso, altura, nascimento) para calcular o GET.';
        }
    },

    autoCalcTargets() {
        const pid = document.getElementById('plan-patient').value;
        if (!pid) { App.showToast('Selecione um paciente primeiro.', 'error'); return; }
        const patient = DB.getPatient(pid);
        const result = this._calcPatientGET(patient);
        if (!result) { App.showToast('Complete os dados do paciente para calcular.', 'error'); return; }
        const deficit = parseInt(document.getElementById('plan-deficit').value) || 0;
        const target = result.get + deficit;
        const protG = Math.round((target * 0.25) / 4);
        const carbG = Math.round((target * 0.50) / 4);
        const fatG = Math.round((target * 0.25) / 9);
        document.getElementById('plan-target-cal').value = target;
        document.getElementById('plan-target-prot').value = protG;
        document.getElementById('plan-target-carbs').value = carbG;
        document.getElementById('plan-target-fat').value = fatG;
        this._tempPlan.targetCalories = target;
        this._tempPlan.targetProtein = protG;
        this._tempPlan.targetCarbs = carbG;
        this._tempPlan.targetFat = fatG;
        this._tempPlan.calorieDeficit = deficit;
        App.showToast(`GET: ${result.get} kcal · Meta: ${target} kcal (${deficit >= 0 ? '+' + deficit : deficit})`, 'success');
        App.renderPage('mealplans');
    },

    updateDeficit() { this._tempPlan.calorieDeficit = parseInt(document.getElementById('plan-deficit').value) || 0; },
    updateTargetManual() { this._tempPlan.targetCalories = parseInt(document.getElementById('plan-target-cal').value) || 0; },

    toggleMeal(mi) {
        const body = document.getElementById(`meal-body-${mi}`);
        if (body) body.style.display = body.style.display === 'none' ? '' : 'none';
    },

    updateMealTime(mi, time) { this._tempPlan.meals[mi].time = time; },

    updateFoodQty(mi, fi, qty) {
        const q = parseFloat(qty);
        if (q > 0) {
            this._tempPlan.meals[mi].foods[fi].qty = q;
            const badge = document.getElementById(`meal-cal-${mi}`);
            if (badge) badge.textContent = this._calcMealTotal(this._tempPlan.meals[mi], 'calories').toFixed(0) + ' kcal';
        }
    },

    removeFood(mi, fi) {
        this._tempPlan.meals[mi].foods.splice(fi, 1);
        App.renderPage('mealplans');
    },

    // ---------- MODAL ADICIONAR ALIMENTO ----------
    openAddFoodModal(mealIdx) {
        this._currentMealIdx = mealIdx;
        const foods = DB.getFoods();
        const categories = [...new Set(foods.map(f => f.category))].sort();
        App.openModal('Adicionar Alimento', `
            <div class="search-bar mb-2" style="margin-bottom:12px">
                <div class="search-input" style="flex:1">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" id="modal-search-food" placeholder="Buscar alimento..." oninput="MealPlans.filterFoodModal()">
                </div>
                <select id="modal-filter-cat" style="padding:8px 12px;border:1.5px solid var(--border);border-radius:6px;font-family:inherit" onchange="MealPlans.filterFoodModal()">
                    <option value="">Todas</option>
                    ${categories.map(c => `<option value="${App.escapeHtml(c)}">${App.escapeHtml(c)}</option>`).join('')}
                </select>
            </div>
            <div style="max-height:400px;overflow-y:auto">
                <table>
                    <thead><tr><th>Alimento</th><th>Porção</th><th>Medida Caseira</th><th>Cal</th><th>P/C/G</th><th></th></tr></thead>
                    <tbody id="modal-foods-list">
                        ${foods.map(f => `
                            <tr data-modal-food data-name="${App.escapeHtml(f.name.toLowerCase())}" data-cat="${App.escapeHtml(f.category || '')}">
                                <td><strong>${App.escapeHtml(f.name)}</strong> <span class="text-muted text-small">${f.source ? '(' + f.source + ')' : ''}</span></td>
                                <td class="text-small">${App.escapeHtml(f.portion)}</td>
                                <td class="text-small text-muted">${App.escapeHtml(f.householdMeasure || '-')}</td>
                                <td>${f.calories}</td>
                                <td class="text-small">${f.protein}/${f.carbs}/${f.fat}</td>
                                <td><button class="btn btn-sm btn-primary" onclick="MealPlans.addFoodToPlan('${f.id}')"><span class="material-icons-outlined" style="font-size:14px">add</span></button></td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`, 'modal-xl');
    },

    filterFoodModal() {
        const q = document.getElementById('modal-search-food').value.toLowerCase();
        const cat = document.getElementById('modal-filter-cat').value;
        document.querySelectorAll('[data-modal-food]').forEach(r => {
            const matchN = r.getAttribute('data-name').includes(q);
            const matchC = !cat || r.getAttribute('data-cat') === cat;
            r.style.display = (matchN && matchC) ? '' : 'none';
        });
    },

    addFoodToPlan(foodId) {
        const food = DB.getById(DB.KEYS.FOODS, foodId);
        if (!food || this._currentMealIdx === undefined) return;
        this._tempPlan.meals[this._currentMealIdx].foods.push({
            foodId: food.id, name: food.name, portion: food.portion,
            householdMeasure: food.householdMeasure || '',
            calories: food.calories, protein: food.protein, carbs: food.carbs,
            fat: food.fat, fiber: food.fiber, category: food.category, qty: 1
        });
        App.closeModal();
        App.renderPage('mealplans');
        App.showToast(`${food.name} adicionado!`, 'success');
    },

    // ---------- SALVAR ----------
    savePlan() {
        const name = document.getElementById('plan-name').value.trim();
        const patientId = document.getElementById('plan-patient').value;
        const observations = document.getElementById('plan-observations').value.trim();
        if (!name) { App.showToast('Informe o nome do cardápio', 'error'); return; }
        if (!patientId) { App.showToast('Selecione o paciente', 'error'); return; }
        this._tempPlan.name = name;
        this._tempPlan.patientId = patientId;
        this._tempPlan.observations = observations;
        this._tempPlan.targetCalories = parseInt(document.getElementById('plan-target-cal').value) || 0;
        this._tempPlan.targetProtein = parseInt(document.getElementById('plan-target-prot').value) || 0;
        this._tempPlan.targetCarbs = parseInt(document.getElementById('plan-target-carbs').value) || 0;
        this._tempPlan.targetFat = parseInt(document.getElementById('plan-target-fat').value) || 0;
        this._tempPlan.calorieDeficit = parseInt(document.getElementById('plan-deficit').value) || 0;
        if (this._editingPlan) {
            DB.updateMealPlan(this._editingPlan, this._tempPlan);
            App.showToast('Cardápio atualizado!', 'success');
        } else {
            DB.addMealPlan({ ...this._tempPlan });
            App.showToast('Cardápio criado com sucesso!', 'success');
        }
        this.backToList();
    },

    confirmDelete(id) {
        const plan = DB.getMealPlan(id);
        if (!plan) return;
        App.openModal('Confirmar Exclusão', `
            <p>Excluir o cardápio <strong>${App.escapeHtml(plan.name)}</strong>?</p>
            <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
                <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-danger" onclick="MealPlans.doDelete('${id}')">Excluir</button>
            </div>`);
    },

    doDelete(id) {
        DB.removeMealPlan(id);
        App.closeModal();
        this.backToList();
        App.showToast('Cardápio excluído', 'info');
    },

    // =============================================
    // LISTA DE COMPRAS
    // =============================================
    showShoppingList(planId, days = 7) {
        const plan = DB.getMealPlan(planId);
        if (!plan) return;
        const itemsMap = {};
        (plan.meals || []).forEach(meal => {
            (meal.foods || []).forEach(f => {
                const key = f.name;
                if (!itemsMap[key]) itemsMap[key] = { name: f.name, portion: f.portion, category: f.category || 'Outros', totalQty: 0, gramsPerPortion: this._extractGrams(f.portion) };
                itemsMap[key].totalQty += f.qty;
            });
        });
        Object.values(itemsMap).forEach(item => { item.totalQty *= days; item.totalGrams = item.gramsPerPortion * item.totalQty; });
        const sections = {};
        Object.values(itemsMap).forEach(item => {
            const sec = this.SHOPPING_SECTIONS[item.category] || 'Outros';
            if (!sections[sec]) sections[sec] = [];
            sections[sec].push(item);
        });

        let html = `
            <div class="mb-3">
                <label style="font-weight:500;margin-right:8px">Dias da dieta:</label>
                <select id="shopping-days" onchange="MealPlans.showShoppingList('${planId}', parseInt(this.value))" style="padding:6px 12px;border:1.5px solid var(--border);border-radius:6px;font-family:inherit">
                    ${[1,3,5,7,14,30].map(d => `<option value="${d}" ${d === days ? 'selected' : ''}>${d} dia${d > 1 ? 's' : ''}</option>`).join('')}
                </select>
            </div>`;

        const secOrder = ['Açougue','Peixaria','Hortifrúti','Laticínios','Mercearia','Suplementos','Outros'];
        secOrder.forEach(sec => {
            if (!sections[sec]) return;
            html += `<h4 style="color:var(--primary);margin:16px 0 8px"><span class="material-icons-outlined" style="font-size:18px;vertical-align:middle">storefront</span> ${App.escapeHtml(sec)}</h4>`;
            html += '<div class="table-container"><table><thead><tr><th>Item</th><th>Porções</th><th>Quantidade Total</th></tr></thead><tbody>';
            sections[sec].sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
                const t = item.totalGrams >= 1000 ? (item.totalGrams / 1000).toFixed(1) + ' kg' : item.totalGrams + 'g';
                html += `<tr><td>${App.escapeHtml(item.name)}</td><td>${item.totalQty}x ${App.escapeHtml(item.portion)}</td><td><strong>${t}</strong></td></tr>`;
            });
            html += '</tbody></table></div>';
        });

        html += `<div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
            <button class="btn btn-outline" onclick="App.closeModal()">Fechar</button>
            <button class="btn btn-primary" onclick="MealPlans.printShoppingList('${planId}', ${days})"><span class="material-icons-outlined" style="font-size:16px">print</span> Imprimir</button>
        </div>`;
        App.openModal('Lista de Compras', html, 'modal-lg');
    },

    printShoppingList(planId, days) {
        const plan = DB.getMealPlan(planId);
        if (!plan) return;
        const patient = DB.getPatient(plan.patientId);
        const settings = DB.getSettings();
        const itemsMap = {};
        (plan.meals || []).forEach(meal => {
            (meal.foods || []).forEach(f => {
                const key = f.name;
                if (!itemsMap[key]) itemsMap[key] = { name: f.name, portion: f.portion, category: f.category || 'Outros', totalQty: 0, gramsPerPortion: this._extractGrams(f.portion) };
                itemsMap[key].totalQty += f.qty;
            });
        });
        Object.values(itemsMap).forEach(item => { item.totalQty *= days; item.totalGrams = item.gramsPerPortion * item.totalQty; });
        const sections = {};
        Object.values(itemsMap).forEach(item => {
            const sec = this.SHOPPING_SECTIONS[item.category] || 'Outros';
            if (!sections[sec]) sections[sec] = [];
            sections[sec].push(item);
        });
        const color = settings.primaryColor || '#00b894';
        let html = `<html><head><title>Lista de Compras</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#333;max-width:700px;margin:0 auto}h1{color:${color};font-size:20px}h2{font-size:14px;color:#666;font-weight:normal}h3{color:${color};font-size:15px;margin:18px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px}table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;color:#666;border-bottom:1px solid #ddd;padding:6px}td{padding:6px;border-bottom:1px solid #eee}.footer{margin-top:30px;text-align:center;font-size:11px;color:#999;border-top:1px solid #ddd;padding-top:12px}@media print{body{padding:15px}}</style></head><body>`;
        if (settings.logo) html += `<img src="${settings.logo}" style="max-height:60px;margin-bottom:10px" alt="Logo">`;
        html += `<h1>Lista de Compras</h1><h2>${patient ? patient.name : ''} · ${plan.name} · ${days} dia(s)</h2>`;
        ['Açougue','Peixaria','Hortifrúti','Laticínios','Mercearia','Suplementos','Outros'].forEach(sec => {
            if (!sections[sec]) return;
            html += `<h3>${sec}</h3><table><tr><th>Item</th><th>Quantidade</th></tr>`;
            sections[sec].sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
                const t = item.totalGrams >= 1000 ? (item.totalGrams/1000).toFixed(1)+'kg' : item.totalGrams+'g';
                html += `<tr><td>${item.name}</td><td><strong>${t}</strong></td></tr>`;
            });
            html += '</table>';
        });
        html += `<div class="footer">${settings.clinicName || 'NutreClin'} · ${new Date().toLocaleDateString('pt-BR')}</div></body></html>`;
        const w = window.open('', '_blank');
        w.document.write(html); w.document.close(); w.onload = () => w.print();
    },

    // =============================================
    // PDF WHITE-LABEL
    // =============================================
    generatePDF(id) {
        const plan = DB.getMealPlan(id);
        if (!plan) return;
        const patient = DB.getPatient(plan.patientId);
        const settings = DB.getSettings();
        const totalCal = this._calcPlanTotal(plan, 'calories');
        const totalProt = this._calcPlanTotal(plan, 'protein');
        const totalCarbs = this._calcPlanTotal(plan, 'carbs');
        const totalFat = this._calcPlanTotal(plan, 'fat');
        const totalFiber = this._calcPlanTotal(plan, 'fiber');
        const brandColor = settings.primaryColor || '#00b894';
        const brandDark = this._darkenColor(brandColor, 20);
        const brandLight = brandColor + '18';

        let html = `<html><head><title>${App.escapeHtml(plan.name)}</title>
        <style>
            *{margin:0;padding:0;box-sizing:border-box}
            body{font-family:'Segoe UI',Arial,sans-serif;color:#333;padding:35px;max-width:850px;margin:0 auto;line-height:1.5}
            .header{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid ${brandColor};padding-bottom:16px;margin-bottom:20px}
            .header-logo img{max-height:70px}
            .header-info{text-align:right}
            .header-info h1{font-size:22px;color:${brandColor}}
            .header-info p{font-size:12px;color:#888}
            .patient-box{background:${brandLight};border-radius:8px;padding:14px 20px;margin-bottom:20px;font-size:13px}
            .patient-box strong{color:${brandDark}}
            .totals{display:flex;gap:0;background:${brandColor};border-radius:8px;overflow:hidden;margin-bottom:24px}
            .total-item{flex:1;padding:14px;text-align:center;color:#fff;border-right:1px solid rgba(255,255,255,0.2)}
            .total-item:last-child{border-right:none}
            .total-item span{display:block;font-size:10px;text-transform:uppercase;opacity:0.8;letter-spacing:0.5px}
            .total-item strong{font-size:18px}
            .meal{margin:16px 0;border:1px solid #ddd;border-radius:8px;overflow:hidden;page-break-inside:avoid}
            .meal-header{background:${brandLight};padding:10px 16px;font-weight:bold;color:${brandDark};font-size:14px;display:flex;justify-content:space-between}
            .meal-body{padding:10px 16px}
            .food{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:12px}
            .food:last-child{border-bottom:none}
            .food-subs{font-size:10px;color:#888;font-style:italic;padding:2px 0 6px}
            .meal-macros{display:flex;gap:20px;padding:8px 0 4px;border-top:1px solid #ddd;margin-top:6px;font-size:11px;color:#666}
            .obs{margin-top:20px;padding:14px;background:#fffde7;border-radius:8px;font-size:12px;border-left:4px solid #ffc107}
            ${plan.targetCalories ? `.target-box{background:#f5f5f5;border-radius:8px;padding:12px 20px;margin-bottom:16px;font-size:12px;display:flex;gap:24px}.target-box span{color:#888}.target-box strong{color:${brandDark}}` : ''}
            .footer{margin-top:30px;text-align:center;font-size:10px;color:#aaa;border-top:1px solid #ddd;padding-top:14px}
            @media print{body{padding:15px;font-size:11px}}
        </style></head><body>
        <div class="header">
            <div class="header-logo">${settings.logo ? `<img src="${settings.logo}" alt="Logo">` : `<div style="font-size:24px;font-weight:700;color:${brandColor}">${App.escapeHtml(settings.clinicName || 'NutreClin')}</div>`}</div>
            <div class="header-info"><h1>${App.escapeHtml(plan.name)}</h1><p>Data: ${new Date().toLocaleDateString('pt-BR')}</p></div>
        </div>
        <div class="patient-box"><strong>Paciente:</strong> ${patient ? App.escapeHtml(patient.name) : '-'}${patient && patient.goal ? ` · <strong>Objetivo:</strong> ${App.escapeHtml(patient.goal)}` : ''}</div>
        ${plan.targetCalories ? `<div class="target-box"><div><span>Meta Calórica:</span> <strong>${plan.targetCalories} kcal</strong></div>${plan.targetProtein ? `<div><span>Prot:</span> <strong>${plan.targetProtein}g</strong></div>` : ''}${plan.targetCarbs ? `<div><span>Carb:</span> <strong>${plan.targetCarbs}g</strong></div>` : ''}${plan.targetFat ? `<div><span>Gord:</span> <strong>${plan.targetFat}g</strong></div>` : ''}</div>` : ''}
        <div class="totals">
            <div class="total-item"><span>Calorias</span><strong>${totalCal.toFixed(0)}</strong></div>
            <div class="total-item"><span>Proteínas</span><strong>${totalProt.toFixed(1)}g</strong></div>
            <div class="total-item"><span>Carboidratos</span><strong>${totalCarbs.toFixed(1)}g</strong></div>
            <div class="total-item"><span>Gorduras</span><strong>${totalFat.toFixed(1)}g</strong></div>
            <div class="total-item"><span>Fibras</span><strong>${totalFiber.toFixed(1)}g</strong></div>
        </div>`;

        (plan.meals || []).forEach(meal => {
            const mt = this.MEAL_TYPES.find(m => m.key === meal.type) || { label: meal.type };
            const mCal = this._calcMealTotal(meal, 'calories');
            const mProt = this._calcMealTotal(meal, 'protein');
            const mCarbs = this._calcMealTotal(meal, 'carbs');
            const mFat = this._calcMealTotal(meal, 'fat');
            html += `<div class="meal"><div class="meal-header"><span>${App.escapeHtml(mt.label)} ${meal.time ? '· '+meal.time : ''}</span><span>${mCal.toFixed(0)} kcal</span></div><div class="meal-body">`;
            (meal.foods || []).forEach(f => {
                const pt = f.householdMeasure ? `${f.qty}x ${App.escapeHtml(f.portion)} (${App.escapeHtml(f.householdMeasure)})` : `${f.qty}x ${App.escapeHtml(f.portion)}`;
                html += `<div class="food"><span>${App.escapeHtml(f.name)} — ${pt}</span><span>${(f.calories*f.qty).toFixed(0)} kcal</span></div>`;
                const subs = this._getSubstitutions(f, 3);
                if (subs.length) html += `<div class="food-subs">Substituições: ${subs.map(s => App.escapeHtml(s)).join(' | ')}</div>`;
            });
            html += `<div class="meal-macros"><span>Prot: ${mProt.toFixed(1)}g</span><span>Carb: ${mCarbs.toFixed(1)}g</span><span>Gord: ${mFat.toFixed(1)}g</span></div></div></div>`;
        });

        if (plan.observations) html += `<div class="obs"><strong>Observações:</strong> ${App.escapeHtml(plan.observations)}</div>`;
        html += `<div class="footer">${App.escapeHtml(settings.clinicName || 'NutreClin')} · Gerado em ${new Date().toLocaleDateString('pt-BR')}</div></body></html>`;
        const w = window.open('', '_blank');
        w.document.write(html); w.document.close(); w.onload = () => w.print();
    },

    _darkenColor(hex, pct) {
        const num = parseInt(hex.replace('#',''), 16);
        const r = Math.max(0, (num >> 16) - Math.round(2.55 * pct));
        const g = Math.max(0, ((num >> 8) & 0xFF) - Math.round(2.55 * pct));
        const b = Math.max(0, (num & 0xFF) - Math.round(2.55 * pct));
        return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    },

    // =============================================
    // HELPERS
    // =============================================
    _calcMealTotal(meal, prop) {
        return (meal.foods || []).reduce((s, f) => s + ((f[prop] || 0) * (f.qty || 1)), 0);
    },
    _calcPlanTotal(plan, prop) {
        return (plan.meals || []).reduce((s, m) => s + this._calcMealTotal(m, prop), 0);
    },
    // =============================================
    // CLONAR / USAR COMO TEMPLATE
    // =============================================
    clonePlan(id) {
        const source = DB.getMealPlan(id);
        if (!source) return;
        const patients = DB.getPatients();
        if (!patients.length) {
            App.showToast('Cadastre um paciente antes de usar o template.', 'error');
            return;
        }

        const patientOptions = patients.map(p =>
            `<option value="${p.id}">${App.escapeHtml(p.name)}</option>`
        ).join('');

        App.openModal('Usar Cardápio como Template', `
            <p style="margin-bottom:16px">O cardápio <strong>${App.escapeHtml(source.name)}</strong> será copiado com todas as refeições e alimentos. Escolha o paciente de destino:</p>
            <div class="form-group">
                <label>Paciente de destino</label>
                <select id="clone-patient" class="form-control">
                    <option value="">-- Selecione --</option>
                    ${patientOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Nome do novo cardápio</label>
                <input type="text" id="clone-name" class="form-control" value="${App.escapeHtml(source.name)} (cópia)">
            </div>
            <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
                <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="MealPlans.doClone('${id}')">Criar Cópia</button>
            </div>`);
    },

    doClone(sourceId) {
        const patientId = document.getElementById('clone-patient').value;
        const name = document.getElementById('clone-name').value.trim();
        if (!patientId) { App.showToast('Selecione o paciente de destino.', 'error'); return; }
        if (!name) { App.showToast('Informe o nome do cardápio.', 'error'); return; }

        const source = DB.getMealPlan(sourceId);
        if (!source) return;

        const cloned = {
            name,
            patientId,
            observations: source.observations || '',
            targetCalories: source.targetCalories || 0,
            targetProtein: source.targetProtein || 0,
            targetCarbs: source.targetCarbs || 0,
            targetFat: source.targetFat || 0,
            calorieDeficit: source.calorieDeficit || 0,
            // Deep copy das refeições
            meals: JSON.parse(JSON.stringify(source.meals || []))
        };

        const newPlan = DB.addMealPlan(cloned);
        App.closeModal();
        App.showToast(`Cardápio "${name}" criado com sucesso!`, 'success');
        this.viewPlan(newPlan.id);
    },

    backToList() {
        this.currentView = 'list';
        this.currentPlanId = null;
        this._editingPlan = null;
        this._tempPlan = null;
        App.renderPage('mealplans');
    }
};
