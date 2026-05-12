/* ============================================
   NutriSys - Hidratação & Metas
   Controle de água e metas dos pacientes
   ============================================ */

const Hydration = {
    selectedPatient: '',

    render() {
        const patients = DB.getPatients();
        if (!this.selectedPatient && patients.length) this.selectedPatient = patients[0].id;
        const p = this.selectedPatient ? DB.getPatient(this.selectedPatient) : null;

        return `
            <div class="page-header mb-3">
                <div>
                    <h3>Hidratação & Metas</h3>
                    <p class="text-muted">Acompanhe a hidratação e os objetivos dos pacientes</p>
                </div>
                <select id="hydra-patient" class="btn btn-outline" onchange="Hydration.changePatient(this.value)" style="min-width:200px">
                    ${patients.map(pt => `<option value="${pt.id}" ${pt.id === this.selectedPatient ? 'selected' : ''}>${App.escapeHtml(pt.name)}</option>`).join('')}
                </select>
            </div>

            ${p ? this._renderContent(p) : '<div class="empty-state"><span class="material-icons-outlined">person_off</span><p>Nenhum paciente</p></div>'}
        `;
    },

    changePatient(id) {
        this.selectedPatient = id;
        App.renderPage('hidratacao');
    },

    _renderContent(p) {
        const today = new Date().toISOString().split('T')[0];
        const logs = DB.getHydrationLogs().filter(h => h.patientId === p.id && h.date === today);
        const total = logs.reduce((s, h) => s + (h.amount || 0), 0);
        const target = p.weight ? Math.round(p.weight * 35) : 2000;
        const pct = Math.min(100, Math.round((total / target) * 100));

        // Histórico dos últimos 7 dias
        const hist = this._getHistory(p.id, 7);
        const goals = DB.getPatientGoals().filter(g => g.patientId === p.id);

        return `
            <div class="hydra-grid">
                <!-- Painel água -->
                <div class="hydra-panel">
                    <div class="hydra-panel-header">
                        <span class="material-icons-outlined">water_drop</span>
                        <h4>Hidratação Hoje</h4>
                    </div>
                    <div class="hydra-circle-container">
                        <svg viewBox="0 0 140 140" width="180" height="180">
                            <circle cx="70" cy="70" r="60" fill="none" stroke="#e0e0e0" stroke-width="10"/>
                            <circle cx="70" cy="70" r="60" fill="none" stroke="#3498db" stroke-width="10"
                                stroke-dasharray="${2*Math.PI*60}" stroke-dashoffset="${2*Math.PI*60*(1-pct/100)}"
                                transform="rotate(-90 70 70)" stroke-linecap="round"/>
                            <text x="70" y="60" text-anchor="middle" font-size="24" font-weight="700" fill="#3498db">${total}ml</text>
                            <text x="70" y="82" text-anchor="middle" font-size="12" fill="#636e72">${pct}% da meta</text>
                        </svg>
                        <p class="text-small text-muted mt-1">Meta: ${target}ml/dia (${p.weight || '?'}kg × 35ml)</p>
                    </div>
                    <div class="hydra-buttons">
                        <button class="hydra-btn" onclick="Hydration.addWater(150)">🥤 150ml</button>
                        <button class="hydra-btn" onclick="Hydration.addWater(250)">🥛 250ml</button>
                        <button class="hydra-btn" onclick="Hydration.addWater(500)">🧴 500ml</button>
                        <button class="hydra-btn" onclick="Hydration.addCustomWater()">✏️ Outro</button>
                    </div>

                    <!-- Histórico -->
                    <div class="hydra-history mt-3">
                        <strong class="text-small">Últimos 7 dias</strong>
                        <div class="hydra-bars">
                            ${hist.map(d => {
                                const dpct = Math.min(100, Math.round((d.total / target) * 100));
                                return `<div class="hydra-bar-col">
                                    <div class="hydra-bar-track"><div class="hydra-bar-fill" style="height:${dpct}%"></div></div>
                                    <span class="text-small">${d.label}</span>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>

                    ${logs.length ? `<div class="mt-2">
                        <strong class="text-small">Registros de hoje</strong>
                        <table class="table mt-1">
                            <thead><tr><th>Horário</th><th>Quantidade</th><th></th></tr></thead>
                            <tbody>${logs.map(l => `<tr>
                                <td>${l.time || '-'}</td>
                                <td>${l.amount}ml</td>
                                <td><button class="btn-icon text-danger" onclick="Hydration.removeLog('${l.id}')"><span class="material-icons-outlined">close</span></button></td>
                            </tr>`).join('')}</tbody>
                        </table>
                    </div>` : ''}
                </div>

                <!-- Painel metas -->
                <div class="hydra-panel">
                    <div class="hydra-panel-header">
                        <span class="material-icons-outlined">flag</span>
                        <h4>Metas do Paciente</h4>
                        <button class="btn btn-sm btn-primary" style="margin-left:auto" onclick="Hydration.openGoalForm()">
                            <span class="material-icons-outlined">add</span> Nova Meta
                        </button>
                    </div>

                    ${goals.length ? goals.map(g => {
                        const gpct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
                        return `
                        <div class="goal-card">
                            <div class="flex items-center justify-between">
                                <strong>${App.escapeHtml(g.title)}</strong>
                                <div class="flex items-center gap-1">
                                    <span class="badge ${gpct >= 100 ? 'badge-success' : 'badge-info'}">${gpct}%</span>
                                    <button class="btn-icon" onclick="Hydration.editGoal('${g.id}')" title="Editar"><span class="material-icons-outlined">edit</span></button>
                                    <button class="btn-icon text-danger" onclick="Hydration.removeGoal('${g.id}')" title="Remover"><span class="material-icons-outlined">delete</span></button>
                                </div>
                            </div>
                            <div class="goal-progress mt-1">
                                <div class="goal-progress-fill" style="width:${gpct}%;background:${gpct >= 100 ? 'var(--success)' : 'var(--primary)'}"></div>
                            </div>
                            <div class="flex items-center justify-between mt-1">
                                <span class="text-small text-muted">${g.current}/${g.target} ${App.escapeHtml(g.unit || '')}</span>
                                <div class="flex gap-1">
                                    <button class="btn btn-sm btn-outline" onclick="Hydration.incrementGoal('${g.id}', -1)" ${g.current <= 0 ? 'disabled' : ''}>−</button>
                                    <button class="btn btn-sm btn-primary" onclick="Hydration.incrementGoal('${g.id}', 1)">+</button>
                                </div>
                            </div>
                        </div>`;
                    }).join('') : `
                        <div class="empty-state" style="padding:40px 20px">
                            <span class="material-icons-outlined">emoji_events</span>
                            <p>Nenhuma meta definida</p>
                            <p class="text-small text-muted">Crie metas para motivar o paciente</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    _getHistory(patientId, days) {
        const result = [];
        const allLogs = DB.getHydrationLogs().filter(h => h.patientId === patientId);
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const ds = d.toISOString().split('T')[0];
            const dayLogs = allLogs.filter(h => h.date === ds);
            const total = dayLogs.reduce((s, h) => s + (h.amount || 0), 0);
            const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            result.push({ date: ds, total, label: i === 0 ? 'Hoje' : weekday });
        }
        return result;
    },

    addWater(ml) {
        if (!this.selectedPatient) return;
        DB.addHydrationLog({
            patientId: this.selectedPatient,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            amount: ml
        });
        App.showToast(`+${ml}ml registrado!`, 'success');
        App.renderPage('hidratacao');
    },

    addCustomWater() {
        App.openModal('Registrar Água', `
            <form onsubmit="Hydration.saveCustomWater(event)">
                <div class="form-group">
                    <label>Quantidade (ml)</label>
                    <input type="number" name="amount" min="10" max="2000" value="200" required>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Registrar</button>
                </div>
            </form>
        `);
    },

    saveCustomWater(e) {
        e.preventDefault();
        const amount = parseInt(e.target.amount.value);
        if (amount > 0) { App.closeModal(); this.addWater(amount); }
    },

    removeLog(id) {
        const logs = DB.getHydrationLogs().filter(l => l.id !== id);
        localStorage.setItem(DB.KEYS.HYDRATION_LOGS, JSON.stringify(logs));
        App.showToast('Registro removido', 'success');
        App.renderPage('hidratacao');
    },

    openGoalForm(existing) {
        const g = existing || { title: '', target: 3, current: 0, unit: '' };
        App.openModal(existing ? 'Editar Meta' : 'Nova Meta', `
            <form id="goal-form-hydra" onsubmit="Hydration.saveGoal(event, '${existing ? existing.id : ''}')">
                <div class="form-group">
                    <label>Título *</label>
                    <input type="text" name="title" required value="${App.escapeHtml(g.title)}" placeholder="Ex: Exercícios na semana" maxlength="100">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Meta</label>
                        <input type="number" name="target" min="1" required value="${g.target}">
                    </div>
                    <div class="form-group">
                        <label>Progresso atual</label>
                        <input type="number" name="current" min="0" value="${g.current}">
                    </div>
                    <div class="form-group">
                        <label>Unidade</label>
                        <input type="text" name="unit" placeholder="vezes, litros, kg..." value="${App.escapeHtml(g.unit || '')}" maxlength="30">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${existing ? 'Salvar' : 'Criar Meta'}</button>
                </div>
            </form>
        `);
    },

    saveGoal(e, id) {
        e.preventDefault();
        const f = document.getElementById('goal-form-hydra');
        if (id) {
            const g = DB.getById(DB.KEYS.PATIENT_GOALS, id);
            if (g) {
                g.title = f.title.value.trim();
                g.target = parseInt(f.target.value);
                g.current = parseInt(f.current.value);
                g.unit = f.unit.value.trim();
                DB.updatePatientGoal(g);
            }
        } else {
            DB.addPatientGoal({
                patientId: this.selectedPatient,
                title: f.title.value.trim(),
                target: parseInt(f.target.value),
                current: parseInt(f.current.value),
                unit: f.unit.value.trim()
            });
        }
        App.closeModal();
        App.showToast(id ? 'Meta atualizada!' : 'Meta criada!', 'success');
        App.renderPage('hidratacao');
    },

    editGoal(id) {
        const g = DB.getById(DB.KEYS.PATIENT_GOALS, id);
        if (g) this.openGoalForm(g);
    },

    incrementGoal(id, delta) {
        const g = DB.getById(DB.KEYS.PATIENT_GOALS, id);
        if (!g) return;
        g.current = Math.max(0, g.current + delta);
        DB.updatePatientGoal(g);
        App.renderPage('hidratacao');
    },

    removeGoal(id) {
        if (!confirm('Remover esta meta?')) return;
        DB.removePatientGoal(id);
        App.showToast('Meta removida', 'success');
        App.renderPage('hidratacao');
    }
};
