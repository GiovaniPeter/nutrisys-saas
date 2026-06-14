/* ============================================
   NutreClin - Módulo de Anamnese e Questionários
   ============================================ */

const Anamnesis = {
    currentView: 'list',

    questionnaireTypes: [
        { value: 'health_history', label: 'Histórico de Saúde', icon: 'medical_information' },
        { value: 'metabolic_screening', label: 'Rastreamento Metabólico', icon: 'monitor_heart' },
        { value: 'recall_24h', label: 'Recordatório 24h', icon: 'schedule' },
        { value: 'intestinal_habits', label: 'Hábitos Intestinais', icon: 'gastroenterology' },
    ],

    // Templates de perguntas para cada tipo
    templates: {
        health_history: [
            { id: 'diseases', label: 'Doenças pré-existentes', type: 'textarea', placeholder: 'Diabetes, hipertensão, doenças cardíacas...' },
            { id: 'family_history', label: 'Histórico familiar de doenças', type: 'textarea', placeholder: 'Doenças na família...' },
            { id: 'medications', label: 'Medicamentos em uso', type: 'textarea', placeholder: 'Nome, dosagem e frequência...' },
            { id: 'allergies', label: 'Alergias alimentares', type: 'textarea', placeholder: 'Leite, ovo, glúten, frutos do mar...' },
            { id: 'intolerances', label: 'Intolerâncias alimentares', type: 'textarea', placeholder: 'Lactose, frutose...' },
            { id: 'surgeries', label: 'Cirurgias realizadas', type: 'textarea', placeholder: 'Tipo e data...' },
            { id: 'smoking', label: 'Tabagismo', type: 'select', options: ['Nunca fumou', 'Ex-fumante', 'Fumante'] },
            { id: 'alcohol', label: 'Consumo de álcool', type: 'select', options: ['Não consome', 'Social/eventual', 'Regular', 'Diário'] },
            { id: 'physical_activity', label: 'Pratica atividade física?', type: 'select', options: ['Não pratica', '1-2x/semana', '3-4x/semana', '5-6x/semana', 'Diariamente'] },
            { id: 'activity_type', label: 'Tipo de atividade', type: 'text', placeholder: 'Musculação, corrida, natação...' },
            { id: 'sleep_hours', label: 'Horas de sono por noite', type: 'number', min: 1, max: 20 },
            { id: 'sleep_quality', label: 'Qualidade do sono', type: 'select', options: ['Boa', 'Regular', 'Ruim', 'Insônia frequente'] },
            { id: 'water_intake', label: 'Consumo de água (litros/dia)', type: 'number', min: 0, max: 10, step: 0.1 },
            { id: 'stress_level', label: 'Nível de estresse', type: 'select', options: ['Baixo', 'Moderado', 'Alto', 'Muito alto'] },
            { id: 'additional_notes', label: 'Observações adicionais', type: 'textarea', placeholder: 'Outras informações relevantes...' },
        ],
        metabolic_screening: [
            { id: 'weight_gain', label: 'Ganho de peso nos últimos 6 meses', type: 'select', options: ['Não', 'Sim, até 3kg', 'Sim, 3-5kg', 'Sim, mais de 5kg'] },
            { id: 'weight_loss_difficulty', label: 'Dificuldade em perder peso', type: 'select', options: ['Não', 'Leve', 'Moderada', 'Alta'] },
            { id: 'fatigue', label: 'Fadiga ou cansaço frequente', type: 'select', options: ['Nunca', 'Às vezes', 'Frequente', 'Sempre'] },
            { id: 'cold_sensitivity', label: 'Sensibilidade ao frio', type: 'select', options: ['Não', 'Leve', 'Moderada', 'Intensa'] },
            { id: 'dry_skin', label: 'Pele seca ou cabelo quebradiço', type: 'select', options: ['Não', 'Leve', 'Moderado', 'Intenso'] },
            { id: 'mood_changes', label: 'Alterações de humor', type: 'select', options: ['Não', 'Leve', 'Moderado', 'Frequente'] },
            { id: 'sweet_craving', label: 'Desejo por doces', type: 'select', options: ['Nunca', 'Às vezes', 'Frequente', 'Constante'] },
            { id: 'bloating', label: 'Inchaço abdominal', type: 'select', options: ['Nunca', 'Às vezes', 'Frequente', 'Sempre'] },
            { id: 'hunger_pattern', label: 'Padrão de fome', type: 'select', options: ['Normal', 'Fome excessiva', 'Pouca fome', 'Fome nervosa'] },
            { id: 'menstrual_cycle', label: 'Ciclo menstrual (se aplicável)', type: 'select', options: ['Não se aplica', 'Regular', 'Irregular', 'Ausente'] },
            { id: 'thyroid_history', label: 'Histórico de doenças tireoidianas', type: 'select', options: ['Não', 'Hipotireoidismo', 'Hipertireoidismo', 'Nódulos', 'Outro'] },
            { id: 'insulin_resistance', label: 'Diagnóstico de resistência insulínica', type: 'select', options: ['Não', 'Sim', 'Não avaliado'] },
            { id: 'metabolic_notes', label: 'Observações', type: 'textarea', placeholder: 'Informações complementares...' },
        ],
        recall_24h: [
            { id: 'recall_date', label: 'Data do recordatório', type: 'date' },
            { id: 'breakfast_time', label: 'Horário do café da manhã', type: 'time' },
            { id: 'breakfast', label: 'Café da manhã - Alimentos e quantidades', type: 'textarea', placeholder: '2 fatias de pão integral, 1 xícara de café com leite...' },
            { id: 'morning_snack_time', label: 'Horário do lanche da manhã', type: 'time' },
            { id: 'morning_snack', label: 'Lanche da manhã', type: 'textarea', placeholder: '1 maçã, 5 castanhas...' },
            { id: 'lunch_time', label: 'Horário do almoço', type: 'time' },
            { id: 'lunch', label: 'Almoço - Alimentos e quantidades', type: 'textarea', placeholder: '4 colheres de arroz, 1 concha de feijão...' },
            { id: 'afternoon_snack_time', label: 'Horário do lanche da tarde', type: 'time' },
            { id: 'afternoon_snack', label: 'Lanche da tarde', type: 'textarea', placeholder: '1 iogurte natural, 30g de granola...' },
            { id: 'dinner_time', label: 'Horário do jantar', type: 'time' },
            { id: 'dinner', label: 'Jantar - Alimentos e quantidades', type: 'textarea', placeholder: 'Sopa de legumes, 1 fatia de pão...' },
            { id: 'supper_time', label: 'Horário da ceia', type: 'time' },
            { id: 'supper', label: 'Ceia', type: 'textarea', placeholder: '1 copo de leite, 1 banana...' },
            { id: 'extra_meals', label: 'Outros alimentos consumidos fora dos horários', type: 'textarea', placeholder: 'Beliscos, doces, bebidas...' },
            { id: 'recall_notes', label: 'Observações', type: 'textarea', placeholder: 'Dia atípico? Alguma refeição foi pulada?...' },
        ],
        intestinal_habits: [
            { id: 'frequency', label: 'Frequência de evacuação', type: 'select', options: ['1x ao dia', '2x ou mais ao dia', 'Dia sim/dia não', '2-3x por semana', 'Menos de 2x por semana'] },
            { id: 'consistency', label: 'Consistência das fezes (Escala de Bristol)', type: 'select', options: ['Tipo 1 - Caroços duros separados', 'Tipo 2 - Forma de salsicha com caroços', 'Tipo 3 - Salsicha com fissuras', 'Tipo 4 - Salsicha lisa e macia (ideal)', 'Tipo 5 - Pedaços macios com bordas definidas', 'Tipo 6 - Pedaços fofos, pastoso', 'Tipo 7 - Líquido, sem pedaços'] },
            { id: 'pain', label: 'Dor ou desconforto abdominal', type: 'select', options: ['Nunca', 'Raramente', 'Às vezes', 'Frequente', 'Sempre'] },
            { id: 'bloating_intestinal', label: 'Distensão abdominal/gases', type: 'select', options: ['Nunca', 'Raramente', 'Às vezes', 'Frequente', 'Sempre'] },
            { id: 'laxative_use', label: 'Uso de laxantes', type: 'select', options: ['Nunca', 'Raramente', 'Às vezes', 'Frequente'] },
            { id: 'blood_stool', label: 'Presença de sangue nas fezes', type: 'select', options: ['Não', 'Sim - raramente', 'Sim - frequente'] },
            { id: 'mucus_stool', label: 'Presença de muco nas fezes', type: 'select', options: ['Não', 'Sim - raramente', 'Sim - frequente'] },
            { id: 'urgency', label: 'Urgência para evacuar', type: 'select', options: ['Não', 'Às vezes', 'Frequente'] },
            { id: 'incomplete_evacuation', label: 'Sensação de evacuação incompleta', type: 'select', options: ['Não', 'Às vezes', 'Frequente', 'Sempre'] },
            { id: 'fiber_intake', label: 'Consumo de fibras', type: 'select', options: ['Adequado', 'Insuficiente', 'Excessivo', 'Não sabe'] },
            { id: 'probiotic_use', label: 'Uso de probióticos', type: 'select', options: ['Não', 'Sim - suplemento', 'Sim - alimentos fermentados', 'Ambos'] },
            { id: 'intestinal_notes', label: 'Observações', type: 'textarea', placeholder: 'Diagnósticos prévios, síndrome do intestino irritável...' },
        ],
    },

    render() {
        return this.renderList();
    },

    renderList() {
        const patients = DB.getPatients();
        const records = DB.getAnamnesisRecords();

        return `
            <div class="search-bar">
                <div class="search-input">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" id="search-anamnesis" placeholder="Buscar por paciente..." oninput="Anamnesis.filterList()">
                </div>
                <button class="btn btn-primary" onclick="Anamnesis.openNewModal()">
                    <span class="material-icons-outlined">assignment</span> Nova Anamnese
                </button>
            </div>

            <div class="card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Paciente</th>
                                <th>Tipo</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="anamnesis-table-body">
                            ${records.length > 0 ? records.map(r => {
                                const patient = DB.getPatient(r.patientId);
                                const patientName = patient ? patient.name : 'Paciente removido';
                                const typeObj = this.questionnaireTypes.find(t => t.value === r.type);
                                return `
                                    <tr data-anamnesis-row data-name="${App.escapeHtml(patientName.toLowerCase())}">
                                        <td><strong>${App.escapeHtml(patientName)}</strong></td>
                                        <td><span class="badge badge-info">${typeObj ? typeObj.label : r.type}</span></td>
                                        <td>${App.formatDate(r.createdAt)}</td>
                                        <td>
                                            <div class="actions">
                                                <button class="btn-icon" title="Ver" onclick="Anamnesis.viewRecord('${r.id}')">
                                                    <span class="material-icons-outlined">visibility</span>
                                                </button>
                                                <button class="btn-icon" title="Editar" onclick="Anamnesis.openEditModal('${r.id}')">
                                                    <span class="material-icons-outlined">edit</span>
                                                </button>
                                                <button class="btn-icon" title="Excluir" onclick="Anamnesis.confirmDelete('${r.id}')">
                                                    <span class="material-icons-outlined">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('') : `
                                <tr><td colspan="4" class="text-center text-muted" style="padding:40px">Nenhuma anamnese registrada</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    filterList() {
        const query = document.getElementById('search-anamnesis').value.toLowerCase();
        document.querySelectorAll('[data-anamnesis-row]').forEach(row => {
            const name = row.getAttribute('data-name');
            row.style.display = name.includes(query) ? '' : 'none';
        });
    },

    // ---------- MODAL NOVO ----------
    openNewModal(patientId) {
        const patients = DB.getPatients();
        if (patients.length === 0) {
            App.showToast('Cadastre um paciente primeiro.', 'error');
            return;
        }

        const html = `
            <form id="anamnesis-type-form" onsubmit="Anamnesis.openQuestionnaire(event)">
                <div class="form-group">
                    <label>Paciente *</label>
                    <select name="patientId" required>
                        <option value="">Selecione um paciente</option>
                        ${patients.map(p => `<option value="${p.id}" ${p.id === patientId ? 'selected' : ''}>${App.escapeHtml(p.name)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Tipo de Questionário *</label>
                    <div class="questionnaire-type-grid">
                        ${this.questionnaireTypes.map(t => `
                            <label class="questionnaire-type-option">
                                <input type="radio" name="type" value="${t.value}" required>
                                <div class="questionnaire-type-card">
                                    <span class="material-icons-outlined">${t.icon}</span>
                                    <span>${t.label}</span>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:8px">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Prosseguir</button>
                </div>
            </form>
        `;
        App.openModal('Nova Anamnese', html);
    },

    openQuestionnaire(e) {
        e.preventDefault();
        const form = document.getElementById('anamnesis-type-form');
        const patientId = form.patientId.value;
        const type = form.type.value;
        this._renderQuestionnaireForm(patientId, type);
    },

    _renderQuestionnaireForm(patientId, type, existingData = {}, recordId = '') {
        const template = this.templates[type];
        if (!template) return;
        const typeObj = this.questionnaireTypes.find(t => t.value === type);
        const answers = existingData.answers || {};

        let fieldsHtml = template.map(q => {
            const val = answers[q.id] || '';
            switch (q.type) {
                case 'textarea':
                    return `
                        <div class="form-group">
                            <label>${App.escapeHtml(q.label)}</label>
                            <textarea name="${q.id}" rows="3" placeholder="${App.escapeHtml(q.placeholder || '')}">${App.escapeHtml(val)}</textarea>
                        </div>`;
                case 'select':
                    return `
                        <div class="form-group">
                            <label>${App.escapeHtml(q.label)}</label>
                            <select name="${q.id}">
                                <option value="">Selecione</option>
                                ${q.options.map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${App.escapeHtml(o)}</option>`).join('')}
                            </select>
                        </div>`;
                case 'number':
                    return `
                        <div class="form-group">
                            <label>${App.escapeHtml(q.label)}</label>
                            <input type="number" name="${q.id}" value="${App.escapeHtml(String(val))}" min="${q.min || ''}" max="${q.max || ''}" step="${q.step || '1'}">
                        </div>`;
                case 'date':
                    return `
                        <div class="form-group">
                            <label>${App.escapeHtml(q.label)}</label>
                            <input type="date" name="${q.id}" value="${App.escapeHtml(val)}">
                        </div>`;
                case 'time':
                    return `
                        <div class="form-group">
                            <label>${App.escapeHtml(q.label)}</label>
                            <input type="time" name="${q.id}" value="${App.escapeHtml(val)}">
                        </div>`;
                default:
                    return `
                        <div class="form-group">
                            <label>${App.escapeHtml(q.label)}</label>
                            <input type="text" name="${q.id}" value="${App.escapeHtml(val)}" placeholder="${App.escapeHtml(q.placeholder || '')}">
                        </div>`;
            }
        }).join('');

        const html = `
            <form id="anamnesis-form" onsubmit="Anamnesis.handleSave(event, '${patientId}', '${type}', '${recordId}')">
                <div class="anamnesis-form-scroll">
                    ${fieldsHtml}
                </div>
                <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:8px">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${recordId ? 'Salvar Alterações' : 'Salvar Anamnese'}</button>
                </div>
            </form>
        `;
        App.openModal((typeObj ? typeObj.label : type), html, 'modal-lg');
    },

    handleSave(e, patientId, type, recordId) {
        e.preventDefault();
        const form = document.getElementById('anamnesis-form');
        const template = this.templates[type];
        const answers = {};
        template.forEach(q => {
            const el = form.elements[q.id];
            if (el) answers[q.id] = el.value;
        });

        const data = { patientId, type, answers };

        if (recordId) {
            DB.updateAnamnesisRecord(recordId, data);
            App.showToast('Anamnese atualizada!', 'success');
        } else {
            DB.addAnamnesisRecord(data);
            App.showToast('Anamnese registrada!', 'success');
        }

        App.closeModal();
        App.renderPage('anamnesis');
    },

    openEditModal(id) {
        const record = DB.getAnamnesisRecord(id);
        if (!record) return;
        this._renderQuestionnaireForm(record.patientId, record.type, record, id);
    },

    viewRecord(id) {
        const record = DB.getAnamnesisRecord(id);
        if (!record) return;
        const patient = DB.getPatient(record.patientId);
        const patientName = patient ? patient.name : 'Paciente removido';
        const typeObj = this.questionnaireTypes.find(t => t.value === record.type);
        const template = this.templates[record.type];
        const answers = record.answers || {};

        let detailHtml = `
            <div class="mb-3">
                <span class="badge badge-info">${typeObj ? typeObj.label : record.type}</span>
                <span class="text-muted text-small" style="margin-left:8px">Paciente: <strong>${App.escapeHtml(patientName)}</strong> · ${App.formatDate(record.createdAt)}</span>
            </div>
            <div class="anamnesis-detail-list">
        `;

        template.forEach(q => {
            const val = answers[q.id];
            if (val) {
                detailHtml += `
                    <div class="anamnesis-detail-item">
                        <label>${App.escapeHtml(q.label)}</label>
                        <p>${App.escapeHtml(val)}</p>
                    </div>
                `;
            }
        });

        detailHtml += '</div>';
        App.openModal('Anamnese - ' + (typeObj ? typeObj.label : ''), detailHtml, 'modal-lg');
    },

    confirmDelete(id) {
        App.openModal('Confirmar Exclusão', `
            <p>Tem certeza que deseja excluir esta anamnese?</p>
            <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
                <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-danger" onclick="Anamnesis.doDelete('${id}')">Excluir</button>
            </div>
        `);
    },

    doDelete(id) {
        DB.removeAnamnesisRecord(id);
        App.closeModal();
        App.renderPage('anamnesis');
        App.showToast('Anamnese excluída', 'info');
    },

    // Abrir direto para um paciente
    openForPatient(patientId) {
        this.openNewModal(patientId);
    }
};
