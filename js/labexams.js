/* ============================================
   NutreClin - Módulo de Exames Laboratoriais
   ============================================ */

const LabExams = {
    currentView: 'list',

    // Categorias e exames comuns
    examCategories: {
        'Hemograma': [
            { name: 'Hemoglobina', unit: 'g/dL', refMale: '13.0-17.5', refFemale: '12.0-16.0' },
            { name: 'Hematócrito', unit: '%', refMale: '38-50', refFemale: '36-44' },
            { name: 'Leucócitos', unit: '/mm³', refMale: '4.000-11.000', refFemale: '4.000-11.000' },
            { name: 'Plaquetas', unit: '/mm³', refMale: '150.000-400.000', refFemale: '150.000-400.000' },
        ],
        'Perfil Lipídico': [
            { name: 'Colesterol Total', unit: 'mg/dL', refMale: '<190', refFemale: '<190' },
            { name: 'HDL', unit: 'mg/dL', refMale: '>40', refFemale: '>50' },
            { name: 'LDL', unit: 'mg/dL', refMale: '<130', refFemale: '<130' },
            { name: 'Triglicerídeos', unit: 'mg/dL', refMale: '<150', refFemale: '<150' },
            { name: 'VLDL', unit: 'mg/dL', refMale: '<30', refFemale: '<30' },
        ],
        'Glicemia': [
            { name: 'Glicose em jejum', unit: 'mg/dL', refMale: '70-99', refFemale: '70-99' },
            { name: 'Hemoglobina glicada (HbA1c)', unit: '%', refMale: '<5.7', refFemale: '<5.7' },
            { name: 'Insulina em jejum', unit: 'µU/mL', refMale: '2.6-24.9', refFemale: '2.6-24.9' },
            { name: 'HOMA-IR', unit: '-', refMale: '<2.71', refFemale: '<2.71' },
        ],
        'Função Hepática': [
            { name: 'TGO (AST)', unit: 'U/L', refMale: '10-40', refFemale: '10-32' },
            { name: 'TGP (ALT)', unit: 'U/L', refMale: '10-41', refFemale: '10-33' },
            { name: 'GGT', unit: 'U/L', refMale: '8-61', refFemale: '5-36' },
            { name: 'Fosfatase Alcalina', unit: 'U/L', refMale: '40-129', refFemale: '35-104' },
            { name: 'Bilirrubina Total', unit: 'mg/dL', refMale: '0.2-1.2', refFemale: '0.2-1.2' },
        ],
        'Função Renal': [
            { name: 'Ureia', unit: 'mg/dL', refMale: '15-40', refFemale: '15-40' },
            { name: 'Creatinina', unit: 'mg/dL', refMale: '0.7-1.3', refFemale: '0.6-1.1' },
            { name: 'Ácido Úrico', unit: 'mg/dL', refMale: '3.4-7.0', refFemale: '2.4-5.7' },
        ],
        'Função Tireoidiana': [
            { name: 'TSH', unit: 'mUI/L', refMale: '0.4-4.0', refFemale: '0.4-4.0' },
            { name: 'T4 Livre', unit: 'ng/dL', refMale: '0.8-1.8', refFemale: '0.8-1.8' },
            { name: 'T3 Livre', unit: 'pg/mL', refMale: '2.3-4.2', refFemale: '2.3-4.2' },
        ],
        'Vitaminas e Minerais': [
            { name: 'Vitamina D (25-OH)', unit: 'ng/mL', refMale: '30-100', refFemale: '30-100' },
            { name: 'Vitamina B12', unit: 'pg/mL', refMale: '200-900', refFemale: '200-900' },
            { name: 'Ácido Fólico', unit: 'ng/mL', refMale: '3.0-17.0', refFemale: '3.0-17.0' },
            { name: 'Ferro sérico', unit: 'µg/dL', refMale: '65-175', refFemale: '50-170' },
            { name: 'Ferritina', unit: 'ng/mL', refMale: '30-400', refFemale: '13-150' },
            { name: 'Cálcio sérico', unit: 'mg/dL', refMale: '8.5-10.5', refFemale: '8.5-10.5' },
            { name: 'Magnésio', unit: 'mg/dL', refMale: '1.7-2.2', refFemale: '1.7-2.2' },
            { name: 'Zinco', unit: 'µg/dL', refMale: '70-120', refFemale: '70-120' },
        ],
        'Inflamação': [
            { name: 'PCR (Proteína C Reativa)', unit: 'mg/L', refMale: '<3.0', refFemale: '<3.0' },
            { name: 'VHS', unit: 'mm/h', refMale: '<15', refFemale: '<20' },
            { name: 'Homocisteína', unit: 'µmol/L', refMale: '5-15', refFemale: '5-15' },
        ],
    },

    render() {
        return this.renderList();
    },

    renderList() {
        const records = DB.getLabExams();

        return `
            <div class="search-bar">
                <div class="search-input">
                    <span class="material-icons-outlined">search</span>
                    <input type="text" id="search-labexams" placeholder="Buscar por paciente..." oninput="LabExams.filterList()">
                </div>
                <button class="btn btn-primary" onclick="LabExams.openNewModal()">
                    <span class="material-icons-outlined">add_circle</span> Registrar Exames
                </button>
            </div>

            <div class="card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Paciente</th>
                                <th>Data dos Exames</th>
                                <th>Categorias</th>
                                <th>Itens</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="labexams-table-body">
                            ${records.length > 0 ? records.map(r => {
                                const patient = DB.getPatient(r.patientId);
                                const patientName = patient ? patient.name : 'Paciente removido';
                                const categories = [...new Set(r.results.map(x => x.category))];
                                return `
                                    <tr data-lab-row data-name="${App.escapeHtml(patientName.toLowerCase())}">
                                        <td><strong>${App.escapeHtml(patientName)}</strong></td>
                                        <td>${App.formatDate(r.examDate)}</td>
                                        <td>${categories.map(c => `<span class="badge badge-purple" style="margin:2px">${App.escapeHtml(c)}</span>`).join('')}</td>
                                        <td>${r.results.length} exame(s)</td>
                                        <td>
                                            <div class="actions">
                                                <button class="btn-icon" title="Ver resultados" onclick="LabExams.viewRecord('${r.id}')">
                                                    <span class="material-icons-outlined">visibility</span>
                                                </button>
                                                <button class="btn-icon" title="Comparar evolução" onclick="LabExams.compareEvolution('${r.patientId}')">
                                                    <span class="material-icons-outlined">trending_up</span>
                                                </button>
                                                <button class="btn-icon" title="Excluir" onclick="LabExams.confirmDelete('${r.id}')">
                                                    <span class="material-icons-outlined">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('') : `
                                <tr><td colspan="5" class="text-center text-muted" style="padding:40px">Nenhum exame registrado</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    filterList() {
        const query = document.getElementById('search-labexams').value.toLowerCase();
        document.querySelectorAll('[data-lab-row]').forEach(row => {
            const name = row.getAttribute('data-name');
            row.style.display = name.includes(query) ? '' : 'none';
        });
    },

    // ---------- MODAL NOVO REGISTRO ----------
    openNewModal(patientId) {
        const patients = DB.getPatients();
        if (patients.length === 0) {
            App.showToast('Cadastre um paciente primeiro.', 'error');
            return;
        }

        const categoryCheckboxes = Object.keys(this.examCategories).map(cat => `
            <label class="exam-category-check">
                <input type="checkbox" name="categories" value="${cat}" onchange="LabExams.toggleCategory('${cat}', this.checked)">
                <span>${App.escapeHtml(cat)}</span>
            </label>
        `).join('');

        const html = `
            <form id="labexam-form" onsubmit="LabExams.handleSave(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Paciente *</label>
                        <select name="patientId" required>
                            <option value="">Selecione</option>
                            ${patients.map(p => `<option value="${p.id}" ${p.id === patientId ? 'selected' : ''}>${App.escapeHtml(p.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Data dos Exames *</label>
                        <input type="date" name="examDate" required value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>

                <div class="form-group">
                    <label>Selecione as categorias de exames:</label>
                    <div class="exam-categories-grid">
                        ${categoryCheckboxes}
                    </div>
                </div>

                <div id="exam-fields-container"></div>

                <div class="form-group">
                    <label>Observações do laboratório</label>
                    <textarea name="labNotes" rows="2" placeholder="Nome do laboratório, observações..."></textarea>
                </div>

                <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:8px">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar Exames</button>
                </div>
            </form>
        `;
        App.openModal('Registrar Exames Laboratoriais', html, 'modal-xl');
    },

    toggleCategory(category, checked) {
        const container = document.getElementById('exam-fields-container');
        const existingSection = document.getElementById('exam-section-' + category.replace(/\s/g, '_'));

        if (!checked && existingSection) {
            existingSection.remove();
            return;
        }

        if (checked && !existingSection) {
            const exams = this.examCategories[category];
            const section = document.createElement('div');
            section.id = 'exam-section-' + category.replace(/\s/g, '_');
            section.className = 'exam-section card mb-2';
            section.innerHTML = `
                <h4 style="margin-bottom:12px;color:var(--primary)">${App.escapeHtml(category)}</h4>
                <div class="exam-fields-grid">
                    ${exams.map(ex => `
                        <div class="exam-field-item">
                            <label>${App.escapeHtml(ex.name)} <span class="text-muted text-small">(${App.escapeHtml(ex.unit)})</span></label>
                            <input type="number" step="any" name="exam_${ex.name.replace(/[^a-zA-Z0-9]/g, '_')}" data-category="${category}" data-exam-name="${App.escapeHtml(ex.name)}" data-unit="${App.escapeHtml(ex.unit)}" placeholder="Ref: ${App.escapeHtml(ex.refMale)}">
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(section);
        }
    },

    handleSave(e) {
        e.preventDefault();
        const form = document.getElementById('labexam-form');
        const patientId = form.patientId.value;
        const examDate = form.examDate.value;
        const labNotes = form.labNotes.value.trim();

        // Coletar resultados
        const results = [];
        form.querySelectorAll('[data-exam-name]').forEach(input => {
            if (input.value) {
                results.push({
                    category: input.dataset.category,
                    name: input.dataset.examName,
                    value: parseFloat(input.value),
                    unit: input.dataset.unit,
                });
            }
        });

        if (results.length === 0) {
            App.showToast('Preencha pelo menos um resultado.', 'error');
            return;
        }

        DB.addLabExam({ patientId, examDate, results, labNotes });
        App.closeModal();
        App.showToast('Exames registrados com sucesso!', 'success');
        App.renderPage('labexams');
    },

    viewRecord(id) {
        const record = DB.getLabExam(id);
        if (!record) return;
        const patient = DB.getPatient(record.patientId);
        const patientName = patient ? patient.name : 'Paciente removido';
        const gender = patient ? patient.gender : 'M';

        // Agrupar por categoria
        const grouped = {};
        record.results.forEach(r => {
            if (!grouped[r.category]) grouped[r.category] = [];
            grouped[r.category].push(r);
        });

        let html = `
            <div class="mb-3">
                <strong>${App.escapeHtml(patientName)}</strong>
                <span class="text-muted"> · Data: ${App.formatDate(record.examDate)}</span>
            </div>
        `;

        Object.keys(grouped).forEach(cat => {
            html += `
                <div class="exam-result-category mb-2">
                    <h4 style="color:var(--primary);margin-bottom:8px">${App.escapeHtml(cat)}</h4>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Exame</th>
                                    <th>Resultado</th>
                                    <th>Unidade</th>
                                    <th>Referência</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${grouped[cat].map(r => {
                                    const examDef = this._findExamDef(cat, r.name);
                                    const ref = examDef ? (gender === 'F' ? examDef.refFemale : examDef.refMale) : '-';
                                    return `
                                        <tr>
                                            <td>${App.escapeHtml(r.name)}</td>
                                            <td><strong>${r.value}</strong></td>
                                            <td>${App.escapeHtml(r.unit)}</td>
                                            <td class="text-muted">${App.escapeHtml(ref)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });

        if (record.labNotes) {
            html += `<div class="mt-2"><strong>Observações:</strong> ${App.escapeHtml(record.labNotes)}</div>`;
        }

        App.openModal('Resultados dos Exames', html, 'modal-lg');
    },

    _findExamDef(category, name) {
        const exams = this.examCategories[category];
        if (!exams) return null;
        return exams.find(e => e.name === name) || null;
    },

    // ---------- COMPARAÇÃO DE EVOLUÇÃO ----------
    compareEvolution(patientId) {
        const patient = DB.getPatient(patientId);
        const patientName = patient ? patient.name : 'Paciente';
        const allRecords = DB.getLabExams()
            .filter(r => r.patientId === patientId)
            .sort((a, b) => a.examDate.localeCompare(b.examDate));

        if (allRecords.length < 2) {
            App.showToast('São necessários pelo menos 2 registros para comparação.', 'info');
            return;
        }

        // Coletar todos os exames únicos
        const examMap = {};
        allRecords.forEach(record => {
            record.results.forEach(r => {
                const key = r.category + '|' + r.name;
                if (!examMap[key]) {
                    examMap[key] = { category: r.category, name: r.name, unit: r.unit, values: [] };
                }
                examMap[key].values.push({ date: record.examDate, value: r.value });
            });
        });

        // Mostrar apenas exames com mais de 1 valor
        const multiExams = Object.values(examMap).filter(e => e.values.length > 1);

        if (multiExams.length === 0) {
            App.showToast('Não há exames repetidos para comparação.', 'info');
            return;
        }

        // Agrupar por categoria
        const grouped = {};
        multiExams.forEach(e => {
            if (!grouped[e.category]) grouped[e.category] = [];
            grouped[e.category].push(e);
        });

        let html = `<div class="mb-3"><strong>Evolução de ${App.escapeHtml(patientName)}</strong></div>`;

        Object.keys(grouped).forEach(cat => {
            html += `<h4 style="color:var(--primary);margin:16px 0 8px">${App.escapeHtml(cat)}</h4>`;
            html += '<div class="table-container"><table><thead><tr><th>Exame</th>';

            // Coletar datas únicas
            const dates = [...new Set(allRecords.map(r => r.examDate))].sort();
            dates.forEach(d => {
                html += `<th>${App.formatDate(d)}</th>`;
            });
            html += '<th>Tendência</th></tr></thead><tbody>';

            grouped[cat].forEach(exam => {
                html += `<tr><td><strong>${App.escapeHtml(exam.name)}</strong> <span class="text-muted text-small">(${App.escapeHtml(exam.unit)})</span></td>`;
                dates.forEach(d => {
                    const found = exam.values.find(v => v.date === d);
                    html += `<td>${found ? found.value : '-'}</td>`;
                });

                // Calcular tendência
                const vals = exam.values.map(v => v.value);
                const first = vals[0];
                const last = vals[vals.length - 1];
                let trend = '';
                if (last > first) trend = '<span class="material-icons-outlined" style="color:var(--warning);font-size:18px">trending_up</span>';
                else if (last < first) trend = '<span class="material-icons-outlined" style="color:var(--info);font-size:18px">trending_down</span>';
                else trend = '<span class="material-icons-outlined" style="color:var(--success);font-size:18px">trending_flat</span>';
                html += `<td>${trend}</td></tr>`;
            });

            html += '</tbody></table></div>';
        });

        App.openModal('Evolução dos Exames', html, 'modal-xl');
    },

    confirmDelete(id) {
        App.openModal('Confirmar Exclusão', `
            <p>Tem certeza que deseja excluir este registro de exames?</p>
            <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
                <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-danger" onclick="LabExams.doDelete('${id}')">Excluir</button>
            </div>
        `);
    },

    doDelete(id) {
        DB.removeLabExam(id);
        App.closeModal();
        App.renderPage('labexams');
        App.showToast('Exames excluídos', 'info');
    },

    openForPatient(patientId) {
        this.openNewModal(patientId);
    }
};
