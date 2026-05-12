/* ============================================
   NutriSys - Módulo de Evolução Corporal
   Acompanhamento de peso, gordura, circunferências e gráficos
   ============================================ */

const BodyEvolution = {
    currentView: 'list',
    currentPatientId: null,

    MEASUREMENTS: [
        { key: 'weight', label: 'Peso (kg)', unit: 'kg', icon: 'monitor_weight' },
        { key: 'bodyFat', label: 'Gordura Corporal (%)', unit: '%', icon: 'water_drop' },
        { key: 'waist', label: 'Cintura (cm)', unit: 'cm', icon: 'straighten' },
        { key: 'hip', label: 'Quadril (cm)', unit: 'cm', icon: 'straighten' },
        { key: 'arm', label: 'Braço (cm)', unit: 'cm', icon: 'straighten' },
        { key: 'thigh', label: 'Coxa (cm)', unit: 'cm', icon: 'straighten' },
        { key: 'chest', label: 'Tórax (cm)', unit: 'cm', icon: 'straighten' },
        { key: 'abdomen', label: 'Abdômen (cm)', unit: 'cm', icon: 'straighten' },
    ],

    render() {
        const patients = DB.getPatients();
        if (this.currentView === 'patient' && this.currentPatientId) {
            return this.renderPatientEvolution(this.currentPatientId);
        }
        return this.renderPatientSelect(patients);
    },

    renderPatientSelect(patients) {
        return `
            <div class="card">
                <h3 class="mb-2">Selecione o Paciente</h3>
                <p class="text-muted mb-3">Escolha um paciente para ver ou registrar a evolução corporal</p>
                ${patients.length > 0 ? `
                    <div class="search-input mb-3">
                        <span class="material-icons-outlined">search</span>
                        <input type="text" id="evo-search" placeholder="Buscar paciente..." oninput="BodyEvolution.filterPatients()">
                    </div>
                    <div class="patient-select-grid" id="evo-patient-grid">
                        ${patients.map(p => {
                            const records = DB.getBodyEvolutions().filter(e => e.patientId === p.id);
                            const last = records.length > 0 ? records.sort((a,b) => b.date.localeCompare(a.date))[0] : null;
                            return `
                                <div class="patient-select-card" data-evo-patient data-name="${App.escapeHtml(p.name.toLowerCase())}" onclick="BodyEvolution.selectPatient('${p.id}')">
                                    <div class="patient-select-avatar">${p.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
                                    <div class="patient-select-info">
                                        <strong>${App.escapeHtml(p.name)}</strong>
                                        <span class="text-muted text-small">${records.length} registro(s) ${last ? '· Último: ' + App.formatDate(last.date) : ''}</span>
                                    </div>
                                    <span class="material-icons-outlined" style="color:var(--primary)">chevron_right</span>
                                </div>`;
                        }).join('')}
                    </div>
                ` : '<div class="empty-state"><span class="material-icons-outlined">people</span><h3>Nenhum paciente cadastrado</h3></div>'}
            </div>`;
    },

    filterPatients() {
        const q = document.getElementById('evo-search').value.toLowerCase();
        document.querySelectorAll('[data-evo-patient]').forEach(el => {
            el.style.display = el.getAttribute('data-name').includes(q) ? '' : 'none';
        });
    },

    selectPatient(id) {
        this.currentView = 'patient';
        this.currentPatientId = id;
        App.renderPage('evolution');
    },

    renderPatientEvolution(patientId) {
        const patient = DB.getPatient(patientId);
        if (!patient) return '<p>Paciente não encontrado.</p>';

        const records = DB.getBodyEvolutions()
            .filter(e => e.patientId === patientId)
            .sort((a, b) => a.date.localeCompare(b.date));

        // Calcular variações
        const first = records[0];
        const last = records[records.length - 1];
        const diffWeight = (first && last && first.weight && last.weight) ? (last.weight - first.weight) : null;
        const diffFat = (first && last && first.bodyFat && last.bodyFat) ? (last.bodyFat - first.bodyFat) : null;

        return `
            <button class="btn btn-outline mb-3" onclick="BodyEvolution.backToList()">
                <span class="material-icons-outlined">arrow_back</span> Voltar
            </button>

            <div class="flex items-center justify-between mb-3">
                <div>
                    <h2 style="font-size:1.4rem">Evolução Corporal — ${App.escapeHtml(patient.name)}</h2>
                    <p class="text-muted">${records.length} registro(s)</p>
                </div>
                <button class="btn btn-primary" onclick="BodyEvolution.openAddModal('${patientId}')">
                    <span class="material-icons-outlined">add</span> Novo Registro
                </button>
            </div>

            ${records.length >= 2 ? `
            <div class="evo-summary-grid mb-3">
                ${diffWeight !== null ? `
                <div class="evo-summary-card ${diffWeight < 0 ? 'evo-positive' : diffWeight > 0 ? 'evo-negative' : ''}">
                    <span class="material-icons-outlined">monitor_weight</span>
                    <div>
                        <span class="text-small text-muted">Variação de Peso</span>
                        <strong>${diffWeight > 0 ? '+' : ''}${diffWeight.toFixed(1)} kg</strong>
                    </div>
                </div>` : ''}
                ${diffFat !== null ? `
                <div class="evo-summary-card ${diffFat < 0 ? 'evo-positive' : diffFat > 0 ? 'evo-negative' : ''}">
                    <span class="material-icons-outlined">water_drop</span>
                    <div>
                        <span class="text-small text-muted">Variação de %GC</span>
                        <strong>${diffFat > 0 ? '+' : ''}${diffFat.toFixed(1)}%</strong>
                    </div>
                </div>` : ''}
                <div class="evo-summary-card">
                    <span class="material-icons-outlined">calendar_today</span>
                    <div>
                        <span class="text-small text-muted">Período</span>
                        <strong>${App.formatDate(first.date)} — ${App.formatDate(last.date)}</strong>
                    </div>
                </div>
            </div>` : ''}

            <!-- GRÁFICOS -->
            ${records.length >= 2 ? `
            <div class="dashboard-grid mb-3">
                <div class="card">
                    <div class="card-header"><h3>Peso (kg)</h3></div>
                    <div class="chart-container" id="chart-weight"></div>
                </div>
                <div class="card">
                    <div class="card-header"><h3>Gordura Corporal (%)</h3></div>
                    <div class="chart-container" id="chart-fat"></div>
                </div>
            </div>
            <div class="card mb-3">
                <div class="card-header"><h3>Circunferências (cm)</h3></div>
                <div class="chart-container" id="chart-circ"></div>
            </div>` : ''}

            <!-- TABELA HISTÓRICO -->
            <div class="card">
                <div class="card-header"><h3>Histórico Completo</h3></div>
                ${records.length > 0 ? `
                <div class="table-container">
                    <table>
                        <thead><tr>
                            <th>Data</th><th>Peso</th><th>%GC</th><th>Cintura</th><th>Quadril</th><th>Braço</th><th>Coxa</th><th>Tórax</th><th>Abdômen</th><th></th>
                        </tr></thead>
                        <tbody>
                            ${records.slice().reverse().map(r => `
                                <tr>
                                    <td><strong>${App.formatDate(r.date)}</strong></td>
                                    <td>${r.weight || '-'}</td>
                                    <td>${r.bodyFat || '-'}</td>
                                    <td>${r.waist || '-'}</td>
                                    <td>${r.hip || '-'}</td>
                                    <td>${r.arm || '-'}</td>
                                    <td>${r.thigh || '-'}</td>
                                    <td>${r.chest || '-'}</td>
                                    <td>${r.abdomen || '-'}</td>
                                    <td>
                                        <button class="btn-icon" title="Excluir" onclick="BodyEvolution.confirmDelete('${r.id}', '${patientId}')">
                                            <span class="material-icons-outlined" style="font-size:18px">delete</span>
                                        </button>
                                    </td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>` : '<p class="text-muted text-small">Nenhum registro. Clique em "Novo Registro" para começar o acompanhamento.</p>'}
            </div>`;

        // Renderizar gráficos após HTML
        setTimeout(() => this._renderCharts(records), 50);

        // Nota: retornamos o HTML, os gráficos são renderizados pelo setTimeout acima
        // Precisamos retornar o HTML antes, então re-estruturamos:
    },

    // Sobrescrever render para lidar com gráficos pós-render
    _afterRender() {
        if (this.currentView === 'patient' && this.currentPatientId) {
            const records = DB.getBodyEvolutions()
                .filter(e => e.patientId === this.currentPatientId)
                .sort((a, b) => a.date.localeCompare(b.date));
            if (records.length >= 2) this._renderCharts(records);
        }
    },

    // =============================================
    // GRÁFICOS SVG SIMPLES
    // =============================================
    _renderCharts(records) {
        if (records.length < 2) return;

        // Gráfico de peso
        const weightData = records.filter(r => r.weight).map(r => ({ label: this._shortDate(r.date), value: r.weight }));
        const weightEl = document.getElementById('chart-weight');
        if (weightEl && weightData.length >= 2) weightEl.innerHTML = this._buildLineChart(weightData, '#00b894', 'kg');

        // Gráfico de gordura
        const fatData = records.filter(r => r.bodyFat).map(r => ({ label: this._shortDate(r.date), value: r.bodyFat }));
        const fatEl = document.getElementById('chart-fat');
        if (fatEl && fatData.length >= 2) fatEl.innerHTML = this._buildLineChart(fatData, '#6c5ce7', '%');

        // Gráfico de circunferências
        const circEl = document.getElementById('chart-circ');
        if (circEl) {
            const lines = [];
            const colors = { waist: '#e74c3c', hip: '#3498db', abdomen: '#f39c12', arm: '#00b894', thigh: '#6c5ce7', chest: '#fd79a8' };
            const labels = { waist: 'Cintura', hip: 'Quadril', abdomen: 'Abdômen', arm: 'Braço', thigh: 'Coxa', chest: 'Tórax' };
            ['waist', 'hip', 'abdomen', 'arm', 'thigh', 'chest'].forEach(key => {
                const data = records.filter(r => r[key]).map(r => ({ label: this._shortDate(r.date), value: r[key] }));
                if (data.length >= 2) lines.push({ data, color: colors[key], name: labels[key] });
            });
            if (lines.length > 0) circEl.innerHTML = this._buildMultiLineChart(lines, 'cm');
        }
    },

    _shortDate(d) {
        if (!d) return '';
        const parts = d.split('-');
        return parts[2] + '/' + parts[1];
    },

    _buildLineChart(data, color, unit) {
        const W = 500, H = 200, P = 40;
        const values = data.map(d => d.value);
        const min = Math.min(...values) * 0.95;
        const max = Math.max(...values) * 1.05;
        const range = max - min || 1;

        const points = data.map((d, i) => {
            const x = P + (i / (data.length - 1)) * (W - 2 * P);
            const y = H - P - ((d.value - min) / range) * (H - 2 * P);
            return { x, y, ...d };
        });

        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

        let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;font-family:Inter,sans-serif">`;
        // Grid lines
        for (let i = 0; i <= 4; i++) {
            const y = P + (i / 4) * (H - 2 * P);
            const val = (max - (i / 4) * range).toFixed(1);
            svg += `<line x1="${P}" y1="${y}" x2="${W-P}" y2="${y}" stroke="#eee" stroke-width="1"/>`;
            svg += `<text x="${P-5}" y="${y+4}" text-anchor="end" fill="#999" font-size="10">${val}</text>`;
        }
        // Line
        svg += `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
        // Area
        const areaD = pathD + ` L${points[points.length-1].x},${H-P} L${points[0].x},${H-P} Z`;
        svg += `<path d="${areaD}" fill="${color}" opacity="0.08"/>`;
        // Points + labels
        points.forEach(p => {
            svg += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${color}" stroke="#fff" stroke-width="2"/>`;
            svg += `<text x="${p.x}" y="${p.y - 10}" text-anchor="middle" fill="${color}" font-size="10" font-weight="600">${p.value}${unit}</text>`;
        });
        // X labels
        points.forEach(p => {
            svg += `<text x="${p.x}" y="${H - 8}" text-anchor="middle" fill="#999" font-size="9">${p.label}</text>`;
        });
        svg += '</svg>';
        return svg;
    },

    _buildMultiLineChart(lines, unit) {
        const W = 600, H = 250, P = 50;
        // Find global min/max
        let allVals = [];
        lines.forEach(l => l.data.forEach(d => allVals.push(d.value)));
        const min = Math.min(...allVals) * 0.9;
        const max = Math.max(...allVals) * 1.1;
        const range = max - min || 1;
        // Use longest series for X axis
        const maxLen = Math.max(...lines.map(l => l.data.length));
        const xLabels = lines.reduce((a, l) => l.data.length > a.length ? l.data : a, []).map(d => d.label);

        let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;font-family:Inter,sans-serif">`;
        // Grid
        for (let i = 0; i <= 4; i++) {
            const y = P + (i / 4) * (H - 2 * P);
            const val = (max - (i / 4) * range).toFixed(1);
            svg += `<line x1="${P}" y1="${y}" x2="${W-P}" y2="${y}" stroke="#eee" stroke-width="1"/>`;
            svg += `<text x="${P-5}" y="${y+4}" text-anchor="end" fill="#999" font-size="9">${val}</text>`;
        }
        // Lines
        lines.forEach(line => {
            const pts = line.data.map((d, i) => {
                const x = P + (i / (line.data.length - 1)) * (W - 2 * P);
                const y = H - P - ((d.value - min) / range) * (H - 2 * P);
                return { x, y };
            });
            const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            svg += `<path d="${pathD}" fill="none" stroke="${line.color}" stroke-width="2" stroke-linecap="round"/>`;
            pts.forEach(p => svg += `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${line.color}" stroke="#fff" stroke-width="1.5"/>`);
        });
        // X labels
        xLabels.forEach((label, i) => {
            const x = P + (i / (xLabels.length - 1)) * (W - 2 * P);
            svg += `<text x="${x}" y="${H - 8}" text-anchor="middle" fill="#999" font-size="9">${label}</text>`;
        });
        // Legend
        let lx = P;
        lines.forEach(line => {
            svg += `<rect x="${lx}" y="5" width="12" height="12" rx="2" fill="${line.color}"/>`;
            svg += `<text x="${lx + 16}" y="15" fill="#666" font-size="10">${line.name}</text>`;
            lx += line.name.length * 7 + 28;
        });
        svg += '</svg>';
        return svg;
    },

    // =============================================
    // ADICIONAR REGISTRO
    // =============================================
    openAddModal(patientId) {
        App.openModal('Novo Registro de Evolução', `
            <form id="evo-form" onsubmit="BodyEvolution.handleSave(event, '${patientId}')">
                <div class="form-group mb-2">
                    <label>Data *</label>
                    <input type="date" name="date" required value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Peso (kg)</label>
                        <input type="number" name="weight" step="0.1" min="0" placeholder="Ex: 72.5">
                    </div>
                    <div class="form-group">
                        <label>Gordura Corporal (%)</label>
                        <input type="number" name="bodyFat" step="0.1" min="0" max="80" placeholder="Ex: 22.5">
                    </div>
                </div>
                <h4 class="mb-2 mt-2" style="color:var(--primary)">Circunferências (cm)</h4>
                <div class="form-row-3">
                    <div class="form-group"><label>Cintura</label><input type="number" name="waist" step="0.1" min="0" placeholder="cm"></div>
                    <div class="form-group"><label>Quadril</label><input type="number" name="hip" step="0.1" min="0" placeholder="cm"></div>
                    <div class="form-group"><label>Braço</label><input type="number" name="arm" step="0.1" min="0" placeholder="cm"></div>
                </div>
                <div class="form-row-3">
                    <div class="form-group"><label>Coxa</label><input type="number" name="thigh" step="0.1" min="0" placeholder="cm"></div>
                    <div class="form-group"><label>Tórax</label><input type="number" name="chest" step="0.1" min="0" placeholder="cm"></div>
                    <div class="form-group"><label>Abdômen</label><input type="number" name="abdomen" step="0.1" min="0" placeholder="cm"></div>
                </div>
                <div class="form-group mt-2">
                    <label>Observações</label>
                    <textarea name="notes" rows="2" maxlength="300" placeholder="Notas sobre o registro..."></textarea>
                </div>
                <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:8px">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar Registro</button>
                </div>
            </form>`, 'modal-lg');
    },

    handleSave(e, patientId) {
        e.preventDefault();
        const form = document.getElementById('evo-form');
        const data = {
            patientId: patientId,
            date: form.date.value,
            weight: parseFloat(form.weight.value) || null,
            bodyFat: parseFloat(form.bodyFat.value) || null,
            waist: parseFloat(form.waist.value) || null,
            hip: parseFloat(form.hip.value) || null,
            arm: parseFloat(form.arm.value) || null,
            thigh: parseFloat(form.thigh.value) || null,
            chest: parseFloat(form.chest.value) || null,
            abdomen: parseFloat(form.abdomen.value) || null,
            notes: form.notes.value.trim(),
        };
        if (!data.date) { App.showToast('Informe a data', 'error'); return; }
        DB.addBodyEvolution(data);
        App.closeModal();
        App.renderPage('evolution');
        App.showToast('Registro salvo com sucesso!', 'success');
    },

    openForPatient(patientId) {
        this.currentView = 'patient';
        this.currentPatientId = patientId;
        App.navigate('evolution');
    },

    confirmDelete(id, patientId) {
        App.openModal('Confirmar Exclusão', `
            <p>Excluir este registro de evolução?</p>
            <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
                <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-danger" onclick="BodyEvolution.doDelete('${id}', '${patientId}')">Excluir</button>
            </div>`);
    },

    doDelete(id, patientId) {
        DB.removeBodyEvolution(id);
        App.closeModal();
        App.renderPage('evolution');
        App.showToast('Registro excluído', 'info');
    },

    backToList() {
        this.currentView = 'list';
        this.currentPatientId = null;
        App.renderPage('evolution');
    }
};
