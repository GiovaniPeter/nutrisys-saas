/* ============================================
   NutriSys - Relatório PDF
   Gera relatório bonito de evolução, cardápio, anamnese
   ============================================ */

const Reports = {

    render() {
        const patients = DB.getPatients();
        return `
            <div class="section-header flex justify-between items-center mb-3">
                <div>
                    <h3 style="font-weight:700;font-size:1.15rem">Relatórios PDF</h3>
                    <p class="text-muted text-small">Gere relatórios profissionais para seus pacientes</p>
                </div>
            </div>

            <div class="card mb-3" style="padding:24px">
                <div class="form-row">
                    <div class="form-group" style="flex:2">
                        <label>Paciente</label>
                        <select id="rpt-patient" class="form-control" onchange="Reports.onPatientChange()">
                            <option value="">Selecione um paciente...</option>
                            ${patients.map(p => `<option value="${p.id}">${App.escapeHtml(p.name)}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <div id="rpt-options" style="display:none">
                <div class="reports-grid">
                    <div class="report-type-card" onclick="Reports.generateEvolution()">
                        <span class="material-icons-outlined" style="font-size:48px;color:#057b64">trending_up</span>
                        <h4>Evolução Corporal</h4>
                        <p>Peso, medidas, IMC, % gordura ao longo do tempo com gráficos de progresso.</p>
                        <span class="btn btn-primary btn-sm mt-1">
                            <span class="material-icons-outlined">picture_as_pdf</span> Gerar PDF
                        </span>
                    </div>
                    <div class="report-type-card" onclick="Reports.generateMealPlan()">
                        <span class="material-icons-outlined" style="font-size:48px;color:#6c5ce7">restaurant_menu</span>
                        <h4>Cardápio Completo</h4>
                        <p>Plano alimentar completo com macros, horários, porções e observações.</p>
                        <span class="btn btn-primary btn-sm mt-1">
                            <span class="material-icons-outlined">picture_as_pdf</span> Gerar PDF
                        </span>
                    </div>
                    <div class="report-type-card" onclick="Reports.generateAnamnesis()">
                        <span class="material-icons-outlined" style="font-size:48px;color:#f39c12">assignment</span>
                        <h4>Anamnese</h4>
                        <p>Histórico clínico completo do paciente com todos os dados registrados.</p>
                        <span class="btn btn-primary btn-sm mt-1">
                            <span class="material-icons-outlined">picture_as_pdf</span> Gerar PDF
                        </span>
                    </div>
                    <div class="report-type-card" onclick="Reports.generateComplete()">
                        <span class="material-icons-outlined" style="font-size:48px;color:#e74c3c">summarize</span>
                        <h4>Relatório Completo</h4>
                        <p>Tudo em um único PDF: dados pessoais, evolução, cardápio e anamnese.</p>
                        <span class="btn btn-primary btn-sm mt-1">
                            <span class="material-icons-outlined">picture_as_pdf</span> Gerar PDF
                        </span>
                    </div>
                </div>
            </div>
        `;
    },

    onPatientChange() {
        const pid = document.getElementById('rpt-patient').value;
        document.getElementById('rpt-options').style.display = pid ? 'block' : 'none';
    },

    _getPatientId() {
        return document.getElementById('rpt-patient')?.value || '';
    },

    // ───── CORES E ESTILO DO PDF ─────
    _css() {
        return `
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; color: #2d3436; font-size: 12px; }
            .pdf-header { background: linear-gradient(135deg, #057b64, #00a381); color: #fff; padding: 32px; text-align: center; }
            .pdf-header h1 { margin: 0 0 4px; font-size: 22px; }
            .pdf-header p { margin: 0; opacity: 0.85; font-size: 12px; }
            .pdf-body { padding: 28px 32px; }
            .pdf-section { margin-bottom: 24px; }
            .pdf-section h2 { font-size: 15px; color: #057b64; border-bottom: 2px solid #057b64; padding-bottom: 6px; margin-bottom: 12px; }
            .pdf-section h3 { font-size: 13px; color: #333; margin: 12px 0 6px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            th, td { padding: 6px 10px; text-align: left; border-bottom: 1px solid #eee; font-size: 11px; }
            th { background: #f5f6fa; font-weight: 600; color: #333; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
            .info-item { padding: 8px 12px; background: #f8f9fb; border-radius: 6px; }
            .info-item strong { display: block; font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 2px; }
            .chart-bar-container { display: flex; align-items: flex-end; gap: 6px; height: 120px; margin: 12px 0; padding: 8px; background: #f8f9fb; border-radius: 8px; }
            .chart-bar { flex: 1; border-radius: 4px 4px 0 0; text-align: center; font-size: 9px; font-weight: 600; color: #fff; min-width: 20px; position: relative; }
            .chart-bar span { position: absolute; top: -16px; left: 0; right: 0; color: #333; font-size: 9px; }
            .macro-row { display: flex; gap: 16px; margin-bottom: 8px; }
            .macro-box { flex: 1; text-align: center; padding: 10px; border-radius: 8px; background: #f5f6fa; }
            .macro-box strong { display: block; font-size: 18px; }
            .macro-box small { color: #888; }
            .pdf-footer { text-align: center; padding: 16px; font-size: 10px; color: #999; border-top: 1px solid #eee; margin-top: 24px; }
            .meal-block { margin-bottom: 12px; padding: 12px; background: #f8f9fb; border-radius: 8px; border-left: 4px solid #057b64; }
            .meal-block h4 { margin: 0 0 8px; font-size: 12px; color: #057b64; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        `;
    },

    _header(title, subtitle) {
        const settings = DB.getSettings();
        const clinicName = settings.clinicName || 'NutriSys';
        return `<div class="pdf-header">
            <h1>${App.escapeHtml(clinicName)}</h1>
            <p>${App.escapeHtml(title)}${subtitle ? ' — ' + App.escapeHtml(subtitle) : ''}</p>
            <p style="margin-top:4px;font-size:10px">Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}</p>
        </div>`;
    },

    _footer() {
        const settings = DB.getSettings();
        const user = Auth.getCurrentUser();
        return `<div class="pdf-footer">
            ${user ? App.escapeHtml(user.name) + (user.crn ? ' · CRN ' + App.escapeHtml(user.crn) : '') + ' · ' : ''}
            ${App.escapeHtml(settings.clinicName || 'NutriSys')} · Documento gerado automaticamente pelo NutriSys
        </div>`;
    },

    _patientInfo(patient) {
        const age = patient.birthDate ? Math.floor((Date.now() - new Date(patient.birthDate)) / 31557600000) : '?';
        const imc = patient.weight && patient.height ? (patient.weight / (patient.height / 100) ** 2).toFixed(1) : '?';
        return `
            <div class="pdf-section">
                <h2>Dados do Paciente</h2>
                <div class="info-grid">
                    <div class="info-item"><strong>Nome</strong>${App.escapeHtml(patient.name)}</div>
                    <div class="info-item"><strong>E-mail</strong>${App.escapeHtml(patient.email || '—')}</div>
                    <div class="info-item"><strong>Idade</strong>${age} anos</div>
                    <div class="info-item"><strong>Sexo</strong>${patient.gender === 'F' ? 'Feminino' : 'Masculino'}</div>
                    <div class="info-item"><strong>Altura</strong>${patient.height ? patient.height + ' cm' : '—'}</div>
                    <div class="info-item"><strong>Peso</strong>${patient.weight ? patient.weight + ' kg' : '—'}</div>
                    <div class="info-item"><strong>IMC</strong>${imc}</div>
                    <div class="info-item"><strong>Objetivo</strong>${App.escapeHtml(patient.goal || '—')}</div>
                </div>
            </div>
        `;
    },

    _open(html) {
        const w = window.open('', '_blank');
        w.document.write(html);
        w.document.close();
        setTimeout(() => w.print(), 600);
    },

    // ───── EVOLUÇÃO CORPORAL ─────
    generateEvolution() {
        const pid = this._getPatientId();
        if (!pid) return;
        const patient = DB.getPatient(pid);
        if (!patient) return App.showToast('Paciente não encontrado', 'error');

        const evolutions = DB.getBodyEvolutions().filter(e => e.patientId === pid)
            .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt));

        if (!evolutions.length) return App.showToast('Nenhum registro de evolução encontrado', 'error');

        const weights = evolutions.map(e => e.weight).filter(Boolean);
        const maxW = Math.max(...weights);
        const first = evolutions[0];
        const last = evolutions[evolutions.length - 1];
        const diff = last.weight && first.weight ? (last.weight - first.weight).toFixed(1) : '?';

        let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Evolução - ${App.escapeHtml(patient.name)}</title>
            <style>${this._css()}</style></head><body>`;
        html += this._header('Relatório de Evolução Corporal', patient.name);
        html += `<div class="pdf-body">`;
        html += this._patientInfo(patient);

        // Resumo
        html += `<div class="pdf-section"><h2>Resumo da Evolução</h2>
            <div class="macro-row">
                <div class="macro-box"><strong>${first.weight || '?'} kg</strong><small>Peso Inicial</small></div>
                <div class="macro-box"><strong>${last.weight || '?'} kg</strong><small>Peso Atual</small></div>
                <div class="macro-box"><strong>${diff} kg</strong><small>Variação</small></div>
                <div class="macro-box"><strong>${evolutions.length}</strong><small>Registros</small></div>
            </div>`;

        // Chart bars
        html += `<h3>Evolução de Peso</h3><div class="chart-bar-container">`;
        evolutions.forEach(e => {
            const h = maxW ? (e.weight / maxW * 100) : 10;
            const date = new Date(e.date || e.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            html += `<div class="chart-bar" style="height:${h}%;background:#057b64"><span>${e.weight}kg</span><div style="position:absolute;bottom:-16px;left:0;right:0;color:#888;font-size:8px">${date}</div></div>`;
        });
        html += `</div></div>`;

        // Tabela de registros
        html += `<div class="pdf-section"><h2>Histórico de Registros</h2>
            <table><thead><tr><th>Data</th><th>Peso</th><th>% Gordura</th><th>Cintura</th><th>Quadril</th><th>Braço</th></tr></thead><tbody>`;
        evolutions.forEach(e => {
            const d = new Date(e.date || e.createdAt).toLocaleDateString('pt-BR');
            html += `<tr><td>${d}</td><td>${e.weight || '—'} kg</td><td>${e.bodyFat || '—'}%</td>
                <td>${e.waist || '—'} cm</td><td>${e.hip || '—'} cm</td><td>${e.arm || '—'} cm</td></tr>`;
        });
        html += `</tbody></table></div>`;

        html += `</div>` + this._footer() + `</body></html>`;
        this._open(html);
        App.showToast('Relatório de evolução gerado!', 'success');
    },

    // ───── CARDÁPIO ─────
    generateMealPlan() {
        const pid = this._getPatientId();
        if (!pid) return;
        const patient = DB.getPatient(pid);
        if (!patient) return App.showToast('Paciente não encontrado', 'error');

        const plans = DB.getMealPlans().filter(p => p.patientId === pid);
        if (!plans.length) return App.showToast('Nenhum cardápio encontrado', 'error');

        const plan = plans[plans.length - 1]; // mais recente
        const mealLabels = { cafe_manha: '☀️ Café da Manhã', lanche_manha: '🥐 Lanche da Manhã', almoco: '🍛 Almoço', lanche_tarde: '☕ Lanche da Tarde', jantar: '🌙 Jantar', ceia: '🌜 Ceia' };

        let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Cardápio - ${App.escapeHtml(patient.name)}</title>
            <style>${this._css()}</style></head><body>`;
        html += this._header('Plano Alimentar', patient.name);
        html += `<div class="pdf-body">`;
        html += this._patientInfo(patient);

        // Metas
        html += `<div class="pdf-section"><h2>Metas Nutricionais</h2>
            <div class="macro-row">
                <div class="macro-box"><strong>${plan.targetCalories || '—'}</strong><small>Calorias</small></div>
                <div class="macro-box" style="background:#e8f8f5"><strong>${plan.targetProtein || '—'}g</strong><small>Proteína</small></div>
                <div class="macro-box" style="background:#fff3e0"><strong>${plan.targetCarbs || '—'}g</strong><small>Carboidratos</small></div>
                <div class="macro-box" style="background:#ffe8ec"><strong>${plan.targetFat || '—'}g</strong><small>Gorduras</small></div>
            </div></div>`;

        // Refeições
        html += `<div class="pdf-section"><h2>Cardápio: ${App.escapeHtml(plan.name)}</h2>`;
        (plan.meals || []).forEach(meal => {
            if (!meal.foods || !meal.foods.length) return;
            const label = mealLabels[meal.type] || meal.type;
            const mCal = meal.foods.reduce((s, f) => s + (f.calories || 0) * (f.qty || 1), 0);
            const mP = meal.foods.reduce((s, f) => s + (f.protein || 0) * (f.qty || 1), 0);
            const mC = meal.foods.reduce((s, f) => s + (f.carbs || 0) * (f.qty || 1), 0);
            const mF = meal.foods.reduce((s, f) => s + (f.fat || 0) * (f.qty || 1), 0);

            html += `<div class="meal-block"><h4>${label} ${meal.time ? '· ' + meal.time : ''}</h4>
                <table><thead><tr><th>Alimento</th><th>Porção</th><th>Qty</th><th>Kcal</th><th>P</th><th>C</th><th>G</th></tr></thead><tbody>`;
            meal.foods.forEach(f => {
                html += `<tr><td>${App.escapeHtml(f.name)}</td><td>${App.escapeHtml(f.portion || '')}</td>
                    <td>${f.qty || 1}</td><td>${Math.round(f.calories * (f.qty || 1))}</td>
                    <td>${(f.protein * (f.qty || 1)).toFixed(1)}</td><td>${(f.carbs * (f.qty || 1)).toFixed(1)}</td>
                    <td>${(f.fat * (f.qty || 1)).toFixed(1)}</td></tr>`;
            });
            html += `</tbody><tfoot><tr style="font-weight:700"><td colspan="3">Subtotal</td>
                <td>${Math.round(mCal)}</td><td>${mP.toFixed(1)}</td><td>${mC.toFixed(1)}</td><td>${mF.toFixed(1)}</td></tr></tfoot></table></div>`;
        });

        // Total
        const totalCal = (plan.meals || []).reduce((s, m) => s + (m.foods || []).reduce((s2, f) => s2 + (f.calories || 0) * (f.qty || 1), 0), 0);
        const totalP = (plan.meals || []).reduce((s, m) => s + (m.foods || []).reduce((s2, f) => s2 + (f.protein || 0) * (f.qty || 1), 0), 0);
        const totalC = (plan.meals || []).reduce((s, m) => s + (m.foods || []).reduce((s2, f) => s2 + (f.carbs || 0) * (f.qty || 1), 0), 0);
        const totalF = (plan.meals || []).reduce((s, m) => s + (m.foods || []).reduce((s2, f) => s2 + (f.fat || 0) * (f.qty || 1), 0), 0);

        html += `<div class="macro-row" style="margin-top:12px">
            <div class="macro-box" style="background:#057b64;color:#fff"><strong>${Math.round(totalCal)}</strong><small style="color:#fff">Total Kcal</small></div>
            <div class="macro-box"><strong>${totalP.toFixed(1)}g</strong><small>Proteína</small></div>
            <div class="macro-box"><strong>${totalC.toFixed(1)}g</strong><small>Carboidrato</small></div>
            <div class="macro-box"><strong>${totalF.toFixed(1)}g</strong><small>Gordura</small></div>
        </div>`;

        if (plan.observations) {
            html += `<div style="margin-top:16px;padding:12px;background:#f8f9fb;border-radius:8px;font-size:11px"><strong>Observações:</strong> ${App.escapeHtml(plan.observations)}</div>`;
        }
        html += `</div>`;

        html += `</div>` + this._footer() + `</body></html>`;
        this._open(html);
        App.showToast('Relatório de cardápio gerado!', 'success');
    },

    // ───── ANAMNESE ─────
    generateAnamnesis() {
        const pid = this._getPatientId();
        if (!pid) return;
        const patient = DB.getPatient(pid);
        if (!patient) return App.showToast('Paciente não encontrado', 'error');

        const records = DB.getAnamnesisRecords().filter(a => a.patientId === pid);
        if (!records.length) return App.showToast('Nenhuma anamnese registrada', 'error');

        const typeLabels = { health_history: 'Histórico de Saúde', metabolic_screening: 'Rastreio Metabólico', recall_24h: 'Recordatório 24h', intestinal_habits: 'Hábitos Intestinais' };

        let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Anamnese - ${App.escapeHtml(patient.name)}</title>
            <style>${this._css()}</style></head><body>`;
        html += this._header('Relatório de Anamnese', patient.name);
        html += `<div class="pdf-body">`;
        html += this._patientInfo(patient);

        records.forEach(rec => {
            const title = typeLabels[rec.type] || rec.type;
            const date = new Date(rec.createdAt).toLocaleDateString('pt-BR');
            html += `<div class="pdf-section"><h2>${App.escapeHtml(title)} <span style="font-weight:400;font-size:11px;color:#999">(${date})</span></h2>`;
            html += `<table><thead><tr><th style="width:35%">Campo</th><th>Resposta</th></tr></thead><tbody>`;
            if (rec.answers) {
                Object.entries(rec.answers).forEach(([key, value]) => {
                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    html += `<tr><td><strong>${App.escapeHtml(label)}</strong></td><td>${App.escapeHtml(String(value || '—'))}</td></tr>`;
                });
            }
            html += `</tbody></table></div>`;
        });

        html += `</div>` + this._footer() + `</body></html>`;
        this._open(html);
        App.showToast('Relatório de anamnese gerado!', 'success');
    },

    // ───── RELATÓRIO COMPLETO ─────
    generateComplete() {
        const pid = this._getPatientId();
        if (!pid) return;
        const patient = DB.getPatient(pid);
        if (!patient) return App.showToast('Paciente não encontrado', 'error');

        const settings = DB.getSettings();
        const user = Auth.getCurrentUser();

        let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatório Completo - ${App.escapeHtml(patient.name)}</title>
            <style>${this._css()}</style></head><body>`;
        html += this._header('Relatório Nutricional Completo', patient.name);
        html += `<div class="pdf-body">`;
        html += this._patientInfo(patient);

        // EVOLUÇÃO
        const evos = DB.getBodyEvolutions().filter(e => e.patientId === pid)
            .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt));
        if (evos.length) {
            const first = evos[0];
            const last = evos[evos.length - 1];
            html += `<div class="pdf-section"><h2>Evolução Corporal</h2>
                <div class="macro-row">
                    <div class="macro-box"><strong>${first.weight || '?'} kg</strong><small>Peso Inicial</small></div>
                    <div class="macro-box"><strong>${last.weight || '?'} kg</strong><small>Peso Atual</small></div>
                    <div class="macro-box"><strong>${evos.length}</strong><small>Registros</small></div>
                </div>
                <table><thead><tr><th>Data</th><th>Peso</th><th>% Gordura</th><th>Cintura</th><th>Quadril</th></tr></thead><tbody>`;
            evos.forEach(e => {
                html += `<tr><td>${new Date(e.date || e.createdAt).toLocaleDateString('pt-BR')}</td><td>${e.weight || '—'} kg</td>
                    <td>${e.bodyFat || '—'}%</td><td>${e.waist || '—'} cm</td><td>${e.hip || '—'} cm</td></tr>`;
            });
            html += `</tbody></table></div>`;
        }

        // CARDÁPIO mais recente
        const plans = DB.getMealPlans().filter(p => p.patientId === pid);
        if (plans.length) {
            const plan = plans[plans.length - 1];
            const mealLabels = { cafe_manha: 'Café da Manhã', lanche_manha: 'Lanche da Manhã', almoco: 'Almoço', lanche_tarde: 'Lanche da Tarde', jantar: 'Jantar', ceia: 'Ceia' };
            html += `<div class="pdf-section"><h2>Plano Alimentar: ${App.escapeHtml(plan.name)}</h2>`;
            (plan.meals || []).forEach(meal => {
                if (!meal.foods || !meal.foods.length) return;
                html += `<div class="meal-block"><h4>${mealLabels[meal.type] || meal.type}</h4><table><thead><tr><th>Alimento</th><th>Porção</th><th>Kcal</th></tr></thead><tbody>`;
                meal.foods.forEach(f => {
                    html += `<tr><td>${App.escapeHtml(f.name)}</td><td>${App.escapeHtml(f.portion || '')} x${f.qty || 1}</td><td>${Math.round((f.calories || 0) * (f.qty || 1))}</td></tr>`;
                });
                html += `</tbody></table></div>`;
            });
            html += `</div>`;
        }

        // ANAMNESE
        const records = DB.getAnamnesisRecords().filter(a => a.patientId === pid);
        if (records.length) {
            const typeLabels = { health_history: 'Histórico de Saúde', metabolic_screening: 'Rastreio Metabólico', recall_24h: 'Recordatório 24h', intestinal_habits: 'Hábitos Intestinais' };
            records.forEach(rec => {
                html += `<div class="pdf-section"><h2>${App.escapeHtml(typeLabels[rec.type] || rec.type)}</h2>`;
                html += `<table><tbody>`;
                if (rec.answers) {
                    Object.entries(rec.answers).forEach(([key, value]) => {
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                        html += `<tr><td style="width:35%;font-weight:600">${App.escapeHtml(label)}</td><td>${App.escapeHtml(String(value || '—'))}</td></tr>`;
                    });
                }
                html += `</tbody></table></div>`;
            });
        }

        // EXAMES
        const exams = DB.getLabExams().filter(e => e.patientId === pid);
        if (exams.length) {
            html += `<div class="pdf-section"><h2>Exames Laboratoriais</h2><table><thead><tr><th>Exame</th><th>Data</th><th>Resultado</th></tr></thead><tbody>`;
            exams.forEach(e => {
                html += `<tr><td>${App.escapeHtml(e.name || e.type || '—')}</td><td>${new Date(e.date || e.createdAt).toLocaleDateString('pt-BR')}</td><td>${App.escapeHtml(e.result || '—')}</td></tr>`;
            });
            html += `</tbody></table></div>`;
        }

        html += `</div>` + this._footer() + `</body></html>`;
        this._open(html);
        App.showToast('Relatório completo gerado!', 'success');
    }
};
