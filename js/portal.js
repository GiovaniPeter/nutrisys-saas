/* ============================================
   NutriSys - Portal do Paciente
   Ambiente onde o paciente visualiza dieta, diário,
   metas, hidratação, chat
   ============================================ */

const PatientPortal = {
    currentTab: 'dieta',
    selectedPatientId: null,

    render() {
        const patients = DB.getPatients();
        if (!this.selectedPatientId && patients.length) {
            this.selectedPatientId = patients[0].id;
        }
        const p = this.selectedPatientId ? DB.getPatient(this.selectedPatientId) : null;

        return `
            <div class="portal-header mb-3">
                <div class="flex items-center gap-2">
                    <span class="material-icons-outlined" style="font-size:28px;color:var(--primary)">phone_iphone</span>
                    <div>
                        <h3 style="margin:0">Portal do Paciente</h3>
                        <p class="text-small text-muted">Visualize como o paciente vê pelo celular</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <select id="portal-patient" class="btn btn-outline" onchange="PatientPortal.changePatient(this.value)" style="min-width:200px">
                        ${patients.map(pt => `<option value="${pt.id}" ${pt.id === this.selectedPatientId ? 'selected' : ''}>${App.escapeHtml(pt.name)}</option>`).join('')}
                    </select>
                    <button class="btn btn-sm btn-primary" onclick="PatientPortal.openPortalWindow()">
                        <span class="material-icons-outlined">open_in_new</span> Abrir Portal
                    </button>
                </div>
            </div>

            ${p ? this._renderPreview(p) : '<div class="empty-state"><span class="material-icons-outlined">person_off</span><p>Nenhum paciente selecionado</p></div>'}
        `;
    },

    changePatient(id) {
        this.selectedPatientId = id;
        App.renderPage('portal');
    },

    _renderPreview(p) {
        const tabs = [
            { k: 'dieta', icon: 'restaurant_menu', l: 'Dieta' },
            { k: 'diario', icon: 'edit_note', l: 'Diário' },
            { k: 'metas', icon: 'flag', l: 'Metas' },
            { k: 'agua', icon: 'water_drop', l: 'Água' },
            { k: 'chat', icon: 'chat', l: 'Chat' },
        ];

        return `
        <div class="portal-phone-frame">
            <div class="portal-phone-status">
                <span>9:41</span>
                <div class="portal-phone-notch"></div>
                <span class="material-icons-outlined" style="font-size:14px">signal_cellular_alt</span>
            </div>
            <div class="portal-phone-header">
                <div class="portal-avatar">${p.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
                <div>
                    <strong>${App.escapeHtml(p.name)}</strong>
                    <span class="text-small" style="display:block;opacity:.7">${App.escapeHtml(p.goal || 'Paciente')}</span>
                </div>
            </div>
            <div class="portal-tabs">
                ${tabs.map(t => `<button class="portal-tab ${this.currentTab===t.k?'active':''}" onclick="PatientPortal.setTab('${t.k}')">
                    <span class="material-icons-outlined">${t.icon}</span>${t.l}
                </button>`).join('')}
            </div>
            <div class="portal-phone-body" id="portal-body">
                ${this._renderTab(p)}
            </div>
        </div>`;
    },

    setTab(tab) {
        this.currentTab = tab;
        const body = document.getElementById('portal-body');
        if (body) body.innerHTML = this._renderTab(DB.getPatient(this.selectedPatientId));
        document.querySelectorAll('.portal-tab').forEach(t => {
            t.classList.toggle('active', t.textContent.trim().toLowerCase().includes(tab === 'agua' ? 'água' : tab));
        });
        // re-highlight active tab
        document.querySelectorAll('.portal-tab').forEach((t, i) => {
            const tabs = ['dieta','diario','metas','agua','chat'];
            t.classList.toggle('active', tabs[i] === tab);
        });
    },

    _renderTab(p) {
        if (!p) return '';
        switch (this.currentTab) {
            case 'dieta': return this._tabDieta(p);
            case 'diario': return this._tabDiario(p);
            case 'metas': return this._tabMetas(p);
            case 'agua': return this._tabAgua(p);
            case 'chat': return this._tabChat(p);
            default: return '';
        }
    },

    /* ---- ABA DIETA ---- */
    _tabDieta(p) {
        const plans = DB.getMealPlans().filter(m => m.patientId === p.id);
        if (!plans.length) return '<div class="portal-empty"><span class="material-icons-outlined">restaurant</span><p>Nenhum cardápio disponível ainda</p></div>';

        const plan = plans[plans.length - 1]; // mais recente
        const meals = plan.meals || [];
        const MEAL_LABELS = {
            'cafe': 'Café da Manhã', 'lanche_manha': 'Lanche da Manhã',
            'almoco': 'Almoço', 'lanche_tarde': 'Lanche da Tarde',
            'jantar': 'Jantar', 'ceia': 'Ceia'
        };

        return `
            <div class="portal-card">
                <strong>${App.escapeHtml(plan.name)}</strong>
                <span class="text-small text-muted">${App.formatDate(plan.createdAt)}</span>
            </div>
            ${meals.map(m => `
                <div class="portal-card">
                    <div class="portal-meal-header">
                        <span class="material-icons-outlined" style="font-size:18px;color:var(--primary)">schedule</span>
                        <strong>${MEAL_LABELS[m.type] || m.type}</strong>
                    </div>
                    ${(m.foods || []).map(f => {
                        const food = DB.getById(DB.KEYS.FOODS, f.foodId);
                        return food ? `<div class="portal-food-item">
                            <span>${App.escapeHtml(food.name)}</span>
                            <span class="text-muted">${f.quantity}x · ${Math.round(food.calories * f.quantity)} kcal</span>
                        </div>` : '';
                    }).join('')}
                </div>
            `).join('')}
        `;
    },

    /* ---- ABA DIÁRIO ---- */
    _tabDiario(p) {
        const entries = DB.getFoodDiaryEntries().filter(e => e.patientId === p.id)
            .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

        return `
            <button class="portal-btn-add" onclick="PatientPortal.openDiaryEntry()">
                <span class="material-icons-outlined">add_circle</span> Registrar refeição
            </button>
            ${entries.length ? entries.slice(0, 15).map(e => `
                <div class="portal-card">
                    <div class="flex items-center justify-between">
                        <strong>${App.escapeHtml(e.mealType || 'Refeição')}</strong>
                        <span class="text-small text-muted">${App.formatDate(e.date)} ${e.time || ''}</span>
                    </div>
                    <p class="text-small" style="margin:6px 0">${App.escapeHtml(e.description || '')}</p>
                    ${e.photo ? `<img src="${e.photo}" class="portal-diary-photo" alt="Foto">` : ''}
                    ${e.feedback ? `<div class="portal-feedback ${e.feedback === 'aprovado' ? 'ok' : 'alert'}">
                        <span class="material-icons-outlined">${e.feedback === 'aprovado' ? 'check_circle' : 'warning'}</span>
                        ${e.feedback === 'aprovado' ? 'Aprovado pelo nutricionista' : 'Nutricionista recomenda ajustes'}
                        ${e.feedbackNote ? '<br><span class="text-small">'+App.escapeHtml(e.feedbackNote)+'</span>' : ''}
                    </div>` : '<span class="text-small text-muted">Aguardando avaliação</span>'}
                </div>
            `).join('') : '<div class="portal-empty"><span class="material-icons-outlined">edit_note</span><p>Nenhum registro no diário</p></div>'}
        `;
    },

    /* ---- ABA METAS ---- */
    _tabMetas(p) {
        const goals = DB.getPatientGoals().filter(g => g.patientId === p.id);
        return `
            <button class="portal-btn-add" onclick="PatientPortal.openGoalForm()">
                <span class="material-icons-outlined">add_circle</span> Nova meta
            </button>
            ${goals.length ? goals.map(g => {
                const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
                return `<div class="portal-card">
                    <div class="flex items-center justify-between">
                        <strong>${App.escapeHtml(g.title)}</strong>
                        <span class="badge ${pct >= 100 ? 'badge-success' : 'badge-info'}">${pct}%</span>
                    </div>
                    <div class="portal-progress-bar mt-1">
                        <div class="portal-progress-fill" style="width:${pct}%;background:${pct >= 100 ? 'var(--success)' : 'var(--primary)'}"></div>
                    </div>
                    <p class="text-small text-muted mt-1">${g.current}/${g.target} ${App.escapeHtml(g.unit || '')}</p>
                </div>`;
            }).join('') : '<div class="portal-empty"><span class="material-icons-outlined">flag</span><p>Nenhuma meta definida</p></div>'}
        `;
    },

    /* ---- ABA ÁGUA ---- */
    _tabAgua(p) {
        const today = new Date().toISOString().split('T')[0];
        const logs = DB.getHydrationLogs().filter(h => h.patientId === p.id && h.date === today);
        const total = logs.reduce((s, h) => s + (h.amount || 0), 0);
        const target = p.weight ? Math.round(p.weight * 35) : 2000;
        const pct = Math.min(100, Math.round((total / target) * 100));
        const glasses = Math.round(total / 250);

        return `
            <div class="portal-water-circle">
                <svg viewBox="0 0 120 120" width="160" height="160">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e0e0e0" stroke-width="8"/>
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#3498db" stroke-width="8"
                        stroke-dasharray="${2 * Math.PI * 54}" stroke-dashoffset="${2 * Math.PI * 54 * (1 - pct / 100)}"
                        transform="rotate(-90 60 60)" stroke-linecap="round"/>
                    <text x="60" y="52" text-anchor="middle" font-size="20" font-weight="700" fill="#3498db">${total}ml</text>
                    <text x="60" y="72" text-anchor="middle" font-size="11" fill="#636e72">${pct}% · ${glasses} copos</text>
                </svg>
                <p class="text-small text-muted mt-1">Meta: ${target}ml/dia</p>
            </div>
            <div class="portal-water-buttons">
                <button class="portal-water-btn" onclick="PatientPortal.addWater(150)">🥤 150ml</button>
                <button class="portal-water-btn" onclick="PatientPortal.addWater(250)">🥛 250ml</button>
                <button class="portal-water-btn" onclick="PatientPortal.addWater(500)">🧴 500ml</button>
            </div>
            ${logs.length ? `<div class="portal-card mt-2">
                <strong>Hoje</strong>
                ${logs.map(l => `<div class="portal-food-item"><span>${l.amount}ml</span><span class="text-muted">${l.time || ''}</span></div>`).join('')}
            </div>` : ''}
            <div class="portal-card mt-2">
                <button class="portal-btn-add" onclick="PatientPortal.openWaterReminder()" style="width:100%">
                    <span class="material-icons-outlined">notifications_active</span> Programar lembrete de água
                </button>
            </div>
        `;
    },

    /* ---- ABA CHAT ---- */
    _tabChat(p) {
        const msgs = DB.getChatMessages().filter(m => m.patientId === p.id)
            .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

        return `
            <div class="portal-chat-messages" id="portal-chat-msgs">
                ${msgs.length ? msgs.map(m => `
                    <div class="portal-chat-bubble ${m.sender === 'nutricionista' ? 'sent' : 'received'}">
                        <p>${App.escapeHtml(m.text)}</p>
                        <span class="portal-chat-time">${this._formatMsgTime(m.createdAt)}</span>
                    </div>
                `).join('') : '<p class="text-center text-muted text-small" style="padding:30px">Nenhuma mensagem ainda</p>'}
            </div>
            <div class="portal-chat-input">
                <input type="text" id="portal-chat-text" placeholder="Digite uma mensagem..." onkeydown="if(event.key==='Enter')PatientPortal.sendChat()">
                <button onclick="PatientPortal.sendChat()" class="btn-icon" style="color:var(--primary)">
                    <span class="material-icons-outlined">send</span>
                </button>
            </div>
            <button class="portal-btn-add mt-2" onclick="PatientPortal.startVideoCall()" style="width:100%">
                <span class="material-icons-outlined">videocam</span> Iniciar videochamada
            </button>
        `;
    },

    _formatMsgTime(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },

    /* ---- AÇÕES ---- */
    addWater(ml) {
        const p = DB.getPatient(this.selectedPatientId);
        if (!p) return;
        DB.addHydrationLog({
            patientId: p.id,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            amount: ml
        });
        App.showToast(`+${ml}ml registrado!`, 'success');
        this.setTab('agua');
    },

    openWaterReminder() {
        if (!('Notification' in window)) {
            App.showToast('Seu navegador não suporta notificações', 'error');
            return;
        }
        App.openModal('Lembrete de Água', `
            <form id="water-reminder-form" onsubmit="PatientPortal.setWaterReminder(event)">
                <div class="form-group">
                    <label>Intervalo (minutos)</label>
                    <select name="interval">
                        <option value="30">A cada 30 min</option>
                        <option value="60" selected>A cada 1 hora</option>
                        <option value="90">A cada 1h30</option>
                        <option value="120">A cada 2 horas</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Horário início</label>
                    <input type="time" name="start" value="08:00">
                </div>
                <div class="form-group">
                    <label>Horário fim</label>
                    <input type="time" name="end" value="22:00">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Ativar Lembretes</button>
                </div>
            </form>
        `);
    },

    _waterTimers: [],

    setWaterReminder(e) {
        e.preventDefault();
        Notification.requestPermission().then(perm => {
            if (perm !== 'granted') { App.showToast('Permita notificações no navegador', 'error'); return; }
            const f = document.getElementById('water-reminder-form');
            const interval = parseInt(f.interval.value) * 60 * 1000;
            this._waterTimers.forEach(t => clearInterval(t));
            this._waterTimers = [];
            const timer = setInterval(() => {
                const now = new Date();
                const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
                if (t >= f.start.value && t <= f.end.value) {
                    new Notification('💧 Hora de beber água!', { body: 'Lembre-se de se hidratar!', icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text y="24" font-size="24">💧</text></svg>' });
                }
            }, interval);
            this._waterTimers.push(timer);
            App.closeModal();
            App.showToast('Lembretes de água ativados!', 'success');
        });
    },

    openDiaryEntry() {
        const p = DB.getPatient(this.selectedPatientId);
        if (!p) return;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        App.openModal('Registrar Refeição', `
            <form id="diary-form" onsubmit="PatientPortal.saveDiaryEntry(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Refeição</label>
                        <select name="mealType">
                            <option>Café da Manhã</option>
                            <option>Lanche da Manhã</option>
                            <option>Almoço</option>
                            <option>Lanche da Tarde</option>
                            <option>Jantar</option>
                            <option>Ceia</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Data</label>
                        <input type="date" name="date" value="${today}">
                    </div>
                </div>
                <div class="form-group">
                    <label>O que comeu?</label>
                    <textarea name="description" rows="3" placeholder="Descreva o que comeu..." required maxlength="500"></textarea>
                </div>
                <div class="form-group">
                    <label>Foto da refeição (opcional)</label>
                    <input type="file" accept="image/*" id="diary-photo-input" onchange="PatientPortal.previewDiaryPhoto(this)">
                    <div id="diary-photo-preview"></div>
                </div>
                <input type="hidden" name="time" value="${now}">
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        `);
    },

    _tempPhoto: null,

    previewDiaryPhoto(input) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        if (file.size > 1024 * 1024) {
            App.showToast('Imagem muito grande (máx 1MB)', 'error');
            input.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            this._tempPhoto = e.target.result;
            document.getElementById('diary-photo-preview').innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:200px;border-radius:8px;margin-top:8px">`;
        };
        reader.readAsDataURL(file);
    },

    saveDiaryEntry(e) {
        e.preventDefault();
        const f = document.getElementById('diary-form');
        DB.addFoodDiaryEntry({
            patientId: this.selectedPatientId,
            mealType: f.mealType.value,
            date: f.date.value,
            time: f.time.value,
            description: f.description.value.trim(),
            photo: this._tempPhoto || null,
            feedback: null,
            feedbackNote: ''
        });
        this._tempPhoto = null;
        App.closeModal();
        App.showToast('Refeição registrada!', 'success');
        this.setTab('diario');
    },

    openGoalForm() {
        App.openModal('Nova Meta', `
            <form id="goal-form" onsubmit="PatientPortal.saveGoal(event)">
                <div class="form-group">
                    <label>Título *</label>
                    <input type="text" name="title" required placeholder="Ex: Exercícios na semana" maxlength="100">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Meta</label>
                        <input type="number" name="target" min="1" required value="3">
                    </div>
                    <div class="form-group">
                        <label>Unidade</label>
                        <input type="text" name="unit" placeholder="vezes, litros, kg..." maxlength="30">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Criar Meta</button>
                </div>
            </form>
        `);
    },

    saveGoal(e) {
        e.preventDefault();
        const f = document.getElementById('goal-form');
        DB.addPatientGoal({
            patientId: this.selectedPatientId,
            title: f.title.value.trim(),
            target: parseInt(f.target.value),
            current: 0,
            unit: f.unit.value.trim()
        });
        App.closeModal();
        App.showToast('Meta criada!', 'success');
        this.setTab('metas');
    },

    sendChat() {
        const input = document.getElementById('portal-chat-text');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        DB.addChatMessage({
            patientId: this.selectedPatientId,
            sender: 'nutricionista',
            text
        });
        input.value = '';
        this.setTab('chat');
        setTimeout(() => {
            const msgs = document.getElementById('portal-chat-msgs');
            if (msgs) msgs.scrollTop = msgs.scrollHeight;
        }, 50);
    },

    startVideoCall() {
        const p = DB.getPatient(this.selectedPatientId);
        if (!p) return;
        const room = 'nutrisys-' + this.selectedPatientId.substring(0, 8);
        const url = 'https://meet.jit.si/' + room;
        window.open(url, '_blank');
        App.showToast('Sala de vídeo aberta! Compartilhe o link com o paciente.', 'success');
    },

    /* ---- PORTAL EXTERNO (popup para paciente) ---- */
    openPortalWindow() {
        const p = DB.getPatient(this.selectedPatientId);
        if (!p) return;
        const settings = DB.getSettings();
        const clinic = App.escapeHtml(settings.clinicName || 'NutriSys');
        const pc = settings.primaryColor || '#00b894';
        const plans = DB.getMealPlans().filter(m => m.patientId === p.id);
        const plan = plans.length ? plans[plans.length - 1] : null;
        const goals = DB.getPatientGoals().filter(g => g.patientId === p.id);
        const today = new Date().toISOString().split('T')[0];
        const hydro = DB.getHydrationLogs().filter(h => h.patientId === p.id && h.date === today);
        const totalWater = hydro.reduce((s, h) => s + (h.amount || 0), 0);
        const targetWater = p.weight ? Math.round(p.weight * 35) : 2000;

        const MEAL_LABELS = { 'cafe':'Café da Manhã','lanche_manha':'Lanche da Manhã','almoco':'Almoço','lanche_tarde':'Lanche da Tarde','jantar':'Jantar','ceia':'Ceia' };

        const w = window.open('', '_blank', 'width=420,height=800');
        if (!w) { App.showToast('Permita pop-ups', 'error'); return; }

        let mealHtml = '';
        if (plan && plan.meals) {
            plan.meals.forEach(m => {
                mealHtml += `<div class="card"><h4>${MEAL_LABELS[m.type]||m.type}</h4>`;
                (m.foods || []).forEach(f => {
                    const food = DB.getById(DB.KEYS.FOODS, f.foodId);
                    if (food) mealHtml += `<div class="fi"><span>${food.name}</span><span>${f.quantity}x · ${Math.round(food.calories*f.quantity)}kcal</span></div>`;
                });
                mealHtml += '</div>';
            });
        }

        w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${clinic} - Meu Plano</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;background:#f5f6fa;color:#2d3436;max-width:420px;margin:0 auto}
.hd{background:${pc};color:#fff;padding:24px 16px;text-align:center}.hd h2{margin-bottom:2px}.hd p{opacity:.8;font-size:.85rem}
.tabs{display:flex;background:#fff;border-bottom:1px solid #dfe6e9;position:sticky;top:0;z-index:10}
.tab{flex:1;padding:10px 4px;text-align:center;font-size:.75rem;cursor:pointer;border-bottom:2px solid transparent;color:#636e72}
.tab.active{color:${pc};border-color:${pc};font-weight:600}.tab .material-icons-outlined{display:block;font-size:20px;margin:0 auto}
.body{padding:12px}
.card{background:#fff;border-radius:10px;padding:14px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.card h4{font-size:.9rem;margin-bottom:8px;color:${pc}}
.fi{display:flex;justify-content:space-between;padding:4px 0;font-size:.85rem;border-bottom:1px solid #f0f0f0}
.fi:last-child{border:none}
.wc{text-align:center;padding:20px}.wc h3{font-size:2rem;color:#3498db}.wc p{color:#636e72;font-size:.85rem}
.wb{display:flex;gap:8px;justify-content:center;margin:12px 0}
.wb button{padding:8px 16px;border:1px solid #dfe6e9;border-radius:20px;background:#fff;cursor:pointer;font-family:inherit;font-size:.85rem}
.wb button:hover{background:#e8f8f5}
.gc{background:#fff;border-radius:10px;padding:14px;margin-bottom:10px}
.gp{height:6px;background:#e0e0e0;border-radius:3px;margin:6px 0}.gf{height:100%;border-radius:3px;background:${pc};transition:width .3s}
.sec{display:none}.sec.active{display:block}
</style></head><body>
<div class="hd"><h2>${App.escapeHtml(p.name)}</h2><p>${clinic}</p></div>
<div class="tabs">
<div class="tab active" onclick="show('dieta')"><span class="material-icons-outlined">restaurant_menu</span>Dieta</div>
<div class="tab" onclick="show('agua')"><span class="material-icons-outlined">water_drop</span>Água</div>
<div class="tab" onclick="show('metas')"><span class="material-icons-outlined">flag</span>Metas</div>
</div>
<div class="body">
<div class="sec active" id="sec-dieta">${mealHtml||'<p style="text-align:center;color:#636e72;padding:30px">Nenhum cardápio ainda</p>'}</div>
<div class="sec" id="sec-agua">
<div class="wc"><h3>${totalWater}ml</h3><p>de ${targetWater}ml (${Math.min(100,Math.round(totalWater/targetWater*100))}%)</p></div>
<div class="wb"><button onclick="addW(150)">🥤 150ml</button><button onclick="addW(250)">🥛 250ml</button><button onclick="addW(500)">🧴 500ml</button></div>
<div id="wlog"></div>
</div>
<div class="sec" id="sec-metas">
${goals.length ? goals.map(g => {
    const pct = g.target > 0 ? Math.min(100, Math.round((g.current/g.target)*100)) : 0;
    return `<div class="gc"><strong>${g.title}</strong> <span style="float:right;font-size:.8rem;color:${pct>=100?'#27ae60':'#636e72'}">${pct}%</span><div class="gp"><div class="gf" style="width:${pct}%"></div></div><span style="font-size:.8rem;color:#636e72">${g.current}/${g.target} ${g.unit||''}</span></div>`;
}).join('') : '<p style="text-align:center;color:#636e72;padding:30px">Nenhuma meta definida</p>'}
</div>
</div>
<script>
var wt=${totalWater};function show(s){document.querySelectorAll('.sec').forEach(function(e){e.classList.remove('active')});document.getElementById('sec-'+s).classList.add('active');document.querySelectorAll('.tab').forEach(function(t,i){t.classList.toggle('active',['dieta','agua','metas'][i]===s)})}
function addW(ml){wt+=ml;document.querySelector('.wc h3').textContent=wt+'ml';document.querySelector('.wc p').textContent='de ${targetWater}ml ('+Math.min(100,Math.round(wt/${targetWater}*100))+'%)';try{if(window.opener&&window.opener.DB){window.opener.DB.addHydrationLog({patientId:'${p.id}',date:new Date().toISOString().split('T')[0],time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),amount:ml})}}catch(e){}}
<\/script></body></html>`);
        w.document.close();
    }
};
