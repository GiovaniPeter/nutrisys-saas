/* ============================================
   NutreClin - Agenda Inteligente (Calendário)
   ============================================ */

const Schedule = {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDate: null,
    currentView: 'month',
    currentWeekStart: null,

    DAYS: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    MONTHS: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
             'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],

    render() {
        const config = DB.getScheduleConfig();
        return `
            <div class="schedule-toolbar">
                <div class="schedule-nav">
                    <button class="btn-icon" onclick="Schedule.prevPeriod()">
                        <span class="material-icons-outlined">chevron_left</span>
                    </button>
                    <h3 class="schedule-title" id="schedule-title">${this._getPeriodTitle()}</h3>
                    <button class="btn-icon" onclick="Schedule.nextPeriod()">
                        <span class="material-icons-outlined">chevron_right</span>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="Schedule.goToToday()" style="margin-left:12px">Hoje</button>
                </div>
                <div class="schedule-actions">
                    <div class="btn-group">
                        <button class="btn btn-sm ${this.currentView === 'month' ? 'btn-primary' : 'btn-outline'}" onclick="Schedule.setView('month')">Mês</button>
                        <button class="btn btn-sm ${this.currentView === 'week' ? 'btn-primary' : 'btn-outline'}" onclick="Schedule.setView('week')">Semana</button>
                    </div>
                    <button class="btn btn-sm btn-outline" onclick="Schedule.openConfigModal()">
                        <span class="material-icons-outlined">settings</span> Horários
                    </button>
                    ${config.bookingEnabled !== false ? `
                        <button class="btn btn-sm btn-primary" onclick="Schedule.openBookingPage()">
                            <span class="material-icons-outlined">link</span> Agendamento Online
                        </button>
                    ` : ''}
                </div>
            </div>

            <div class="card">
                <div id="schedule-calendar">
                    ${this.currentView === 'month' ? this._renderMonth() : this._renderWeek()}
                </div>
            </div>

            <div id="schedule-day-detail"></div>
        `;
    },

    /* --------------------------------------------------------
       NAVEGAÇÃO
    -------------------------------------------------------- */
    _getPeriodTitle() {
        if (this.currentView === 'month') {
            return `${this.MONTHS[this.currentMonth]} ${this.currentYear}`;
        }
        const ws = this._getWeekStart();
        const we = new Date(ws); we.setDate(we.getDate() + 6);
        return `${ws.getDate()} ${this.MONTHS[ws.getMonth()].substring(0,3)} — ${we.getDate()} ${this.MONTHS[we.getMonth()].substring(0,3)} ${we.getFullYear()}`;
    },

    _getWeekStart() {
        if (this.currentWeekStart) return new Date(this.currentWeekStart);
        const d = new Date();
        const day = d.getDay();
        d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
        d.setHours(0,0,0,0);
        return d;
    },

    prevPeriod() {
        if (this.currentView === 'month') {
            this.currentMonth--;
            if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
        } else {
            const ws = this._getWeekStart(); ws.setDate(ws.getDate() - 7);
            this.currentWeekStart = ws.toISOString();
        }
        this.selectedDate = null;
        App.renderPage('schedule');
    },

    nextPeriod() {
        if (this.currentView === 'month') {
            this.currentMonth++;
            if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
        } else {
            const ws = this._getWeekStart(); ws.setDate(ws.getDate() + 7);
            this.currentWeekStart = ws.toISOString();
        }
        this.selectedDate = null;
        App.renderPage('schedule');
    },

    goToToday() {
        const now = new Date();
        this.currentMonth = now.getMonth();
        this.currentYear = now.getFullYear();
        this.currentWeekStart = null;
        this.selectedDate = now.toISOString().split('T')[0];
        App.renderPage('schedule');
    },

    setView(v) {
        this.currentView = v;
        if (v === 'week') this.currentWeekStart = null;
        App.renderPage('schedule');
    },

    /* --------------------------------------------------------
       VISÃO MENSAL
    -------------------------------------------------------- */
    _renderMonth() {
        const appointments = DB.getAppointments();
        const today = new Date().toISOString().split('T')[0];
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        let startDow = firstDay.getDay();
        startDow = startDow === 0 ? 6 : startDow - 1; // Mon=0

        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

        const apptByDay = {};
        appointments.forEach(a => {
            const d = new Date(a.date + 'T12:00:00');
            if (d.getMonth() === this.currentMonth && d.getFullYear() === this.currentYear) {
                if (!apptByDay[d.getDate()]) apptByDay[d.getDate()] = [];
                apptByDay[d.getDate()].push(a);
            }
        });

        let html = '<div class="cal-grid">';
        ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].forEach(d => {
            html += `<div class="cal-header">${d}</div>`;
        });

        for (let i = 0; i < startDow; i++) html += '<div class="cal-cell cal-empty"></div>';

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${this.currentYear}-${String(this.currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const isToday = dateStr === today;
            const isSelected = dateStr === this.selectedDate;
            const dayAppts = apptByDay[day] || [];
            const statusColor = { pendente:'var(--warning)', confirmada:'var(--success)', realizada:'var(--secondary)', cancelada:'var(--danger)' };

            let cls = 'cal-cell';
            if (isToday) cls += ' cal-today';
            if (isSelected) cls += ' cal-selected';
            if (dayAppts.length) cls += ' cal-has-appts';

            html += `<div class="${cls}" onclick="Schedule.selectDay('${dateStr}')">
                <span class="cal-day-number${isToday ? ' cal-today-num' : ''}">${day}</span>
                ${dayAppts.length ? `<div class="cal-appts">
                    ${dayAppts.slice(0,3).map(a => {
                        const p = DB.getPatient(a.patientId);
                        return `<div class="cal-appt-dot" style="background:${statusColor[a.status]||'var(--info)'}" title="${a.time} - ${p ? p.name : 'N/A'}"></div>`;
                    }).join('')}
                    ${dayAppts.length > 3 ? `<span class="cal-more">+${dayAppts.length-3}</span>` : ''}
                </div>` : ''}
            </div>`;
        }
        html += '</div>';
        return html;
    },

    /* --------------------------------------------------------
       VISÃO SEMANAL
    -------------------------------------------------------- */
    _renderWeek() {
        const config = DB.getScheduleConfig();
        const appointments = DB.getAppointments();
        const today = new Date().toISOString().split('T')[0];
        const ws = this._getWeekStart();

        const startH = parseInt((config.startTime||'08:00').split(':')[0]);
        const endH = parseInt((config.endTime||'18:00').split(':')[0]);
        const lunchS = config.lunchStart || '12:00';
        const lunchE = config.lunchEnd || '13:00';

        let html = '<div class="week-grid">';

        // coluna de horários
        html += '<div class="week-times"><div class="week-header-cell"></div>';
        for (let h = startH; h < endH; h++) {
            html += `<div class="week-time-label">${String(h).padStart(2,'0')}:00</div>`;
        }
        html += '</div>';

        // colunas dos dias
        for (let d = 0; d < 7; d++) {
            const date = new Date(ws); date.setDate(date.getDate() + d);
            const dateStr = date.toISOString().split('T')[0];
            const isTd = dateStr === today;
            const dayAppts = appointments.filter(a => a.date === dateStr);

            html += `<div class="week-col ${isTd ? 'week-today' : ''}">`;
            html += `<div class="week-header-cell">${this.DAYS[date.getDay()]} <strong>${date.getDate()}</strong></div>`;

            for (let h = startH; h < endH; h++) {
                const ts = `${String(h).padStart(2,'0')}:00`;
                const isLunch = ts >= lunchS && ts < lunchE;
                const appt = dayAppts.find(a => a.time && a.time.startsWith(String(h).padStart(2,'0')));
                const statusColor = { pendente:'var(--warning)', confirmada:'var(--success)', realizada:'var(--secondary)', cancelada:'var(--danger)' };

                if (appt) {
                    const p = DB.getPatient(appt.patientId);
                    html += `<div class="week-cell week-has-appt" style="border-left:3px solid ${statusColor[appt.status]||'var(--info)'}" onclick="Schedule.selectDay('${dateStr}')">
                        <strong>${appt.time}</strong><span>${p ? App.escapeHtml(p.name) : 'N/A'}</span>
                    </div>`;
                } else if (isLunch) {
                    html += `<div class="week-cell week-lunch"><span class="text-muted text-small">Almoço</span></div>`;
                } else {
                    html += `<div class="week-cell" onclick="Schedule.quickAdd('${dateStr}','${ts}')"></div>`;
                }
            }
            html += '</div>';
        }
        html += '</div>';
        return html;
    },

    /* --------------------------------------------------------
       DETALHE DO DIA
    -------------------------------------------------------- */
    selectDay(dateStr) {
        this.selectedDate = dateStr;
        const appts = DB.getAppointments().filter(a => a.date === dateStr)
            .sort((a, b) => a.time.localeCompare(b.time));

        const container = document.getElementById('schedule-day-detail');
        if (!container) return;

        const formatted = new Date(dateStr + 'T12:00:00')
            .toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

        const badges = { pendente:'badge-warning', confirmada:'badge-success', realizada:'badge-purple', cancelada:'badge-danger' };

        container.innerHTML = `
            <div class="card mt-3">
                <div class="card-header">
                    <h3 style="text-transform:capitalize">${formatted}</h3>
                    <button class="btn btn-sm btn-primary" onclick="Schedule.quickAdd('${dateStr}','')">
                        <span class="material-icons-outlined">add</span> Nova Consulta
                    </button>
                </div>
                ${appts.length ? `
                <div class="table-container">
                    <table>
                        <thead><tr><th>Horário</th><th>Paciente</th><th>Tipo</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody>
                        ${appts.map(a => {
                            const p = DB.getPatient(a.patientId);
                            return `<tr>
                                <td><strong>${a.time}</strong></td>
                                <td>${p ? App.escapeHtml(p.name) : '<em>Removido</em>'}</td>
                                <td>${App.escapeHtml(a.type)}</td>
                                <td><span class="badge ${badges[a.status]||''}">${a.status}</span></td>
                                <td>
                                    <div class="actions">
                                        <button class="btn-icon" title="Google Agenda" onclick="Schedule.exportGoogleCalendar('${a.id}')">
                                            <span class="material-icons-outlined" style="color:var(--info)">event</span>
                                        </button>
                                        <button class="btn-icon" title="Baixar .ics" onclick="Schedule.exportICS('${a.id}')">
                                            <span class="material-icons-outlined">download</span>
                                        </button>
                                        <button class="btn-icon" title="Editar" onclick="Appointments.openEditModal('${a.id}')">
                                            <span class="material-icons-outlined">edit</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                        </tbody>
                    </table>
                </div>` : `
                <div class="empty-state" style="padding:30px">
                    <span class="material-icons-outlined" style="font-size:32px">event_available</span>
                    <p>Nenhuma consulta neste dia</p>
                </div>`}
            </div>`;

        // Atualiza highlight no calendário mensal
        if (this.currentView === 'month') {
            const cal = document.getElementById('schedule-calendar');
            if (cal) cal.innerHTML = this._renderMonth();
        }
    },

    /* --------------------------------------------------------
       NOVA CONSULTA RÁPIDA
    -------------------------------------------------------- */
    quickAdd(dateStr, time) {
        const patients = DB.getPatients();
        App.openModal('Nova Consulta', `
            <form id="appointment-form" onsubmit="Schedule.handleQuickSave(event)">
                <div class="form-group">
                    <label>Paciente *</label>
                    <select name="patientId" required>
                        <option value="">Selecione</option>
                        ${patients.map(p => `<option value="${p.id}">${App.escapeHtml(p.name)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Data *</label>
                        <input type="date" name="date" required value="${dateStr}">
                    </div>
                    <div class="form-group">
                        <label>Horário *</label>
                        <input type="time" name="time" required value="${time || '09:00'}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Tipo</label>
                        <select name="type">
                            <option value="Primeira consulta">Primeira consulta</option>
                            <option value="Retorno">Retorno</option>
                            <option value="Avaliação">Avaliação</option>
                            <option value="Acompanhamento">Acompanhamento</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="pendente">Pendente</option>
                            <option value="confirmada">Confirmada</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea name="notes" rows="2" maxlength="500"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Agendar</button>
                </div>
            </form>
        `);
    },

    handleQuickSave(e) {
        e.preventDefault();
        const f = document.getElementById('appointment-form');
        DB.addAppointment({
            patientId: f.patientId.value,
            date: f.date.value,
            time: f.time.value,
            type: f.type.value,
            status: f.status.value,
            notes: f.notes.value.trim()
        });
        App.closeModal();
        App.showToast('Consulta agendada!', 'success');
        App.renderPage('schedule');
    },

    /* --------------------------------------------------------
       GOOGLE CALENDAR
    -------------------------------------------------------- */
    exportGoogleCalendar(id) {
        const a = DB.getById(DB.KEYS.APPOINTMENTS, id);
        if (!a) return;
        const p = DB.getPatient(a.patientId);
        const name = p ? p.name : 'Paciente';
        const sd = a.date.replace(/-/g, '');
        const st = (a.time || '09:00').replace(':', '') + '00';
        const eh = parseInt(a.time.split(':')[0]) + 1;
        const et = String(eh).padStart(2, '0') + a.time.split(':')[1] + '00';

        const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
            + '&text=' + encodeURIComponent('Consulta - ' + name)
            + '&dates=' + sd + 'T' + st + '/' + sd + 'T' + et
            + '&details=' + encodeURIComponent('Tipo: ' + a.type + '\nStatus: ' + a.status + (a.notes ? '\nObs: ' + a.notes : ''));

        window.open(url, '_blank');
    },

    /* --------------------------------------------------------
       EXPORTAR ICS
    -------------------------------------------------------- */
    exportICS(id) {
        const a = DB.getById(DB.KEYS.APPOINTMENTS, id);
        if (!a) return;
        const p = DB.getPatient(a.patientId);
        const name = p ? p.name : 'Paciente';
        const sd = a.date.replace(/-/g, '');
        const st = (a.time || '09:00').replace(':', '') + '00';
        const eh = parseInt(a.time.split(':')[0]) + 1;
        const et = String(eh).padStart(2, '0') + a.time.split(':')[1] + '00';

        const ics = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NutreClin//PT',
            'BEGIN:VEVENT',
            'DTSTART:' + sd + 'T' + st,
            'DTEND:' + sd + 'T' + et,
            'SUMMARY:Consulta - ' + name,
            'DESCRIPTION:Tipo: ' + a.type + '\\nStatus: ' + a.status,
            'END:VEVENT', 'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'consulta-' + name.replace(/\s/g, '-') + '-' + a.date + '.ics';
        link.click();
        URL.revokeObjectURL(link.href);
        App.showToast('Arquivo .ics baixado!', 'success');
    },

    /* --------------------------------------------------------
       CONFIGURAÇÃO DE HORÁRIOS
    -------------------------------------------------------- */
    openConfigModal() {
        const c = DB.getScheduleConfig();
        const days = c.workDays || [1,2,3,4,5];
        App.openModal('Configurar Horários da Agenda', `
            <form id="schedule-cfg" onsubmit="Schedule.saveConfig(event)">
                <div class="form-group">
                    <label>Dias de atendimento</label>
                    <div class="schedule-days-check">
                        ${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((d,i) => `
                            <label class="check-label">
                                <input type="checkbox" name="workDay" value="${i}" ${days.includes(i)?'checked':''}>
                                <span>${d}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Início</label><input type="time" name="startTime" value="${c.startTime||'08:00'}"></div>
                    <div class="form-group"><label>Fim</label><input type="time" name="endTime" value="${c.endTime||'18:00'}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Almoço início</label><input type="time" name="lunchStart" value="${c.lunchStart||'12:00'}"></div>
                    <div class="form-group"><label>Almoço fim</label><input type="time" name="lunchEnd" value="${c.lunchEnd||'13:00'}"></div>
                </div>
                <div class="form-group">
                    <label>Duração da consulta</label>
                    <select name="slotDuration">
                        <option value="30" ${(c.slotDuration||30)===30?'selected':''}>30 min</option>
                        <option value="45" ${c.slotDuration===45?'selected':''}>45 min</option>
                        <option value="60" ${c.slotDuration===60?'selected':''}>60 min</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="check-label">
                        <input type="checkbox" name="bookingEnabled" ${c.bookingEnabled!==false?'checked':''}>
                        <span>Habilitar agendamento online</span>
                    </label>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        `);
    },

    saveConfig(e) {
        e.preventDefault();
        const f = document.getElementById('schedule-cfg');
        DB.saveScheduleConfig({
            workDays: Array.from(f.querySelectorAll('input[name="workDay"]:checked')).map(cb => parseInt(cb.value)),
            startTime: f.startTime.value,
            endTime: f.endTime.value,
            lunchStart: f.lunchStart.value,
            lunchEnd: f.lunchEnd.value,
            slotDuration: parseInt(f.slotDuration.value),
            bookingEnabled: f.bookingEnabled.checked
        });
        App.closeModal();
        App.showToast('Horários salvos!', 'success');
        App.renderPage('schedule');
    },

    /* --------------------------------------------------------
       PÁGINA DE AGENDAMENTO ONLINE
    -------------------------------------------------------- */
    openBookingPage() {
        const config = DB.getScheduleConfig();
        const settings = DB.getSettings();
        const appointments = DB.getAppointments();
        const clinicName = App.escapeHtml(settings.clinicName || 'NutreClin');
        const pc = settings.primaryColor || '#00b894';

        // Gerar slots disponíveis para os próximos 30 dias
        const today = new Date(); today.setHours(0,0,0,0);
        const grouped = {};

        for (let d = 1; d <= 30; d++) {
            const dt = new Date(today); dt.setDate(dt.getDate() + d);
            if (!(config.workDays || [1,2,3,4,5]).includes(dt.getDay())) continue;

            const dateStr = dt.toISOString().split('T')[0];
            const dayAppts = appointments.filter(a => a.date === dateStr && a.status !== 'cancelada');
            const sH = parseInt((config.startTime||'08:00').split(':')[0]);
            const eH = parseInt((config.endTime||'18:00').split(':')[0]);
            const lS = config.lunchStart || '12:00';
            const lE = config.lunchEnd || '13:00';
            const dur = config.slotDuration || 30;

            const times = [];
            for (let h = sH; h < eH; h++) {
                for (let m = 0; m < 60; m += dur) {
                    const t = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                    if (t >= lS && t < lE) continue;
                    if (dayAppts.some(a => a.time === t)) continue;
                    times.push(t);
                }
            }
            if (times.length) {
                grouped[dateStr] = {
                    label: dt.toLocaleDateString('pt-BR', { weekday:'short', day:'numeric', month:'short' }),
                    times
                };
            }
        }

        const w = window.open('', '_blank', 'width=600,height=800');
        if (!w) { App.showToast('Permita pop-ups para abrir a página', 'error'); return; }

        w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${clinicName} - Agendamento Online</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f5f6fa;color:#2d3436}
.bk-header{background:${pc};color:#fff;padding:30px 20px;text-align:center}
.bk-header h1{font-size:1.5rem;margin-bottom:4px}
.bk-header p{opacity:.9;font-size:.9rem}
.bk-body{max-width:500px;margin:20px auto;padding:0 16px}
.bk-form{background:#fff;border-radius:10px;padding:20px;margin-bottom:16px;box-shadow:0 2px 10px rgba(0,0,0,.08)}
.bk-form label{display:block;font-weight:500;margin-bottom:4px;font-size:.9rem}
.bk-form input,.bk-form select{width:100%;padding:10px;border:1px solid #dfe6e9;border-radius:6px;font-family:inherit;margin-bottom:12px}
.bk-day{background:#fff;border-radius:10px;padding:16px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,.08)}
.bk-day h3{font-size:.95rem;margin-bottom:10px;text-transform:capitalize}
.slots{display:flex;flex-wrap:wrap;gap:8px}
.slot{padding:8px 16px;border:1px solid #dfe6e9;border-radius:6px;cursor:pointer;font-size:.85rem;transition:all .2s}
.slot:hover{border-color:${pc};background:#e8f8f5}
.slot.sel{background:${pc};color:#fff;border-color:${pc}}
.btn-bk{display:block;width:100%;padding:14px;background:${pc};color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;font-family:inherit;margin-top:16px}
.btn-bk:hover{opacity:.9}.btn-bk:disabled{opacity:.5;cursor:not-allowed}
.ok-msg{text-align:center;padding:40px;color:${pc}}.ok-msg h2{margin-bottom:8px}
</style></head><body>
<div class="bk-header"><h1>${clinicName}</h1><p>Escolha o melhor horário para sua consulta</p></div>
<div class="bk-body">
<div class="bk-form">
<label>Seu nome completo</label><input id="bk-name" placeholder="Nome completo" required>
<label>Telefone</label><input id="bk-phone" placeholder="(11) 99999-0000">
<label>Tipo de consulta</label>
<select id="bk-type"><option>Primeira consulta</option><option>Retorno</option><option>Avaliação</option></select>
</div>
<h3 style="margin-bottom:12px">Horários disponíveis</h3>
<div id="bk-slots">${Object.entries(grouped).map(([date, info]) => `
<div class="bk-day"><h3>${info.label}</h3><div class="slots">
${info.times.map(t => `<div class="slot" data-d="${date}" data-t="${t}" onclick="selSlot(this)">${t}</div>`).join('')}
</div></div>`).join('')}</div>
<button class="btn-bk" id="btn-bk" disabled onclick="book()">Selecione um horário</button>
<div id="bk-ok" class="ok-msg" style="display:none"><h2>✓ Agendamento solicitado!</h2><p>Entraremos em contato para confirmação.</p></div>
</div>
<script>
var sd=null,st=null;
function selSlot(el){document.querySelectorAll('.slot').forEach(function(s){s.classList.remove('sel')});el.classList.add('sel');sd=el.getAttribute('data-d');st=el.getAttribute('data-t');var b=document.getElementById('btn-bk');b.disabled=false;b.textContent='Agendar '+st+' em '+new Date(sd+'T12:00:00').toLocaleDateString('pt-BR')}
function book(){var n=document.getElementById('bk-name').value.trim();if(!n){alert('Informe seu nome');return}try{if(window.opener&&window.opener.DB){var ps=window.opener.DB.getPatients();var p=ps.find(function(x){return x.name.toLowerCase()===n.toLowerCase()});if(!p){p=window.opener.DB.addPatient({name:n,phone:document.getElementById('bk-phone').value,email:'',birthDate:'',gender:'',height:0,weight:0,goal:'',notes:'Agendamento online'})}window.opener.DB.addAppointment({patientId:p.id,date:sd,time:st,type:document.getElementById('bk-type').value,status:'pendente',notes:'Agendamento online'})}}catch(e){}document.getElementById('bk-slots').style.display='none';document.querySelector('.bk-form').style.display='none';document.getElementById('btn-bk').style.display='none';document.getElementById('bk-ok').style.display='block'}
<\/script></body></html>`);
        w.document.close();
    }
};
