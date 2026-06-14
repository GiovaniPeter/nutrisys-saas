/* ============================================
   NutreClin - Módulo de Consultas/Agendamento
   ============================================ */

const Appointments = {
    render() {
        const appointments = DB.getAppointments();
        const today = new Date().toISOString().split('T')[0];

        const upcoming = appointments
            .filter(a => a.date >= today)
            .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

        const past = appointments
            .filter(a => a.date < today)
            .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

        return `
            <div class="search-bar">
                <div class="search-input">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" id="search-appointments" placeholder="Buscar por paciente..." oninput="Appointments.filterList()">
                </div>
                <select id="filter-appt-status" class="btn btn-outline" style="min-width:140px" onchange="Appointments.filterList()">
                    <option value="">Todos status</option>
                    <option value="pendente">Pendente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                </select>
                <button class="btn btn-primary" onclick="Appointments.openAddModal()">
                    <span class="material-icons-outlined">add</span> Nova Consulta
                </button>
            </div>

            <div class="card mb-3">
                <div class="card-header">
                    <h3>Próximas Consultas (${upcoming.length})</h3>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Horário</th>
                                <th>Paciente</th>
                                <th>Tipo</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="appt-upcoming-body">
                            ${upcoming.length > 0 ? upcoming.map(a => this._renderRow(a, today)).join('') : `
                                <tr><td colspan="6" class="text-center text-muted" style="padding:30px">Nenhuma consulta agendada</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>

            ${past.length > 0 ? `
                <div class="card">
                    <div class="card-header">
                        <h3>Consultas Anteriores (${past.length})</h3>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Horário</th>
                                    <th>Paciente</th>
                                    <th>Tipo</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${past.map(a => this._renderRow(a, today)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
        `;
    },

    _renderRow(a, today) {
        const patient = DB.getPatient(a.patientId);
        const isToday = a.date === today;
        const statusBadge = {
            'pendente': 'badge-warning',
            'confirmada': 'badge-success',
            'realizada': 'badge-purple',
            'cancelada': 'badge-danger'
        };
        return `
            <tr data-appt-row
                data-patient="${patient ? patient.name.toLowerCase() : ''}"
                data-status="${a.status}">
                <td>
                    ${isToday ? '<strong style="color:var(--primary)">Hoje</strong>' : App.formatDate(a.date)}
                </td>
                <td><strong>${a.time}</strong></td>
                <td>${patient ? App.escapeHtml(patient.name) : '<em>Removido</em>'}</td>
                <td>${App.escapeHtml(a.type)}</td>
                <td>
                    <span class="badge ${statusBadge[a.status] || 'badge-info'}">${a.status}</span>
                </td>
                <td>
                    <div class="actions">
                        ${a.status === 'pendente' ? `
                            <button class="btn-icon" title="Confirmar" onclick="Appointments.updateStatus('${a.id}', 'confirmada')">
                                <span class="material-icons-outlined" style="color:var(--success)">check_circle</span>
                            </button>
                        ` : ''}
                        ${(a.status === 'confirmada') ? `
                            <button class="btn-icon" title="Marcar como realizada" onclick="Appointments.updateStatus('${a.id}', 'realizada')">
                                <span class="material-icons-outlined" style="color:var(--secondary)">task_alt</span>
                            </button>
                        ` : ''}
                        <button class="btn-icon" title="Editar" onclick="Appointments.openEditModal('${a.id}')">
                            <span class="material-icons-outlined">edit</span>
                        </button>
                        ${a.status !== 'cancelada' ? `
                            <button class="btn-icon" title="Cancelar" onclick="Appointments.updateStatus('${a.id}', 'cancelada')">
                                <span class="material-icons-outlined" style="color:var(--danger)">cancel</span>
                            </button>
                        ` : ''}
                        <button class="btn-icon" title="Excluir" onclick="Appointments.confirmDelete('${a.id}')">
                            <span class="material-icons-outlined">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    filterList() {
        const query = document.getElementById('search-appointments').value.toLowerCase();
        const status = document.getElementById('filter-appt-status').value;
        document.querySelectorAll('[data-appt-row]').forEach(row => {
            const p = row.getAttribute('data-patient');
            const s = row.getAttribute('data-status');
            const matchP = p.includes(query);
            const matchS = !status || s === status;
            row.style.display = (matchP && matchS) ? '' : 'none';
        });
    },

    updateStatus(id, status) {
        DB.updateAppointment(id, { status });
        App.renderPage('appointments');
        const labels = { confirmada: 'Consulta confirmada', realizada: 'Consulta realizada', cancelada: 'Consulta cancelada' };
        App.showToast(labels[status] || 'Status atualizado', 'success');
    },

    // ---------- MODAL ----------
    openAddModal() {
        App.openModal('Nova Consulta', this._renderForm());
    },

    openEditModal(id) {
        const a = DB.getById(DB.KEYS.APPOINTMENTS, id);
        if (!a) return;
        App.openModal('Editar Consulta', this._renderForm(a));
    },

    _renderForm(a = {}) {
        const patients = DB.getPatients();
        const today = new Date().toISOString().split('T')[0];

        return `
            <form id="appointment-form" onsubmit="Appointments.handleSave(event, '${a.id || ''}')">
                <div class="form-group">
                    <label>Paciente *</label>
                    <select name="patientId" required>
                        <option value="">Selecione</option>
                        ${patients.map(p => `<option value="${p.id}" ${a.patientId === p.id ? 'selected' : ''}>${App.escapeHtml(p.name)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Data *</label>
                        <input type="date" name="date" required min="${today}" value="${a.date || today}">
                    </div>
                    <div class="form-group">
                        <label>Horário *</label>
                        <input type="time" name="time" required value="${a.time || '09:00'}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Tipo</label>
                        <select name="type">
                            <option value="Primeira consulta" ${a.type === 'Primeira consulta' ? 'selected' : ''}>Primeira consulta</option>
                            <option value="Retorno" ${a.type === 'Retorno' ? 'selected' : ''}>Retorno</option>
                            <option value="Avaliação" ${a.type === 'Avaliação' ? 'selected' : ''}>Avaliação</option>
                            <option value="Acompanhamento" ${a.type === 'Acompanhamento' ? 'selected' : ''}>Acompanhamento</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="pendente" ${(!a.status || a.status === 'pendente') ? 'selected' : ''}>Pendente</option>
                            <option value="confirmada" ${a.status === 'confirmada' ? 'selected' : ''}>Confirmada</option>
                            <option value="realizada" ${a.status === 'realizada' ? 'selected' : ''}>Realizada</option>
                            <option value="cancelada" ${a.status === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea name="notes" rows="3" maxlength="500">${App.escapeHtml(a.notes || '')}</textarea>
                </div>
                <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:8px">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${a.id ? 'Salvar' : 'Agendar'}</button>
                </div>
            </form>
        `;
    },

    handleSave(e, id) {
        e.preventDefault();
        const form = document.getElementById('appointment-form');
        const data = {
            patientId: form.patientId.value,
            date: form.date.value,
            time: form.time.value,
            type: form.type.value,
            status: form.status.value,
            notes: form.notes.value.trim(),
        };

        if (id) {
            DB.updateAppointment(id, data);
            App.showToast('Consulta atualizada!', 'success');
        } else {
            DB.addAppointment(data);
            App.showToast('Consulta agendada!', 'success');
        }

        App.closeModal();
        App.renderPage('appointments');
    },

    confirmDelete(id) {
        App.openModal('Confirmar Exclusão', `
            <p>Tem certeza que deseja excluir esta consulta?</p>
            <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
                <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-danger" onclick="Appointments.doDelete('${id}')">Excluir</button>
            </div>
        `);
    },

    doDelete(id) {
        DB.removeAppointment(id);
        App.closeModal();
        App.renderPage('appointments');
        App.showToast('Consulta excluída', 'info');
    }
};
