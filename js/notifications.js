/* ============================================
   NutriSys — Módulo de Notificações In-App
   - Consultas do dia / próximas 24h
   - Pacientes sem retorno há 30+ dias
   - Tarefas pendentes (anamnese, exames)
   ============================================ */

const Notifications = {
    STORAGE_KEY: 'nutrisys_notif_dismissed',

    // ─────────────────────────────────────────
    // Gera lista de notificações ativas
    // ─────────────────────────────────────────
    getAll() {
        const notifs = [];
        const dismissed = this._getDismissed();
        const now = new Date();

        // ── Consultas do dia ──────────────────
        try {
            const today = now.toISOString().split('T')[0];
            const appointments = DB.getAppointments ? DB.getAppointments() : [];
            appointments.forEach(appt => {
                if (!appt.date || !appt.time) return;
                const id = `appt_today_${appt.id}`;
                if (dismissed.includes(id)) return;
                if (appt.date === today && appt.status !== 'cancelada') {
                    const patient = DB.getPatient(appt.patientId);
                    notifs.push({
                        id,
                        type: 'appointment',
                        priority: 'high',
                        icon: 'event',
                        title: 'Consulta hoje',
                        message: `${patient ? patient.name : 'Paciente'} às ${appt.time}`,
                        action: () => App.navigate('appointments'),
                        actionLabel: 'Ver consulta',
                        createdAt: new Date(appt.date + 'T' + appt.time).toISOString()
                    });
                }
            });

            // ── Consultas nas próximas 24h ────────
            const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            appointments.forEach(appt => {
                if (!appt.date || !appt.time) return;
                const apptDate = new Date(appt.date + 'T' + appt.time);
                if (appt.date === today) return; // já coberto acima
                const id = `appt_24h_${appt.id}`;
                if (dismissed.includes(id)) return;
                if (apptDate >= now && apptDate <= in24h && appt.status !== 'cancelada') {
                    const patient = DB.getPatient(appt.patientId);
                    notifs.push({
                        id,
                        type: 'appointment',
                        priority: 'medium',
                        icon: 'schedule',
                        title: 'Consulta em menos de 24h',
                        message: `${patient ? patient.name : 'Paciente'} amanhã às ${appt.time}`,
                        action: () => App.navigate('appointments'),
                        actionLabel: 'Ver consulta'
                    });
                }
            });
        } catch (e) { /* appointments opcional */ }

        // ── Pacientes sem retorno há 30+ dias ──
        try {
            const patients = DB.getPatients ? DB.getPatients() : [];
            const appointments = DB.getAppointments ? DB.getAppointments() : [];
            const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            patients.forEach(p => {
                const id = `no_return_${p.id}`;
                if (dismissed.includes(id)) return;

                const patientAppts = appointments
                    .filter(a => a.patientId === p.id && a.status === 'realizada')
                    .sort((a, b) => new Date(b.date) - new Date(a.date));

                const lastAppt = patientAppts[0];
                const lastDate = lastAppt ? new Date(lastAppt.date) : (p.createdAt ? new Date(p.createdAt) : null);

                if (lastDate && lastDate < cutoff) {
                    const days = Math.floor((now - lastDate) / (24 * 60 * 60 * 1000));
                    notifs.push({
                        id,
                        type: 'retention',
                        priority: days > 60 ? 'high' : 'medium',
                        icon: 'person_off',
                        title: 'Paciente sem retorno',
                        message: `${App.escapeHtml(p.name)} — ${days} dias sem consulta`,
                        action: () => {
                            Patients.currentView = 'list';
                            App.navigate('patients');
                        },
                        actionLabel: 'Ver paciente'
                    });
                }
            });
        } catch (e) { /* patients opcional */ }

        // ── Pacientes sem anamnese ────────────
        try {
            const patients = DB.getPatients ? DB.getPatients() : [];
            const anamnesisRecords = DB.getAnamnesisRecords ? DB.getAnamnesisRecords() : [];
            patients.forEach(p => {
                const id = `no_anamnesis_${p.id}`;
                if (dismissed.includes(id)) return;
                const hasAnamnesis = anamnesisRecords.some(a => a.patientId === p.id);
                if (!hasAnamnesis) {
                    notifs.push({
                        id,
                        type: 'pending',
                        priority: 'low',
                        icon: 'assignment_late',
                        title: 'Anamnese pendente',
                        message: `${App.escapeHtml(p.name)} ainda não tem anamnese registrada`,
                        action: () => App.navigate('anamnesis'),
                        actionLabel: 'Criar anamnese'
                    });
                }
            });
        } catch (e) { /* anamnese opcional */ }

        // Ordenar: high → medium → low
        const order = { high: 0, medium: 1, low: 2 };
        notifs.sort((a, b) => order[a.priority] - order[b.priority]);

        return notifs;
    },

    // ─────────────────────────────────────────
    // Renderiza o painel lateral de notificações
    // ─────────────────────────────────────────
    renderPanel() {
        const notifs = this.getAll();
        const priorityLabel = { high: 'Alta', medium: 'Média', low: 'Baixa' };
        const priorityColor = { high: '#e74c3c', medium: '#f39c12', low: '#3498db' };

        return `
            <div class="notif-panel" id="notif-panel">
                <div class="notif-panel-header">
                    <strong>Notificações</strong>
                    <span class="notif-count-badge">${notifs.length}</span>
                    ${notifs.length > 0 ? `<button class="notif-dismiss-all" onclick="Notifications.dismissAll()">Limpar tudo</button>` : ''}
                </div>
                <div class="notif-list" id="notif-list">
                    ${notifs.length === 0 ? `
                        <div class="notif-empty">
                            <span class="material-icons-outlined">notifications_none</span>
                            <p>Nenhuma notificação pendente</p>
                        </div>
                    ` : notifs.map(n => `
                        <div class="notif-item notif-${n.priority}" id="notif-item-${n.id}">
                            <div class="notif-item-icon" style="color:${priorityColor[n.priority]}">
                                <span class="material-icons-outlined">${n.icon}</span>
                            </div>
                            <div class="notif-item-body">
                                <div class="notif-item-title">${n.title}</div>
                                <div class="notif-item-message">${n.message}</div>
                                ${n.actionLabel ? `<button class="notif-action-btn" onclick="Notifications._runAction('${n.id}')">${n.actionLabel}</button>` : ''}
                            </div>
                            <button class="notif-dismiss-btn" onclick="Notifications.dismiss('${n.id}')" title="Dispensar">
                                <span class="material-icons-outlined">close</span>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    },

    // ─────────────────────────────────────────
    // Inicializa o botão na topbar
    // ─────────────────────────────────────────
    init() {
        this._injectButton();
        this._updateBadge();
    },

    _injectButton() {
        const actions = document.querySelector('.top-bar-actions');
        if (!actions || document.getElementById('notif-btn')) return;

        const count = this.getAll().length;
        const btn = document.createElement('div');
        btn.className = 'notif-btn-wrap';
        btn.innerHTML = `
            <button class="btn-icon notif-trigger" id="notif-btn" title="Notificações" onclick="Notifications.togglePanel()">
                <span class="material-icons-outlined">notifications</span>
                ${count > 0 ? `<span class="notif-badge" id="notif-badge">${count > 9 ? '9+' : count}</span>` : '<span class="notif-badge hidden" id="notif-badge"></span>'}
            </button>`;
        // Inserir antes da data
        actions.insertBefore(btn, actions.firstChild);

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notif-panel-wrap');
            const btn = document.getElementById('notif-btn');
            if (panel && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
                this.closePanel();
            }
        });
    },

    _updateBadge() {
        const badge = document.getElementById('notif-badge');
        if (!badge) return;
        const count = this.getAll().length;
        badge.textContent = count > 9 ? '9+' : count;
        badge.classList.toggle('hidden', count === 0);
    },

    togglePanel() {
        const existing = document.getElementById('notif-panel-wrap');
        if (existing) { existing.remove(); return; }

        const wrap = document.createElement('div');
        wrap.id = 'notif-panel-wrap';
        wrap.className = 'notif-panel-wrap';
        wrap.innerHTML = this.renderPanel();
        document.body.appendChild(wrap);

        // Posicionar abaixo do botão
        const btn = document.getElementById('notif-btn');
        if (btn) {
            const rect = btn.getBoundingClientRect();
            wrap.style.top = (rect.bottom + 8) + 'px';
            wrap.style.right = (window.innerWidth - rect.right) + 'px';
        }
    },

    closePanel() {
        const wrap = document.getElementById('notif-panel-wrap');
        if (wrap) wrap.remove();
    },

    dismiss(id) {
        const dismissed = this._getDismissed();
        if (!dismissed.includes(id)) dismissed.push(id);
        this._saveDismissed(dismissed);
        const el = document.getElementById('notif-item-' + id);
        if (el) {
            el.style.transition = 'all 0.25s ease';
            el.style.opacity = '0';
            el.style.transform = 'translateX(20px)';
            setTimeout(() => {
                el.remove();
                this._updatePanelEmpty();
                this._updateBadge();
            }, 250);
        }
    },

    dismissAll() {
        const notifs = this.getAll();
        const dismissed = this._getDismissed();
        notifs.forEach(n => { if (!dismissed.includes(n.id)) dismissed.push(n.id); });
        this._saveDismissed(dismissed);
        this.closePanel();
        this._updateBadge();
    },

    _runAction(id) {
        const notif = this.getAll().find(n => n.id === id);
        if (notif && notif.action) {
            this.closePanel();
            notif.action();
        }
    },

    _updatePanelEmpty() {
        const list = document.getElementById('notif-list');
        if (!list) return;
        if (list.querySelectorAll('.notif-item').length === 0) {
            list.innerHTML = `
                <div class="notif-empty">
                    <span class="material-icons-outlined">notifications_none</span>
                    <p>Nenhuma notificação pendente</p>
                </div>`;
        }
        const header = document.querySelector('.notif-panel-header');
        if (header) {
            const badge = header.querySelector('.notif-count-badge');
            if (badge) badge.textContent = '0';
            const btn = header.querySelector('.notif-dismiss-all');
            if (btn) btn.remove();
        }
    },

    _getDismissed() {
        try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; } catch { return []; }
    },
    _saveDismissed(arr) {
        // Limpa dismissals antigos (> 90 dias) para não crescer indefinidamente
        if (arr.length > 500) arr = arr.slice(-300);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(arr));
    }
};
