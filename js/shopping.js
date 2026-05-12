/* ============================================
   NutriSys - Lista de Compras Automática
   Gerada a partir do cardápio
   ============================================ */

const ShoppingList = {

    render() {
        const plans = DB.getMealPlans();
        const patients = DB.getPatients();

        return `
            <div class="section-header flex justify-between items-center mb-3">
                <div>
                    <h3 style="font-weight:700;font-size:1.15rem">Lista de Compras</h3>
                    <p class="text-muted text-small">Gere listas automáticas a partir dos cardápios</p>
                </div>
            </div>

            <div class="card mb-3" style="padding:24px">
                <h4 style="font-weight:600;margin-bottom:16px">
                    <span class="material-icons-outlined" style="vertical-align:middle">settings</span> Configurar Lista
                </h4>
                <div class="form-row">
                    <div class="form-group" style="flex:2">
                        <label>Cardápio</label>
                        <select id="sl-plan" class="form-control" onchange="ShoppingList.onPlanChange()">
                            <option value="">Selecione um cardápio...</option>
                            ${plans.map(p => {
                                const pat = patients.find(x => x.id === p.patientId);
                                return `<option value="${p.id}">${App.escapeHtml(p.name)} ${pat ? '(' + App.escapeHtml(pat.name) + ')' : ''}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Dias</label>
                        <select id="sl-days" class="form-control">
                            <option value="7" selected>7 dias (1 semana)</option>
                            <option value="14">14 dias (2 semanas)</option>
                            <option value="30">30 dias (1 mês)</option>
                            <option value="1">1 dia</option>
                        </select>
                    </div>
                    <div class="form-group" style="align-self:flex-end">
                        <button class="btn btn-primary" onclick="ShoppingList.generate()">
                            <span class="material-icons-outlined">shopping_cart</span> Gerar Lista
                        </button>
                    </div>
                </div>
            </div>

            <div id="sl-result"></div>
        `;
    },

    onPlanChange() {
        document.getElementById('sl-result').innerHTML = '';
    },

    generate() {
        const planId = document.getElementById('sl-plan').value;
        const days = parseInt(document.getElementById('sl-days').value) || 7;

        if (!planId) return App.showToast('Selecione um cardápio', 'error');

        const plan = DB.getMealPlan(planId);
        if (!plan) return App.showToast('Cardápio não encontrado', 'error');

        // Agrupa alimentos por categoria e nome
        const grouped = {};
        (plan.meals || []).forEach(meal => {
            (meal.foods || []).forEach(food => {
                const key = (food.name || '').toLowerCase().trim();
                if (!key) return;
                if (!grouped[key]) {
                    grouped[key] = {
                        name: food.name,
                        category: food.category || 'Outros',
                        portion: food.portion || '',
                        householdMeasure: food.householdMeasure || '',
                        qtyPerDay: 0,
                        grams: this._extractGrams(food.portion)
                    };
                }
                grouped[key].qtyPerDay += (food.qty || 1);
            });
        });

        // Multiplica por dias
        const items = Object.values(grouped).map(item => ({
            ...item,
            totalQty: item.qtyPerDay * days,
            totalGrams: item.grams * item.qtyPerDay * days,
            checked: false
        }));

        // Ordena por categoria
        items.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

        this._currentItems = items;
        this._currentPlan = plan;
        this._currentDays = days;

        this._renderResult();
    },

    _renderResult() {
        const items = this._currentItems;
        const plan = this._currentPlan;
        const days = this._currentDays;
        const container = document.getElementById('sl-result');
        if (!container) return;

        if (!items.length) {
            container.innerHTML = '<div class="card" style="padding:40px;text-align:center"><p class="text-muted">Este cardápio não possui alimentos.</p></div>';
            return;
        }

        // Agrupa por categoria
        const byCategory = {};
        items.forEach(item => {
            if (!byCategory[item.category]) byCategory[item.category] = [];
            byCategory[item.category].push(item);
        });

        const checkedCount = items.filter(i => i.checked).length;

        container.innerHTML = `
            <div class="card mb-2" style="padding:20px">
                <div class="flex justify-between items-center" style="flex-wrap:wrap;gap:12px">
                    <div>
                        <h4 style="font-weight:700">${App.escapeHtml(plan.name)} — ${days} dia(s)</h4>
                        <p class="text-muted text-small">${items.length} itens · ${checkedCount} marcados</p>
                    </div>
                    <div class="flex gap-1">
                        <button class="btn btn-outline" onclick="ShoppingList.printList()">
                            <span class="material-icons-outlined">print</span> Imprimir
                        </button>
                        <button class="btn btn-outline" onclick="ShoppingList.shareWhatsApp()">
                            <span class="material-icons-outlined">share</span> WhatsApp
                        </button>
                        <button class="btn btn-outline" onclick="ShoppingList.copyToClipboard()">
                            <span class="material-icons-outlined">content_copy</span> Copiar
                        </button>
                    </div>
                </div>
                <div class="sl-progress mt-2">
                    <div class="sl-progress-bar" style="width:${items.length ? (checkedCount/items.length*100) : 0}%"></div>
                </div>
            </div>

            ${Object.entries(byCategory).map(([cat, catItems]) => `
                <div class="card mb-2 sl-category-card">
                    <div class="sl-cat-header">
                        <span class="sl-cat-dot" style="background:${this._catColor(cat)}"></span>
                        <strong>${App.escapeHtml(cat)}</strong>
                        <span class="text-muted text-small">(${catItems.length})</span>
                    </div>
                    <div class="sl-items">
                        ${catItems.map((item, idx) => {
                            const globalIdx = items.indexOf(item);
                            return `
                                <label class="sl-item ${item.checked ? 'checked' : ''}" onclick="ShoppingList.toggleItem(${globalIdx})">
                                    <span class="sl-check material-icons-outlined">${item.checked ? 'check_box' : 'check_box_outline_blank'}</span>
                                    <span class="sl-item-name">${App.escapeHtml(item.name)}</span>
                                    <span class="sl-item-qty">${this._formatQty(item)}</span>
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        `;
    },

    toggleItem(idx) {
        if (this._currentItems && this._currentItems[idx] !== undefined) {
            this._currentItems[idx].checked = !this._currentItems[idx].checked;
            this._renderResult();
        }
    },

    _formatQty(item) {
        if (item.totalGrams >= 1000) return (item.totalGrams / 1000).toFixed(1) + ' kg';
        if (item.totalGrams > 0) return item.totalGrams + 'g';
        return item.totalQty + 'x ' + item.portion;
    },

    _extractGrams(portion) {
        if (!portion) return 0;
        const match = portion.match(/(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l)/i);
        if (!match) return 0;
        let val = parseFloat(match[1].replace(',', '.'));
        const unit = match[2].toLowerCase();
        if (unit === 'kg' || unit === 'l') val *= 1000;
        return val;
    },

    _catColor(cat) {
        const map = {
            'Cereais': '#f39c12', 'Leguminosas': '#689f38', 'Carnes': '#e74c3c',
            'Peixes': '#3498db', 'Ovos': '#f1c40f', 'Frutas': '#e84393',
            'Verduras': '#07bd53', 'Tubérculos': '#795548', 'Laticínios': '#00b894',
            'Oleaginosas': '#d35400', 'Óleos': '#636e72', 'Suplementos': '#6c5ce7',
            'Proteínas Vegetais': '#00cec9', 'Outros': '#b2bec3'
        };
        return map[cat] || '#636e72';
    },

    // ───── TEXTO PLANO ─────
    _toText() {
        if (!this._currentItems) return '';
        const byCategory = {};
        this._currentItems.forEach(item => {
            if (!byCategory[item.category]) byCategory[item.category] = [];
            byCategory[item.category].push(item);
        });

        let text = `🛒 LISTA DE COMPRAS — ${this._currentPlan.name} (${this._currentDays} dias)\n\n`;
        Object.entries(byCategory).forEach(([cat, items]) => {
            text += `📦 ${cat}\n`;
            items.forEach(item => {
                text += `  ${item.checked ? '✅' : '⬜'} ${item.name} — ${this._formatQty(item)}\n`;
            });
            text += '\n';
        });
        text += 'Gerado por NutriSys';
        return text;
    },

    copyToClipboard() {
        const text = this._toText();
        navigator.clipboard.writeText(text).then(() => {
            App.showToast('Lista copiada!', 'success');
        });
    },

    shareWhatsApp() {
        const text = encodeURIComponent(this._toText());
        window.open('https://wa.me/?text=' + text, '_blank');
    },

    printList() {
        const text = this._toText();
        const w = window.open('', '_blank');
        w.document.write(`<html><head><title>Lista de Compras - NutriSys</title>
            <style>body{font-family:Arial,sans-serif;padding:32px;line-height:1.8;white-space:pre-wrap;font-size:14px}</style>
            </head><body>${App.escapeHtml(text)}</body></html>`);
        w.document.close();
        w.print();
    }
};
