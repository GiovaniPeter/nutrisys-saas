/* ============================================
   NutreClin - Diário Alimentar
   Tela do nutricionista para revisar e avaliar
   registros alimentares dos pacientes
   ============================================ */

const FoodDiary = {
    filterPatient: '',
    filterStatus: 'all',

    render() {
        const patients = DB.getPatients();
        const entries = this._getFilteredEntries();

        return `
            <div class="page-header mb-3">
                <div>
                    <h3>Diário Alimentar</h3>
                    <p class="text-muted">Acompanhe e avalie as refeições dos pacientes</p>
                </div>
            </div>

            <div class="toolbar mb-3">
                <div class="flex items-center gap-2 flex-wrap">
                    <select id="diary-filter-patient" onchange="FoodDiary.applyFilter()" class="btn btn-outline" style="min-width:180px">
                        <option value="">Todos os pacientes</option>
                        ${patients.map(p => `<option value="${p.id}" ${this.filterPatient === p.id ? 'selected' : ''}>${App.escapeHtml(p.name)}</option>`).join('')}
                    </select>
                    <select id="diary-filter-status" onchange="FoodDiary.applyFilter()" class="btn btn-outline">
                        <option value="all" ${this.filterStatus === 'all' ? 'selected' : ''}>Todos</option>
                        <option value="pending" ${this.filterStatus === 'pending' ? 'selected' : ''}>Pendentes</option>
                        <option value="aprovado" ${this.filterStatus === 'aprovado' ? 'selected' : ''}>Aprovados</option>
                        <option value="ajustar" ${this.filterStatus === 'ajustar' ? 'selected' : ''}>Com ajustes</option>
                    </select>
                    <span class="badge badge-info">${entries.length} registro(s)</span>
                </div>
            </div>

            ${entries.length ? `<div class="diary-grid">
                ${entries.map(e => this._renderCard(e, patients)).join('')}
            </div>` : `
                <div class="empty-state">
                    <span class="material-icons-outlined">edit_note</span>
                    <p>Nenhum registro encontrado</p>
                    <p class="text-small text-muted">Os pacientes poderão registrar refeições pelo Portal do Paciente</p>
                </div>
            `}
        `;
    },

    _getFilteredEntries() {
        let entries = DB.getFoodDiaryEntries()
            .sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));

        if (this.filterPatient) entries = entries.filter(e => e.patientId === this.filterPatient);
        if (this.filterStatus === 'pending') entries = entries.filter(e => !e.feedback);
        else if (this.filterStatus !== 'all') entries = entries.filter(e => e.feedback === this.filterStatus);

        return entries;
    },

    applyFilter() {
        this.filterPatient = document.getElementById('diary-filter-patient').value;
        this.filterStatus = document.getElementById('diary-filter-status').value;
        App.renderPage('diario');
    },

    _renderCard(entry, patients) {
        const p = patients.find(pt => pt.id === entry.patientId);
        const statusMap = {
            'aprovado': { icon: 'check_circle', cls: 'success', label: 'Aprovado' },
            'ajustar': { icon: 'warning', cls: 'warning', label: 'Ajustes' }
        };
        const st = entry.feedback ? statusMap[entry.feedback] : { icon: 'pending', cls: 'muted', label: 'Pendente' };

        return `
            <div class="diary-card">
                <div class="diary-card-header">
                    <div class="flex items-center gap-2">
                        <div class="avatar-sm">${p ? p.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : '?'}</div>
                        <div>
                            <strong>${p ? App.escapeHtml(p.name) : 'Paciente'}</strong>
                            <span class="text-small text-muted" style="display:block">${App.escapeHtml(entry.mealType || 'Refeição')} · ${App.formatDate(entry.date)}</span>
                        </div>
                    </div>
                    <span class="badge badge-${st.cls}">
                        <span class="material-icons-outlined" style="font-size:14px;vertical-align:middle">${st.icon}</span> ${st.label}
                    </span>
                </div>
                <p class="diary-description">${App.escapeHtml(entry.description || '')}</p>
                ${entry.photo ? `<img src="${entry.photo}" class="diary-photo" alt="Foto da refeição" onclick="FoodDiary.viewPhoto('${entry.id}')">` : ''}
                <div class="diary-card-actions">
                    <button class="btn btn-sm btn-success" onclick="FoodDiary.evaluate('${entry.id}', 'aprovado')" title="Aprovar">
                        <span class="material-icons-outlined">thumb_up</span> Aprovar
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="FoodDiary.openFeedback('${entry.id}')" title="Sugerir ajustes">
                        <span class="material-icons-outlined">rate_review</span> Avaliar
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="FoodDiary.removeEntry('${entry.id}')" title="Remover">
                        <span class="material-icons-outlined">delete</span>
                    </button>
                </div>
                ${entry.feedbackNote ? `<div class="diary-feedback-note"><span class="material-icons-outlined" style="font-size:16px">comment</span> ${App.escapeHtml(entry.feedbackNote)}</div>` : ''}
            </div>
        `;
    },

    evaluate(id, status) {
        const entry = DB.getById(DB.KEYS.FOOD_DIARY, id);
        if (!entry) return;
        entry.feedback = status;
        entry.feedbackAt = new Date().toISOString();
        DB.updateFoodDiaryEntry(entry);
        App.showToast('Refeição aprovada!', 'success');
        App.renderPage('diario');
    },

    openFeedback(id) {
        const entry = DB.getById(DB.KEYS.FOOD_DIARY, id);
        if (!entry) return;

        App.openModal('Avaliar Refeição', `
            <form id="feedback-form" onsubmit="FoodDiary.saveFeedback(event, '${id}')">
                <div class="form-group">
                    <label>Resultado</label>
                    <select name="status">
                        <option value="aprovado" ${entry.feedback === 'aprovado' ? 'selected' : ''}>✅ Aprovado</option>
                        <option value="ajustar" ${entry.feedback === 'ajustar' ? 'selected' : ''}>⚠️ Precisa de ajustes</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Observação para o paciente</label>
                    <textarea name="note" rows="3" placeholder="Ex: Tente adicionar mais vegetais ao almoço..." maxlength="500">${App.escapeHtml(entry.feedbackNote || '')}</textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Enviar Avaliação</button>
                </div>
            </form>
        `);
    },

    saveFeedback(e, id) {
        e.preventDefault();
        const f = document.getElementById('feedback-form');
        const entry = DB.getById(DB.KEYS.FOOD_DIARY, id);
        if (!entry) return;
        entry.feedback = f.status.value;
        entry.feedbackNote = f.note.value.trim();
        entry.feedbackAt = new Date().toISOString();
        DB.updateFoodDiaryEntry(entry);
        App.closeModal();
        App.showToast('Avaliação enviada!', 'success');
        App.renderPage('diario');
    },

    removeEntry(id) {
        if (!confirm('Remover este registro do diário?')) return;
        DB.removeFoodDiaryEntry(id);
        App.showToast('Registro removido', 'success');
        App.renderPage('diario');
    },

    viewPhoto(id) {
        const entry = DB.getById(DB.KEYS.FOOD_DIARY, id);
        if (!entry || !entry.photo) return;
        App.openModal('Foto da Refeição', `
            <div style="text-align:center">
                <img src="${entry.photo}" style="max-width:100%;max-height:70vh;border-radius:8px">
                <p class="mt-2 text-muted">${App.escapeHtml(entry.mealType || '')} · ${App.formatDate(entry.date)}</p>
            </div>
        `);
    }
};
