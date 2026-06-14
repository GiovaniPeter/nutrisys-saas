/* ============================================
   NutreClin - WhatsApp Integration
   Envio de lembretes e links para pacientes
   ============================================ */

const WhatsApp = {
    selectedPatient: '',

    render() {
        const patients = DB.getPatients();
        if (!this.selectedPatient && patients.length) this.selectedPatient = patients[0].id;
        const p = this.selectedPatient ? DB.getPatient(this.selectedPatient) : null;
        const settings = DB.getSettings();

        return `
            <div class="page-header mb-3">
                <div>
                    <h3>WhatsApp</h3>
                    <p class="text-muted">Envie lembretes, cardápios e mensagens via WhatsApp</p>
                </div>
            </div>

            <div class="wa-grid">
                <!-- Mensagens rápidas -->
                <div class="card-panel">
                    <div class="card-panel-header">
                        <span class="material-icons-outlined" style="color:#25d366">smartphone</span>
                        <h4>Enviar Mensagem</h4>
                    </div>
                    <div class="form-group">
                        <label>Paciente</label>
                        <select id="wa-patient" class="btn btn-outline" onchange="WhatsApp.changePatient(this.value)" style="width:100%">
                            ${patients.map(pt => `<option value="${pt.id}" ${pt.id === this.selectedPatient ? 'selected' : ''}>${App.escapeHtml(pt.name)} ${pt.phone ? '· '+pt.phone : '(sem tel)'}</option>`).join('')}
                        </select>
                    </div>
                    ${p && p.phone ? `
                        <div class="wa-quick-actions">
                            <button class="wa-action-btn" onclick="WhatsApp.sendQuick('greeting')">
                                <span class="material-icons-outlined">waving_hand</span>
                                <span>Boas-vindas</span>
                            </button>
                            <button class="wa-action-btn" onclick="WhatsApp.sendQuick('reminder')">
                                <span class="material-icons-outlined">calendar_today</span>
                                <span>Lembrete consulta</span>
                            </button>
                            <button class="wa-action-btn" onclick="WhatsApp.sendQuick('diet')">
                                <span class="material-icons-outlined">restaurant_menu</span>
                                <span>Enviar cardápio</span>
                            </button>
                            <button class="wa-action-btn" onclick="WhatsApp.sendQuick('water')">
                                <span class="material-icons-outlined">water_drop</span>
                                <span>Lembrete de água</span>
                            </button>
                            <button class="wa-action-btn" onclick="WhatsApp.sendQuick('motivation')">
                                <span class="material-icons-outlined">emoji_events</span>
                                <span>Motivacional</span>
                            </button>
                            <button class="wa-action-btn" onclick="WhatsApp.sendQuick('return')">
                                <span class="material-icons-outlined">event_repeat</span>
                                <span>Retorno</span>
                            </button>
                        </div>
                        <div class="form-group mt-2">
                            <label>Ou escreva uma mensagem personalizada</label>
                            <textarea id="wa-custom-msg" rows="3" placeholder="Digite sua mensagem aqui..." maxlength="1000"></textarea>
                        </div>
                        <button class="btn btn-success" onclick="WhatsApp.sendCustom()" style="width:100%;background:#25d366;border-color:#25d366">
                            <span class="material-icons-outlined">send</span> Enviar pelo WhatsApp
                        </button>
                    ` : `
                        <div class="empty-state" style="padding:30px">
                            <span class="material-icons-outlined">phone_disabled</span>
                            <p>Paciente sem telefone cadastrado</p>
                            <p class="text-small text-muted">Adicione o telefone na ficha do paciente</p>
                        </div>
                    `}
                </div>

                <!-- Templates -->
                <div class="card-panel">
                    <div class="card-panel-header">
                        <span class="material-icons-outlined">description</span>
                        <h4>Templates de Mensagens</h4>
                    </div>
                    <div class="wa-templates">
                        ${this._getTemplates(p, settings).map((t, i) => `
                            <div class="wa-template-card">
                                <div class="flex items-center justify-between">
                                    <strong class="text-small">${App.escapeHtml(t.title)}</strong>
                                    <button class="btn btn-sm btn-outline" onclick="WhatsApp.useTemplate(${i})">Usar</button>
                                </div>
                                <p class="text-small text-muted mt-1">${App.escapeHtml(t.preview)}</p>
                            </div>
                        `).join('')}
                    </div>

                    <div class="mt-3">
                        <div class="card-panel-header">
                            <span class="material-icons-outlined">schedule_send</span>
                            <h4>Lembretes Automáticos</h4>
                        </div>
                        <p class="text-small text-muted mb-2">Configure lembretes para enviar antes das consultas</p>
                        <div class="wa-reminder-config">
                            <div class="flex items-center gap-2 mb-2">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="wa-reminder-24h" ${this._getReminderConfig().h24 ? 'checked' : ''} onchange="WhatsApp.toggleReminder('h24')">
                                    <span class="toggle-slider"></span>
                                </label>
                                <span class="text-small">Lembrar 24h antes da consulta</span>
                            </div>
                            <div class="flex items-center gap-2 mb-2">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="wa-reminder-1h" ${this._getReminderConfig().h1 ? 'checked' : ''} onchange="WhatsApp.toggleReminder('h1')">
                                    <span class="toggle-slider"></span>
                                </label>
                                <span class="text-small">Lembrar 1h antes da consulta</span>
                            </div>
                        </div>
                        <button class="btn btn-outline btn-sm mt-2" onclick="WhatsApp.sendPendingReminders()">
                            <span class="material-icons-outlined">notifications_active</span> Enviar lembretes pendentes agora
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    changePatient(id) {
        this.selectedPatient = id;
        App.renderPage('whatsapp');
    },

    _getTemplates(p, settings) {
        const clinic = settings.clinicName || 'NutreClin';
        const nutri = settings.professionalName || 'Nutricionista';
        const name = p ? p.name.split(' ')[0] : '[Nome]';
        return [
            { title: 'Boas-vindas', preview: `Olá ${name}! Seja bem-vindo(a) ao ${clinic}. Estou animado(a) para ajudar na sua jornada de saúde! 🌱`, key: 'greeting' },
            { title: 'Lembrete de Consulta', preview: `Olá ${name}! Lembrete: você tem consulta agendada. Confirma presença? 📋`, key: 'reminder' },
            { title: 'Envio de Cardápio', preview: `Olá ${name}! Seu cardápio personalizado está pronto! Acesse pelo portal ou vou enviar os detalhes. 🥗`, key: 'diet' },
            { title: 'Lembrete de Água', preview: `${name}, não esqueça de se hidratar! 💧 Beba pelo menos ${p && p.weight ? Math.round(p.weight*35)+'ml' : '2L'} de água hoje.`, key: 'water' },
            { title: 'Motivacional', preview: `${name}, cada pequena escolha conta! Continue firme no plano, os resultados virão. Você está no caminho certo! 💪🌟`, key: 'motivation' },
            { title: 'Retorno', preview: `Olá ${name}! Está na hora de agendarmos seu retorno para acompanhar seu progresso. Qual o melhor horário? 📅`, key: 'return' }
        ];
    },

    _openWhatsApp(phone, text) {
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
        const encodedText = encodeURIComponent(text);
        window.open(`https://wa.me/${fullPhone}?text=${encodedText}`, '_blank');
    },

    sendQuick(type) {
        const p = DB.getPatient(this.selectedPatient);
        if (!p || !p.phone) { App.showToast('Sem telefone', 'error'); return; }
        const settings = DB.getSettings();
        const templates = this._getTemplates(p, settings);
        const t = templates.find(tp => tp.key === type);
        if (t) this._openWhatsApp(p.phone, t.preview);
    },

    sendCustom() {
        const p = DB.getPatient(this.selectedPatient);
        if (!p || !p.phone) { App.showToast('Sem telefone', 'error'); return; }
        const msg = document.getElementById('wa-custom-msg').value.trim();
        if (!msg) { App.showToast('Digite uma mensagem', 'error'); return; }
        this._openWhatsApp(p.phone, msg);
    },

    useTemplate(idx) {
        const p = DB.getPatient(this.selectedPatient);
        const settings = DB.getSettings();
        const templates = this._getTemplates(p, settings);
        if (templates[idx]) {
            const ta = document.getElementById('wa-custom-msg');
            if (ta) ta.value = templates[idx].preview;
        }
    },

    _getReminderConfig() {
        try {
            return JSON.parse(localStorage.getItem('nutrisys_wa_reminders') || '{}');
        } catch { return {}; }
    },

    toggleReminder(key) {
        const config = this._getReminderConfig();
        config[key] = !config[key];
        localStorage.setItem('nutrisys_wa_reminders', JSON.stringify(config));
        App.showToast('Configuração salva', 'success');
    },

    sendPendingReminders() {
        const config = this._getReminderConfig();
        if (!config.h24 && !config.h1) {
            App.showToast('Nenhum lembrete ativado', 'error');
            return;
        }
        const now = new Date();
        const appointments = DB.getAppointments();
        let sent = 0;

        appointments.forEach(apt => {
            if (apt.status === 'cancelled') return;
            const aptDate = new Date(apt.date + 'T' + (apt.time || '08:00'));
            const diffH = (aptDate - now) / (1000 * 60 * 60);
            const p = DB.getPatient(apt.patientId);
            if (!p || !p.phone) return;

            if (config.h24 && diffH > 20 && diffH < 28) {
                const msg = `Olá ${p.name.split(' ')[0]}! Lembrete: sua consulta é amanhã às ${apt.time}. Confirma presença? 📋`;
                this._openWhatsApp(p.phone, msg);
                sent++;
            } else if (config.h1 && diffH > 0.5 && diffH < 2) {
                const msg = `${p.name.split(' ')[0]}, sua consulta é daqui a pouco, às ${apt.time}. Estamos te esperando! 😊`;
                this._openWhatsApp(p.phone, msg);
                sent++;
            }
        });

        App.showToast(sent ? `${sent} lembrete(s) enviado(s)!` : 'Nenhum lembrete pendente', sent ? 'success' : 'info');
    }
};
