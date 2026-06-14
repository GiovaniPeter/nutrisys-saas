/* ============================================
   NutreClin - Módulo de Prescrição de
   Suplementos e Fitoterápicos
   ============================================ */

const Supplements = {
    currentView: 'list',

    categories: [
        'Vitamina',
        'Mineral',
        'Proteína/Aminoácido',
        'Ácido graxo',
        'Probiótico/Prebiótico',
        'Fitoterápico',
        'Fórmula Manipulada',
        'Termogênico',
        'Antioxidante',
        'Adaptógeno',
        'Outro',
    ],

    commonSupplements: [
        { name: 'Vitamina D3', category: 'Vitamina', defaultDose: '2.000 UI', defaultFrequency: '1x ao dia' },
        { name: 'Vitamina C', category: 'Vitamina', defaultDose: '500 mg', defaultFrequency: '1x ao dia' },
        { name: 'Vitamina B12 (Metilcobalamina)', category: 'Vitamina', defaultDose: '1.000 mcg', defaultFrequency: '1x ao dia' },
        { name: 'Complexo B', category: 'Vitamina', defaultDose: '1 cápsula', defaultFrequency: '1x ao dia' },
        { name: 'Zinco quelado', category: 'Mineral', defaultDose: '30 mg', defaultFrequency: '1x ao dia' },
        { name: 'Magnésio dimalato', category: 'Mineral', defaultDose: '300 mg', defaultFrequency: '1x ao dia' },
        { name: 'Ferro quelado', category: 'Mineral', defaultDose: '30 mg', defaultFrequency: '1x ao dia' },
        { name: 'Selênio', category: 'Mineral', defaultDose: '200 mcg', defaultFrequency: '1x ao dia' },
        { name: 'Cálcio + Vitamina D', category: 'Mineral', defaultDose: '500 mg + 400 UI', defaultFrequency: '1x ao dia' },
        { name: 'Ômega 3 (EPA/DHA)', category: 'Ácido graxo', defaultDose: '1.000 mg', defaultFrequency: '2x ao dia' },
        { name: 'Whey Protein Isolado', category: 'Proteína/Aminoácido', defaultDose: '30 g', defaultFrequency: '1x ao dia' },
        { name: 'Creatina monohidratada', category: 'Proteína/Aminoácido', defaultDose: '5 g', defaultFrequency: '1x ao dia' },
        { name: 'BCAA', category: 'Proteína/Aminoácido', defaultDose: '5 g', defaultFrequency: '1x ao dia' },
        { name: 'Glutamina', category: 'Proteína/Aminoácido', defaultDose: '5 g', defaultFrequency: '1x ao dia' },
        { name: 'Colágeno hidrolisado', category: 'Proteína/Aminoácido', defaultDose: '10 g', defaultFrequency: '1x ao dia' },
        { name: 'Probiótico (Lactobacillus)', category: 'Probiótico/Prebiótico', defaultDose: '10 bilhões UFC', defaultFrequency: '1x ao dia' },
        { name: 'Psyllium', category: 'Probiótico/Prebiótico', defaultDose: '5 g', defaultFrequency: '2x ao dia' },
        { name: 'Silimarina (Cardo-mariano)', category: 'Fitoterápico', defaultDose: '200 mg', defaultFrequency: '2x ao dia' },
        { name: 'Curcumina (Cúrcuma)', category: 'Fitoterápico', defaultDose: '500 mg', defaultFrequency: '1x ao dia' },
        { name: 'Ashwagandha', category: 'Adaptógeno', defaultDose: '300 mg', defaultFrequency: '2x ao dia' },
        { name: 'Rhodiola rosea', category: 'Adaptógeno', defaultDose: '200 mg', defaultFrequency: '1x ao dia' },
        { name: 'Chá verde (extrato)', category: 'Termogênico', defaultDose: '500 mg', defaultFrequency: '1x ao dia' },
        { name: 'Spirulina', category: 'Outro', defaultDose: '3 g', defaultFrequency: '1x ao dia' },
        { name: 'Coenzima Q10', category: 'Antioxidante', defaultDose: '100 mg', defaultFrequency: '1x ao dia' },
        { name: 'Resveratrol', category: 'Antioxidante', defaultDose: '100 mg', defaultFrequency: '1x ao dia' },
    ],

    render() {
        return this.renderList();
    },

    renderList() {
        const prescriptions = DB.getSupplementPrescriptions();

        return `
            <div class="search-bar">
                <div class="search-input">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" id="search-supplements" placeholder="Buscar por paciente..." oninput="Supplements.filterList()">
                </div>
                <button class="btn btn-primary" onclick="Supplements.openNewModal()">
                    <span class="material-icons-outlined">add_circle</span> Nova Prescrição
                </button>
            </div>

            <div class="card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Paciente</th>
                                <th>Data</th>
                                <th>Itens</th>
                                <th>Tipo</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="supplements-table-body">
                            ${prescriptions.length > 0 ? prescriptions.map(p => {
                                const patient = DB.getPatient(p.patientId);
                                const patientName = patient ? patient.name : 'Paciente removido';
                                const hasManipulated = p.items.some(i => i.category === 'Fórmula Manipulada');
                                return `
                                    <tr data-supp-row data-name="${App.escapeHtml(patientName.toLowerCase())}">
                                        <td><strong>${App.escapeHtml(patientName)}</strong></td>
                                        <td>${App.formatDate(p.createdAt)}</td>
                                        <td>${p.items.length} suplemento(s)</td>
                                        <td>
                                            ${hasManipulated ? '<span class="badge badge-purple">Manipulado</span>' : ''}
                                            <span class="badge badge-info">Comercial</span>
                                        </td>
                                        <td>
                                            <div class="actions">
                                                <button class="btn-icon" title="Ver prescrição" onclick="Supplements.viewPrescription('${p.id}')">
                                                    <span class="material-icons-outlined">visibility</span>
                                                </button>
                                                <button class="btn-icon" title="Editar" onclick="Supplements.openEditModal('${p.id}')">
                                                    <span class="material-icons-outlined">edit</span>
                                                </button>
                                                <button class="btn-icon" title="Excluir" onclick="Supplements.confirmDelete('${p.id}')">
                                                    <span class="material-icons-outlined">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('') : `
                                <tr><td colspan="5" class="text-center text-muted" style="padding:40px">Nenhuma prescrição registrada</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    filterList() {
        const query = document.getElementById('search-supplements').value.toLowerCase();
        document.querySelectorAll('[data-supp-row]').forEach(row => {
            const name = row.getAttribute('data-name');
            row.style.display = name.includes(query) ? '' : 'none';
        });
    },

    // ---------- MODAL NOVA PRESCRIÇÃO ----------
    _itemCounter: 0,

    openNewModal(patientId) {
        const patients = DB.getPatients();
        if (patients.length === 0) {
            App.showToast('Cadastre um paciente primeiro.', 'error');
            return;
        }
        this._itemCounter = 0;

        const html = `
            <form id="supplement-form" onsubmit="Supplements.handleSave(event, '')">
                <div class="form-row">
                    <div class="form-group">
                        <label>Paciente *</label>
                        <select name="patientId" required>
                            <option value="">Selecione</option>
                            ${patients.map(p => `<option value="${p.id}" ${p.id === patientId ? 'selected' : ''}>${App.escapeHtml(p.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Adicionar suplemento comum</label>
                        <select id="quick-add-supplement" onchange="Supplements.quickAdd()">
                            <option value="">-- Selecione para adicionar --</option>
                            ${this.categories.map(cat => {
                                const items = this.commonSupplements.filter(s => s.category === cat);
                                if (items.length === 0) return '';
                                return `<optgroup label="${App.escapeHtml(cat)}">
                                    ${items.map((s, i) => `<option value="${i}">${App.escapeHtml(s.name)}</option>`).join('')}
                                </optgroup>`;
                            }).join('')}
                        </select>
                    </div>
                </div>

                <div id="supplement-items-container">
                    <p class="text-muted text-small" id="no-items-msg">Nenhum suplemento adicionado. Use o seletor acima ou adicione manualmente.</p>
                </div>

                <button type="button" class="btn btn-outline mt-2 mb-2" onclick="Supplements.addItemRow()">
                    <span class="material-icons-outlined">add</span> Adicionar Item Manual
                </button>

                <div class="form-group">
                    <label>Orientações gerais</label>
                    <textarea name="generalNotes" rows="3" placeholder="Tomar com as refeições, evitar antes de dormir..."></textarea>
                </div>

                <div class="form-group">
                    <label>Duração do tratamento</label>
                    <input type="text" name="duration" placeholder="Ex: 90 dias, 3 meses, uso contínuo...">
                </div>

                <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:8px">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar Prescrição</button>
                </div>
            </form>
        `;
        App.openModal('Nova Prescrição de Suplementos', html, 'modal-xl');
    },

    quickAdd() {
        const sel = document.getElementById('quick-add-supplement');
        const idx = parseInt(sel.value);
        if (isNaN(idx)) return;
        const supp = this.commonSupplements[idx];
        this.addItemRow(supp.name, supp.category, supp.defaultDose, supp.defaultFrequency, '');
        sel.value = '';
    },

    addItemRow(name = '', category = '', dose = '', frequency = '', instructions = '') {
        const container = document.getElementById('supplement-items-container');
        const msg = document.getElementById('no-items-msg');
        if (msg) msg.remove();

        this._itemCounter++;
        const id = this._itemCounter;

        const div = document.createElement('div');
        div.className = 'supplement-item-row card mb-2';
        div.id = 'supp-item-' + id;
        div.innerHTML = `
            <div class="supplement-item-header">
                <strong>Item #${id}</strong>
                <button type="button" class="btn-icon" onclick="document.getElementById('supp-item-${id}').remove()" title="Remover">
                    <span class="material-icons-outlined">close</span>
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Nome do suplemento *</label>
                    <input type="text" name="item_name_${id}" value="${App.escapeHtml(name)}" required placeholder="Ex: Vitamina D3">
                </div>
                <div class="form-group">
                    <label>Categoria</label>
                    <select name="item_category_${id}">
                        ${this.categories.map(c => `<option value="${c}" ${c === category ? 'selected' : ''}>${App.escapeHtml(c)}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row-3">
                <div class="form-group">
                    <label>Dosagem *</label>
                    <input type="text" name="item_dose_${id}" value="${App.escapeHtml(dose)}" required placeholder="Ex: 2.000 UI">
                </div>
                <div class="form-group">
                    <label>Frequência *</label>
                    <input type="text" name="item_freq_${id}" value="${App.escapeHtml(frequency)}" required placeholder="Ex: 1x ao dia">
                </div>
                <div class="form-group">
                    <label>Horário/Momento</label>
                    <input type="text" name="item_when_${id}" placeholder="Ex: Após o almoço">
                </div>
            </div>
            <div class="form-group">
                <label>Instruções específicas</label>
                <input type="text" name="item_instr_${id}" value="${App.escapeHtml(instructions)}" placeholder="Ex: Tomar com gordura para melhor absorção">
            </div>
        `;
        container.appendChild(div);
    },

    _collectItems() {
        const items = [];
        const container = document.getElementById('supplement-items-container');
        container.querySelectorAll('.supplement-item-row').forEach(row => {
            const id = row.id.replace('supp-item-', '');
            const form = document.getElementById('supplement-form');
            const name = form.elements['item_name_' + id]?.value?.trim();
            const category = form.elements['item_category_' + id]?.value;
            const dose = form.elements['item_dose_' + id]?.value?.trim();
            const frequency = form.elements['item_freq_' + id]?.value?.trim();
            const when = form.elements['item_when_' + id]?.value?.trim();
            const instructions = form.elements['item_instr_' + id]?.value?.trim();
            if (name && dose) {
                items.push({ name, category, dose, frequency, when, instructions });
            }
        });
        return items;
    },

    handleSave(e, prescriptionId) {
        e.preventDefault();
        const form = document.getElementById('supplement-form');
        const patientId = form.patientId.value;
        const generalNotes = form.generalNotes.value.trim();
        const duration = form.duration.value.trim();
        const items = this._collectItems();

        if (items.length === 0) {
            App.showToast('Adicione pelo menos um suplemento.', 'error');
            return;
        }

        const data = { patientId, items, generalNotes, duration };

        if (prescriptionId) {
            DB.updateSupplementPrescription(prescriptionId, data);
            App.showToast('Prescrição atualizada!', 'success');
        } else {
            DB.addSupplementPrescription(data);
            App.showToast('Prescrição salva!', 'success');
        }

        App.closeModal();
        App.renderPage('supplements');
    },

    openEditModal(id) {
        const prescription = DB.getSupplementPrescription(id);
        if (!prescription) return;
        const patients = DB.getPatients();
        this._itemCounter = 0;

        const html = `
            <form id="supplement-form" onsubmit="Supplements.handleSave(event, '${id}')">
                <div class="form-row">
                    <div class="form-group">
                        <label>Paciente *</label>
                        <select name="patientId" required>
                            <option value="">Selecione</option>
                            ${patients.map(p => `<option value="${p.id}" ${p.id === prescription.patientId ? 'selected' : ''}>${App.escapeHtml(p.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Adicionar suplemento comum</label>
                        <select id="quick-add-supplement" onchange="Supplements.quickAdd()">
                            <option value="">-- Selecione para adicionar --</option>
                            ${this.categories.map(cat => {
                                const items = this.commonSupplements.filter(s => s.category === cat);
                                if (items.length === 0) return '';
                                return `<optgroup label="${App.escapeHtml(cat)}">
                                    ${items.map((s, i) => `<option value="${i}">${App.escapeHtml(s.name)}</option>`).join('')}
                                </optgroup>`;
                            }).join('')}
                        </select>
                    </div>
                </div>

                <div id="supplement-items-container"></div>

                <button type="button" class="btn btn-outline mt-2 mb-2" onclick="Supplements.addItemRow()">
                    <span class="material-icons-outlined">add</span> Adicionar Item Manual
                </button>

                <div class="form-group">
                    <label>Orientações gerais</label>
                    <textarea name="generalNotes" rows="3" placeholder="Tomar com as refeições...">${App.escapeHtml(prescription.generalNotes || '')}</textarea>
                </div>

                <div class="form-group">
                    <label>Duração do tratamento</label>
                    <input type="text" name="duration" value="${App.escapeHtml(prescription.duration || '')}" placeholder="Ex: 90 dias">
                </div>

                <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:8px">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                </div>
            </form>
        `;
        App.openModal('Editar Prescrição', html, 'modal-xl');

        // Preencher itens existentes
        setTimeout(() => {
            prescription.items.forEach(item => {
                this.addItemRow(item.name, item.category, item.dose, item.frequency, item.instructions || '');
            });
        }, 50);
    },

    viewPrescription(id) {
        const prescription = DB.getSupplementPrescription(id);
        if (!prescription) return;
        const patient = DB.getPatient(prescription.patientId);
        const patientName = patient ? patient.name : 'Paciente removido';

        let html = `
            <div class="mb-3">
                <strong>${App.escapeHtml(patientName)}</strong>
                <span class="text-muted"> · ${App.formatDate(prescription.createdAt)}</span>
                ${prescription.duration ? `<span class="badge badge-info" style="margin-left:8px">Duração: ${App.escapeHtml(prescription.duration)}</span>` : ''}
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Suplemento</th>
                            <th>Categoria</th>
                            <th>Dosagem</th>
                            <th>Frequência</th>
                            <th>Horário</th>
                            <th>Instruções</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${prescription.items.map(item => `
                            <tr>
                                <td><strong>${App.escapeHtml(item.name)}</strong></td>
                                <td><span class="badge ${item.category === 'Fórmula Manipulada' ? 'badge-purple' : 'badge-info'}">${App.escapeHtml(item.category)}</span></td>
                                <td>${App.escapeHtml(item.dose)}</td>
                                <td>${App.escapeHtml(item.frequency || '-')}</td>
                                <td>${App.escapeHtml(item.when || '-')}</td>
                                <td class="text-small">${App.escapeHtml(item.instructions || '-')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            ${prescription.generalNotes ? `
                <div class="mt-3 card" style="background:var(--primary-light)">
                    <h4 style="margin-bottom:8px">Orientações Gerais</h4>
                    <p style="white-space:pre-wrap">${App.escapeHtml(prescription.generalNotes)}</p>
                </div>
            ` : ''}
        `;

        App.openModal('Prescrição de Suplementos', html, 'modal-xl');
    },

    confirmDelete(id) {
        App.openModal('Confirmar Exclusão', `
            <p>Tem certeza que deseja excluir esta prescrição?</p>
            <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
                <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-danger" onclick="Supplements.doDelete('${id}')">Excluir</button>
            </div>
        `);
    },

    doDelete(id) {
        DB.removeSupplementPrescription(id);
        App.closeModal();
        App.renderPage('supplements');
        App.showToast('Prescrição excluída', 'info');
    },

    openForPatient(patientId) {
        this.openNewModal(patientId);
    }
};
