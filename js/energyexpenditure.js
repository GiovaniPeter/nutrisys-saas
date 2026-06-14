/* ============================================
   NutreClin - Módulo de Gasto Energético
   (TMB / GET) - Harris-Benedict, Mifflin-St Jeor, FAO/OMS
   ============================================ */

const EnergyExpenditure = {
    currentView: 'list',

    activityFactors: [
        { value: 1.2, label: 'Sedentário (pouco ou nenhum exercício)' },
        { value: 1.375, label: 'Levemente ativo (exercício leve 1-3 dias/semana)' },
        { value: 1.55, label: 'Moderadamente ativo (exercício moderado 3-5 dias/semana)' },
        { value: 1.725, label: 'Muito ativo (exercício intenso 6-7 dias/semana)' },
        { value: 1.9, label: 'Extremamente ativo (exercício muito intenso, trabalho físico)' },
    ],

    render() {
        return this.renderList();
    },

    renderList() {
        const patients = DB.getPatients();
        const calculations = DB.getEnergyCalculations();

        return `
            <div class="search-bar">
                <div class="search-input">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" id="search-energy" placeholder="Buscar por paciente..." oninput="EnergyExpenditure.filterList()">
                </div>
                <button class="btn btn-primary" onclick="EnergyExpenditure.openCalcModal()">
                    <span class="material-icons-outlined">calculate</span> Novo Cálculo
                </button>
            </div>

            <div class="card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Paciente</th>
                                <th>Fórmula</th>
                                <th>TMB (kcal)</th>
                                <th>Fator Atividade</th>
                                <th>GET (kcal)</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="energy-table-body">
                            ${calculations.length > 0 ? calculations.map(c => {
                                const patient = DB.getPatient(c.patientId);
                                const patientName = patient ? patient.name : 'Paciente removido';
                                return `
                                    <tr data-energy-row data-name="${App.escapeHtml(patientName.toLowerCase())}">
                                        <td><strong>${App.escapeHtml(patientName)}</strong></td>
                                        <td><span class="badge badge-purple">${App.escapeHtml(c.formula)}</span></td>
                                        <td>${c.tmb.toFixed(1)}</td>
                                        <td>${c.activityFactor}</td>
                                        <td><strong>${c.get.toFixed(1)}</strong></td>
                                        <td>${App.formatDate(c.createdAt)}</td>
                                        <td>
                                            <div class="actions">
                                                <button class="btn-icon" title="Ver detalhes" onclick="EnergyExpenditure.viewDetail('${c.id}')">
                                                    <span class="material-icons-outlined">visibility</span>
                                                </button>
                                                <button class="btn-icon" title="Excluir" onclick="EnergyExpenditure.confirmDelete('${c.id}')">
                                                    <span class="material-icons-outlined">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('') : `
                                <tr><td colspan="7" class="text-center text-muted" style="padding:40px">Nenhum cálculo registrado</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    filterList() {
        const query = document.getElementById('search-energy').value.toLowerCase();
        document.querySelectorAll('[data-energy-row]').forEach(row => {
            const name = row.getAttribute('data-name');
            row.style.display = name.includes(query) ? '' : 'none';
        });
    },

    // ---------- CÁLCULOS ----------
    calcHarrisBenedict(gender, weight, height, age) {
        if (gender === 'M') {
            return 66.5 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
        }
        return 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
    },

    calcMifflinStJeor(gender, weight, height, age) {
        if (gender === 'M') {
            return (10 * weight) + (6.25 * height) - (5 * age) + 5;
        }
        return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    },

    calcFAO(gender, weight, age) {
        if (gender === 'M') {
            if (age >= 10 && age < 18) return (17.5 * weight) + 651;
            if (age >= 18 && age < 30) return (15.3 * weight) + 679;
            if (age >= 30 && age < 60) return (11.6 * weight) + 879;
            return (13.5 * weight) + 487;
        }
        if (age >= 10 && age < 18) return (12.2 * weight) + 746;
        if (age >= 18 && age < 30) return (14.7 * weight) + 496;
        if (age >= 30 && age < 60) return (8.7 * weight) + 829;
        return (10.5 * weight) + 596;
    },

    // ---------- MODAL DE CÁLCULO ----------
    openCalcModal(patientId) {
        const patients = DB.getPatients();
        if (patients.length === 0) {
            App.showToast('Cadastre um paciente antes de calcular.', 'error');
            return;
        }

        const html = `
            <form id="energy-form" onsubmit="EnergyExpenditure.handleCalc(event)">
                <div class="form-group">
                    <label>Paciente *</label>
                    <select name="patientId" id="energy-patient" required onchange="EnergyExpenditure.fillPatientData()">
                        <option value="">Selecione um paciente</option>
                        ${patients.map(p => `<option value="${p.id}" ${p.id === patientId ? 'selected' : ''}>${App.escapeHtml(p.name)}</option>`).join('')}
                    </select>
                </div>

                <div class="form-row-3">
                    <div class="form-group">
                        <label>Sexo *</label>
                        <select name="gender" id="energy-gender" required>
                            <option value="">Selecione</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Idade (anos) *</label>
                        <input type="number" name="age" id="energy-age" min="1" max="120" required>
                    </div>
                    <div class="form-group">
                        <label>Peso (kg) *</label>
                        <input type="number" name="weight" id="energy-weight" min="10" max="400" step="0.1" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Altura (cm) *</label>
                        <input type="number" name="height" id="energy-height" min="50" max="250" step="0.1" required>
                    </div>
                    <div class="form-group">
                        <label>Fórmula *</label>
                        <select name="formula" id="energy-formula" required>
                            <option value="Harris-Benedict">Harris-Benedict</option>
                            <option value="Mifflin-St Jeor">Mifflin-St Jeor</option>
                            <option value="FAO/OMS">FAO/OMS</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Nível de Atividade Física *</label>
                    <select name="activityFactor" id="energy-activity" required>
                        ${this.activityFactors.map(f => `<option value="${f.value}">${f.label}</option>`).join('')}
                    </select>
                </div>

                <div id="energy-result" class="energy-result-box hidden">
                    <h4>Resultado</h4>
                    <div class="energy-result-grid">
                        <div class="energy-result-item">
                            <span>TMB</span>
                            <strong id="result-tmb">-</strong>
                        </div>
                        <div class="energy-result-item">
                            <span>GET</span>
                            <strong id="result-get">-</strong>
                        </div>
                    </div>
                </div>

                <div style="display:flex;gap:10px;margin-top:16px">
                    <button type="button" class="btn btn-outline" onclick="EnergyExpenditure.previewCalc()">
                        <span class="material-icons-outlined">preview</span> Pré-visualizar
                    </button>
                </div>

                <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar Cálculo</button>
                </div>
            </form>
        `;
        App.openModal('Cálculo de Gasto Energético', html, 'modal-lg');

        if (patientId) {
            setTimeout(() => this.fillPatientData(), 50);
        }
    },

    fillPatientData() {
        const sel = document.getElementById('energy-patient');
        if (!sel || !sel.value) return;
        const p = DB.getPatient(sel.value);
        if (!p) return;

        if (p.gender) document.getElementById('energy-gender').value = p.gender;
        if (p.weight) document.getElementById('energy-weight').value = p.weight;
        if (p.height) document.getElementById('energy-height').value = p.height;
        if (p.birthDate) {
            const age = Patients._calcAge(p.birthDate);
            document.getElementById('energy-age').value = age;
        }
    },

    previewCalc() {
        const form = document.getElementById('energy-form');
        const gender = form.gender.value;
        const age = parseFloat(form.age.value);
        const weight = parseFloat(form.weight.value);
        const height = parseFloat(form.height.value);
        const formula = form.formula.value;
        const af = parseFloat(form.activityFactor.value);

        if (!gender || !age || !weight || !height) {
            App.showToast('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        let tmb = 0;
        switch (formula) {
            case 'Harris-Benedict':
                tmb = this.calcHarrisBenedict(gender, weight, height, age);
                break;
            case 'Mifflin-St Jeor':
                tmb = this.calcMifflinStJeor(gender, weight, height, age);
                break;
            case 'FAO/OMS':
                tmb = this.calcFAO(gender, weight, age);
                break;
        }

        const get = tmb * af;
        document.getElementById('result-tmb').textContent = tmb.toFixed(1) + ' kcal';
        document.getElementById('result-get').textContent = get.toFixed(1) + ' kcal';
        document.getElementById('energy-result').classList.remove('hidden');
    },

    handleCalc(e) {
        e.preventDefault();
        const form = document.getElementById('energy-form');
        const gender = form.gender.value;
        const age = parseFloat(form.age.value);
        const weight = parseFloat(form.weight.value);
        const height = parseFloat(form.height.value);
        const formula = form.formula.value;
        const af = parseFloat(form.activityFactor.value);
        const patientId = form.patientId.value;

        if (!patientId) {
            App.showToast('Selecione um paciente.', 'error');
            return;
        }

        let tmb = 0;
        switch (formula) {
            case 'Harris-Benedict':
                tmb = this.calcHarrisBenedict(gender, weight, height, age);
                break;
            case 'Mifflin-St Jeor':
                tmb = this.calcMifflinStJeor(gender, weight, height, age);
                break;
            case 'FAO/OMS':
                tmb = this.calcFAO(gender, weight, age);
                break;
        }

        const get = tmb * af;

        const data = {
            patientId,
            formula,
            gender,
            age,
            weight,
            height,
            activityFactor: af,
            tmb,
            get,
        };

        DB.addEnergyCalculation(data);
        App.closeModal();
        App.showToast('Cálculo salvo com sucesso!', 'success');
        App.renderPage('energy');
    },

    viewDetail(id) {
        const c = DB.getEnergyCalculation(id);
        if (!c) return;
        const patient = DB.getPatient(c.patientId);
        const patientName = patient ? patient.name : 'Paciente removido';

        const afLabel = this.activityFactors.find(f => f.value === c.activityFactor);

        // Calcular todas as fórmulas para comparação
        const hb = this.calcHarrisBenedict(c.gender, c.weight, c.height, c.age);
        const mj = this.calcMifflinStJeor(c.gender, c.weight, c.height, c.age);
        const fao = this.calcFAO(c.gender, c.weight, c.age);

        const html = `
            <div class="energy-detail">
                <div class="patient-info-grid mb-3">
                    <div class="info-item">
                        <label>Paciente</label>
                        <p>${App.escapeHtml(patientName)}</p>
                    </div>
                    <div class="info-item">
                        <label>Sexo</label>
                        <p>${c.gender === 'M' ? 'Masculino' : 'Feminino'}</p>
                    </div>
                    <div class="info-item">
                        <label>Idade</label>
                        <p>${c.age} anos</p>
                    </div>
                    <div class="info-item">
                        <label>Peso</label>
                        <p>${c.weight} kg</p>
                    </div>
                    <div class="info-item">
                        <label>Altura</label>
                        <p>${c.height} cm</p>
                    </div>
                    <div class="info-item">
                        <label>Nível de Atividade</label>
                        <p>${afLabel ? afLabel.label : c.activityFactor}</p>
                    </div>
                </div>

                <h4 style="margin-bottom:12px">Comparação entre Fórmulas</h4>
                <div class="energy-comparison">
                    <div class="energy-compare-item ${c.formula === 'Harris-Benedict' ? 'active' : ''}">
                        <h5>Harris-Benedict</h5>
                        <p>TMB: <strong>${hb.toFixed(1)} kcal</strong></p>
                        <p>GET: <strong>${(hb * c.activityFactor).toFixed(1)} kcal</strong></p>
                    </div>
                    <div class="energy-compare-item ${c.formula === 'Mifflin-St Jeor' ? 'active' : ''}">
                        <h5>Mifflin-St Jeor</h5>
                        <p>TMB: <strong>${mj.toFixed(1)} kcal</strong></p>
                        <p>GET: <strong>${(mj * c.activityFactor).toFixed(1)} kcal</strong></p>
                    </div>
                    <div class="energy-compare-item ${c.formula === 'FAO/OMS' ? 'active' : ''}">
                        <h5>FAO/OMS</h5>
                        <p>TMB: <strong>${fao.toFixed(1)} kcal</strong></p>
                        <p>GET: <strong>${(fao * c.activityFactor).toFixed(1)} kcal</strong></p>
                    </div>
                </div>

                <div class="plan-totals-bar mt-3">
                    <div class="plan-total">
                        <span>Fórmula Utilizada</span>
                        <strong>${App.escapeHtml(c.formula)}</strong>
                    </div>
                    <div class="plan-total">
                        <span>TMB</span>
                        <strong>${c.tmb.toFixed(1)} kcal</strong>
                    </div>
                    <div class="plan-total">
                        <span>GET</span>
                        <strong>${c.get.toFixed(1)} kcal</strong>
                    </div>
                </div>
            </div>
        `;
        App.openModal('Detalhes do Cálculo Energético', html, 'modal-lg');
    },

    confirmDelete(id) {
        App.openModal('Confirmar Exclusão', `
            <p>Tem certeza que deseja excluir este cálculo?</p>
            <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
                <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-danger" onclick="EnergyExpenditure.doDelete('${id}')">Excluir</button>
            </div>
        `);
    },

    doDelete(id) {
        DB.removeEnergyCalculation(id);
        App.closeModal();
        App.renderPage('energy');
        App.showToast('Cálculo excluído', 'info');
    },

    // Abrir cálculo direto de um paciente
    openCalcForPatient(patientId) {
        this.openCalcModal(patientId);
    }
};
