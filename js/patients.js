/* ============================================
   NutreClin - Módulo de Pacientes
   ============================================ */

const Patients = {
    currentView: 'list', // list | detail
    currentPatientId: null,

    render() {
        if (this.currentView === 'detail' && this.currentPatientId) {
            return this.renderDetail(this.currentPatientId);
        }
        return this.renderList();
    },

    renderList() {
        const patients = DB.getPatients();
        const sec = Auth.isSecretary();
        const cols = sec ? 4 : 6;
        return `
            <div class="search-bar">
                <div class="search-input">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" id="search-patients" placeholder="Buscar paciente pelo nome..." oninput="Patients.filterList()">
                </div>
                <button class="btn btn-primary" onclick="Patients.openAddModal()">
                    <span class="material-icons-outlined">person_add</span> Novo Paciente
                </button>
            </div>
            <div class="card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Telefone</th>
                                ${sec ? '' : '<th>Objetivo</th><th>IMC</th>'}
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="patients-table-body">
                            ${patients.length > 0 ? patients.map(p => this._renderRow(p)).join('') : `
                                <tr><td colspan="${cols}" class="text-center text-muted" style="padding:40px">Nenhum paciente cadastrado</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    _renderRow(p) {
        const sec = Auth.isSecretary();
        const imc = p.height && p.weight ? (p.weight / ((p.height / 100) ** 2)).toFixed(1) : '-';
        return `
            <tr data-patient-row data-name="${App.escapeHtml(p.name.toLowerCase())}">
                <td><strong>${App.escapeHtml(p.name)}</strong></td>
                <td>${App.escapeHtml(p.email || '-')}</td>
                <td>${App.escapeHtml(p.phone || '-')}</td>
                ${sec ? '' : `<td><span class="badge badge-info">${App.escapeHtml(p.goal || '-')}</span></td><td>${imc}</td>`}
                <td>
                    <div class="actions">
                        ${sec ? '' : `<button class="btn-icon" title="Ver detalhes" onclick="Patients.viewPatient('${p.id}')">
                            <span class="material-icons-outlined">visibility</span>
                        </button>`}
                        <button class="btn-icon" title="Editar" onclick="Patients.openEditModal('${p.id}')">
                            <span class="material-icons-outlined">edit</span>
                        </button>
                        <button class="btn-icon" title="Excluir" onclick="Patients.confirmDelete('${p.id}')">
                            <span class="material-icons-outlined">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    filterList() {
        const query = document.getElementById('search-patients').value.toLowerCase();
        document.querySelectorAll('[data-patient-row]').forEach(row => {
            const name = row.getAttribute('data-name');
            row.style.display = name.includes(query) ? '' : 'none';
        });
    },

    // ---------- DETALHES DO PACIENTE ----------
    viewPatient(id) {
        this.currentView = 'detail';
        this.currentPatientId = id;
        App.renderPage('patients');
    },

    backToList() {
        this.currentView = 'list';
        this.currentPatientId = null;
        App.renderPage('patients');
    },

    renderDetail(id) {
        // Secretária não pode ver detalhes clínicos
        if (Auth.isSecretary()) {
            this.currentView = 'list';
            return this.renderList();
        }
        const p = DB.getPatient(id);
        if (!p) return '<p>Paciente não encontrado.</p>';

        const imc = p.height && p.weight ? (p.weight / ((p.height / 100) ** 2)).toFixed(1) : '-';
        const imcClass = this._imcCategory(parseFloat(imc));
        const initials = p.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        const age = p.birthDate ? this._calcAge(p.birthDate) : '-';

        const patientPlans = DB.getMealPlans().filter(m => m.patientId === id);
        const patientAppts = DB.getAppointments()
            .filter(a => a.patientId === id)
            .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

        return `
            <button class="btn btn-outline mb-3" onclick="Patients.backToList()">
                <span class="material-icons-outlined">arrow_back</span> Voltar
            </button>

            <div class="patient-header">
                <div class="patient-avatar">${initials}</div>
                <div class="patient-meta">
                    <h3>${App.escapeHtml(p.name)}</h3>
                    <p>${App.escapeHtml(p.email || '')} · ${App.escapeHtml(p.phone || '')}</p>
                </div>
                <div style="margin-left:auto" class="btn-group">
                    <button class="btn btn-sm btn-outline" onclick="Patients.openEditModal('${p.id}')">
                        <span class="material-icons-outlined" style="font-size:16px">edit</span> Editar
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="MealPlans.openCreateForPatient('${p.id}')">
                        <span class="material-icons-outlined" style="font-size:16px">restaurant_menu</span> Novo Cardápio
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="EnergyExpenditure.openCalcForPatient('${p.id}')" style="border-color:var(--warning);color:var(--warning)">
                        <span class="material-icons-outlined" style="font-size:16px">local_fire_department</span> TMB/GET
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="Anamnesis.openForPatient('${p.id}')" style="border-color:var(--info);color:var(--info)">
                        <span class="material-icons-outlined" style="font-size:16px">assignment</span> Anamnese
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="LabExams.openForPatient('${p.id}')" style="border-color:var(--secondary);color:var(--secondary)">
                        <span class="material-icons-outlined" style="font-size:16px">biotech</span> Exames
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="Supplements.openForPatient('${p.id}')" style="border-color:var(--accent);color:var(--accent)">
                        <span class="material-icons-outlined" style="font-size:16px">medication</span> Suplementos
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="BodyEvolution.openForPatient('${p.id}')" style="border-color:#00cec9;color:#00cec9">
                        <span class="material-icons-outlined" style="font-size:16px">trending_up</span> Evolução
                    </button>
                </div>
            </div>

            <div class="patient-info-grid mb-3">
                <div class="info-item">
                    <label>Idade</label>
                    <p>${age} anos</p>
                </div>
                <div class="info-item">
                    <label>Sexo</label>
                    <p>${p.gender === 'M' ? 'Masculino' : p.gender === 'F' ? 'Feminino' : '-'}</p>
                </div>
                <div class="info-item">
                    <label>Altura</label>
                    <p>${p.height ? p.height + ' cm' : '-'}</p>
                </div>
                <div class="info-item">
                    <label>Peso</label>
                    <p>${p.weight ? p.weight + ' kg' : '-'}</p>
                </div>
                <div class="info-item">
                    <label>IMC</label>
                    <p>${imc} <span class="badge ${imcClass.badge}">${imcClass.label}</span></p>
                </div>
                <div class="info-item">
                    <label>Objetivo</label>
                    <p>${App.escapeHtml(p.goal || '-')}</p>
                </div>
            </div>

            ${p.notes ? `
                <div class="card mb-3">
                    <div class="card-header"><h3>Observações</h3></div>
                    <p style="white-space:pre-wrap">${App.escapeHtml(p.notes)}</p>
                </div>
            ` : ''}

            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <h3>Cardápios (${patientPlans.length})</h3>
                    </div>
                    ${patientPlans.length > 0 ? patientPlans.map(plan => `
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
                            <div>
                                <strong>${App.escapeHtml(plan.name)}</strong>
                                <p class="text-small text-muted">${App.formatDate(plan.createdAt)}</p>
                            </div>
                            <button class="btn btn-sm btn-outline" onclick="MealPlans.viewPlan('${plan.id}')">Ver</button>
                        </div>
                    `).join('') : '<p class="text-muted text-small">Nenhum cardápio criado</p>'}
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>Consultas (${patientAppts.length})</h3>
                    </div>
                    ${patientAppts.length > 0 ? `
                        <ul class="appointment-list">
                            ${patientAppts.slice(0, 5).map(a => `
                                <li class="appointment-item">
                                    <div class="appointment-time">${a.time}</div>
                                    <div class="appointment-info">
                                        <h4>${App.escapeHtml(a.type)}</h4>
                                        <p>${App.formatDate(a.date)}</p>
                                    </div>
                                    <span class="badge ${a.status === 'confirmada' ? 'badge-success' : a.status === 'realizada' ? 'badge-purple' : 'badge-warning'}">${a.status}</span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : '<p class="text-muted text-small">Nenhuma consulta registrada</p>'}
                </div>
            </div>
        `;
    },

    _calcAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    },

    _imcCategory(imc) {
        if (isNaN(imc)) return { label: '-', badge: 'badge-info' };
        if (imc < 18.5) return { label: 'Abaixo do peso', badge: 'badge-warning' };
        if (imc < 25) return { label: 'Normal', badge: 'badge-success' };
        if (imc < 30) return { label: 'Sobrepeso', badge: 'badge-warning' };
        return { label: 'Obesidade', badge: 'badge-danger' };
    },

    // ---------- MODAL ADICIONAR / EDITAR ----------
    openAddModal() {
        App.openModal('Novo Paciente', this._renderForm());
    },

    openEditModal(id) {
        const p = DB.getPatient(id);
        if (!p) return;
        App.openModal('Editar Paciente', this._renderForm(p));
    },

    _renderForm(p = {}) {
        const sec = Auth.isSecretary();
        return `
            <form id="patient-form" onsubmit="Patients.handleSave(event, '${p.id || ''}')">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome completo *</label>
                        <input type="text" name="name" required maxlength="100" value="${App.escapeHtml(p.name || '')}">
                    </div>
                    <div class="form-group">
                        <label>E-mail</label>
                        <input type="email" name="email" maxlength="100" value="${App.escapeHtml(p.email || '')}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Telefone</label>
                        <input type="tel" name="phone" maxlength="20" value="${App.escapeHtml(p.phone || '')}">
                    </div>
                    <div class="form-group">
                        <label>Data de Nascimento</label>
                        <input type="date" name="birthDate" value="${p.birthDate || ''}">
                    </div>
                </div>
                ${sec ? '' : `
                <div class="form-row-3">
                    <div class="form-group">
                        <label>Sexo</label>
                        <select name="gender">
                            <option value="">Selecione</option>
                            <option value="M" ${p.gender === 'M' ? 'selected' : ''}>Masculino</option>
                            <option value="F" ${p.gender === 'F' ? 'selected' : ''}>Feminino</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Altura (cm)</label>
                        <input type="number" name="height" min="50" max="250" step="0.1" value="${p.height || ''}">
                    </div>
                    <div class="form-group">
                        <label>Peso (kg)</label>
                        <input type="number" name="weight" min="10" max="400" step="0.1" value="${p.weight || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Objetivo</label>
                    <select name="goal">
                        <option value="">Selecione</option>
                        <option value="Emagrecimento" ${p.goal === 'Emagrecimento' ? 'selected' : ''}>Emagrecimento</option>
                        <option value="Ganho de massa" ${p.goal === 'Ganho de massa' ? 'selected' : ''}>Ganho de massa</option>
                        <option value="Manutenção" ${p.goal === 'Manutenção' ? 'selected' : ''}>Manutenção</option>
                        <option value="Reeducação alimentar" ${p.goal === 'Reeducação alimentar' ? 'selected' : ''}>Reeducação alimentar</option>
                        <option value="Saúde geral" ${p.goal === 'Saúde geral' ? 'selected' : ''}>Saúde geral</option>
                        <option value="Performance esportiva" ${p.goal === 'Performance esportiva' ? 'selected' : ''}>Performance esportiva</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea name="notes" rows="3" maxlength="500">${App.escapeHtml(p.notes || '')}</textarea>
                </div>
                `}
                <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:8px">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">${p.id ? 'Salvar' : 'Cadastrar'}</button>
                </div>
            </form>
        `;
    },

    handleSave(e, id) {
        e.preventDefault();
        const form = document.getElementById('patient-form');
        const sec = Auth.isSecretary();
        const data = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            birthDate: form.birthDate.value,
        };
        if (!sec) {
            data.gender = form.gender.value;
            data.height = parseFloat(form.height.value) || null;
            data.weight = parseFloat(form.weight.value) || null;
            data.goal = form.goal.value;
            data.notes = form.notes.value.trim();
        }

        if (id) {
            DB.updatePatient(id, data);
            App.showToast('Paciente atualizado com sucesso!', 'success');
        } else {
            DB.addPatient(data);
            App.showToast('Paciente cadastrado com sucesso!', 'success');
        }

        App.closeModal();
        if (this.currentView === 'detail' && this.currentPatientId === id) {
            App.renderPage('patients');
        } else {
            this.currentView = 'list';
            App.renderPage('patients');
        }
    },

    confirmDelete(id) {
        const p = DB.getPatient(id);
        if (!p) return;
        App.openModal('Confirmar Exclusão', `
            <p>Tem certeza que deseja excluir o paciente <strong>${App.escapeHtml(p.name)}</strong>?</p>
            <p class="text-muted text-small mt-1">Esta ação não pode ser desfeita.</p>
            <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
                <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-danger" onclick="Patients.doDelete('${id}')">Excluir</button>
            </div>
        `);
    },

    doDelete(id) {
        DB.removePatient(id);
        App.closeModal();
        this.currentView = 'list';
        App.renderPage('patients');
        App.showToast('Paciente excluído', 'info');
    }
};
