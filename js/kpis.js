/* ============================================
   NutreClin - Dashboard de Retenção e KPIs
   Métricas de negócio para nutricionistas
   ============================================ */

const KPIs = {
    selectedPeriod: 6, // meses

    render() {
        const patients = DB.getPatients();
        const appointments = DB.getAppointments();
        const transactions = DB.getFinancialTransactions();
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // ── Métricas principais ──
        const metrics = this._calcMetrics(patients, appointments, transactions, today);

        // ── Faturamento mensal (últimos N meses) ──
        const revenueData = this._calcMonthlyRevenue(transactions, today, this.selectedPeriod);
        const maxRevenue = Math.max(...revenueData.map(r => r.value), 1);

        // ── Pacientes ativos vs inativos ──
        const { active, inactive, activeList, inactiveList } = this._calcPatientActivity(patients, appointments, today);

        // ── No-show risk ──
        const noShowRisk = this._calcNoShowRisk(appointments, patients, todayStr);

        // ── Top pacientes por faturamento ──
        const topPatients = this._calcTopPatients(transactions, patients);

        return `
            <div class="page-header mb-3">
                <div>
                    <h3>Retenção & KPIs</h3>
                    <p class="text-muted">Indicadores de performance do seu negócio</p>
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                    <label class="text-small text-muted">Período:</label>
                    <select class="form-control" style="width:auto;padding:6px 10px" onchange="KPIs.changePeriod(this.value)">
                        <option value="3" ${this.selectedPeriod===3?'selected':''}>3 meses</option>
                        <option value="6" ${this.selectedPeriod===6?'selected':''}>6 meses</option>
                        <option value="12" ${this.selectedPeriod===12?'selected':''}>12 meses</option>
                    </select>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="kpi-cards">
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:rgba(0,184,148,0.12);color:#00b894">
                        <span class="material-icons-outlined">replay</span>
                    </div>
                    <div class="kpi-value">${metrics.returnRate}%</div>
                    <div class="kpi-label">Taxa de Retorno</div>
                    <div class="kpi-detail">${metrics.returned} de ${metrics.totalWithAppts} voltaram</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:rgba(108,92,231,0.12);color:#6c5ce7">
                        <span class="material-icons-outlined">attach_money</span>
                    </div>
                    <div class="kpi-value">R$ ${this._fmt(metrics.monthRevenue)}</div>
                    <div class="kpi-label">Faturamento do Mês</div>
                    <div class="kpi-detail kpi-trend ${metrics.revenueTrend >= 0 ? 'kpi-trend-up' : 'kpi-trend-down'}">
                        <span class="material-icons-outlined">${metrics.revenueTrend >= 0 ? 'trending_up' : 'trending_down'}</span>
                        ${metrics.revenueTrend >= 0 ? '+' : ''}${metrics.revenueTrend}% vs mês anterior
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:rgba(9,132,227,0.12);color:#0984e3">
                        <span class="material-icons-outlined">people</span>
                    </div>
                    <div class="kpi-value">${active}</div>
                    <div class="kpi-label">Pacientes Ativos</div>
                    <div class="kpi-detail">${inactive} inativos (${patients.length} total)</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:rgba(225,112,85,0.12);color:#e17055">
                        <span class="material-icons-outlined">event_busy</span>
                    </div>
                    <div class="kpi-value">${metrics.noShowRate}%</div>
                    <div class="kpi-label">Taxa de Faltas</div>
                    <div class="kpi-detail">${metrics.noShows} faltas em ${metrics.totalPastAppts} consultas</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:rgba(253,203,110,0.12);color:#cc8e35">
                        <span class="material-icons-outlined">payments</span>
                    </div>
                    <div class="kpi-value">R$ ${this._fmt(metrics.avgTicket)}</div>
                    <div class="kpi-label">Ticket Médio</div>
                    <div class="kpi-detail">por consulta paga</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:rgba(162,155,254,0.12);color:#a29bfe">
                        <span class="material-icons-outlined">schedule</span>
                    </div>
                    <div class="kpi-value">${metrics.avgDaysBetween}</div>
                    <div class="kpi-label">Dias entre Consultas</div>
                    <div class="kpi-detail">média de intervalo</div>
                </div>
            </div>

            <!-- Gráficos -->
            <div class="kpi-grid">
                <!-- Faturamento Mensal -->
                <div class="card">
                    <div class="card-header">
                        <h3><span class="material-icons-outlined">bar_chart</span> Faturamento Mensal</h3>
                    </div>
                    <div class="kpi-chart">
                        <div class="kpi-bars">
                            ${revenueData.map(r => `
                                <div class="kpi-bar-col">
                                    <div class="kpi-bar-value">R$ ${this._fmt(r.value)}</div>
                                    <div class="kpi-bar-track">
                                        <div class="kpi-bar-fill" style="height:${Math.max((r.value / maxRevenue) * 100, 2)}%"></div>
                                    </div>
                                    <div class="kpi-bar-label">${r.label}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Pacientes Ativos vs Inativos -->
                <div class="card">
                    <div class="card-header">
                        <h3><span class="material-icons-outlined">donut_small</span> Pacientes Ativos vs Inativos</h3>
                    </div>
                    <div class="kpi-donut-container">
                        <div class="kpi-donut">
                            <svg viewBox="0 0 36 36" class="kpi-donut-svg">
                                <path class="kpi-donut-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                                <path class="kpi-donut-fill" stroke-dasharray="${patients.length ? Math.round((active/patients.length)*100) : 0}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                                <text x="18" y="17.5" class="kpi-donut-text">${patients.length ? Math.round((active/patients.length)*100) : 0}%</text>
                                <text x="18" y="22" class="kpi-donut-subtext">ativos</text>
                            </svg>
                        </div>
                        <div class="kpi-donut-legend">
                            <div class="kpi-legend-item">
                                <span class="kpi-legend-dot" style="background:#00b894"></span>
                                <span>Ativos: <strong>${active}</strong></span>
                                <span class="text-muted text-small">consulta nos últimos 90 dias</span>
                            </div>
                            <div class="kpi-legend-item">
                                <span class="kpi-legend-dot" style="background:#dfe6e9"></span>
                                <span>Inativos: <strong>${inactive}</strong></span>
                                <span class="text-muted text-small">sem consulta há 90+ dias</span>
                            </div>
                            ${inactiveList.length ? `
                                <div class="kpi-reactivate">
                                    <span class="text-small text-muted" style="margin-bottom:4px;display:block">Inativos recentes:</span>
                                    ${inactiveList.slice(0, 5).map(p => `
                                        <div class="kpi-inactive-row">
                                            <span>${App.escapeHtml(p.name)}</span>
                                            <button class="btn btn-sm btn-outline" onclick="KPIs.contactInactive('${p.id}')" title="Entrar em contato">
                                                <span class="material-icons-outlined" style="font-size:14px">send</span>
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>

            <!-- No-show Risk + Top pacientes -->
            <div class="kpi-grid">
                <!-- Risco de No-show -->
                <div class="card">
                    <div class="card-header">
                        <h3><span class="material-icons-outlined">warning</span> Risco de No-show</h3>
                        <span class="badge ${noShowRisk.length ? 'badge-warning' : 'badge-success'}">${noShowRisk.length} alerta${noShowRisk.length !== 1 ? 's' : ''}</span>
                    </div>
                    ${noShowRisk.length ? `
                        <div class="kpi-risk-list">
                            ${noShowRisk.map(r => `
                                <div class="kpi-risk-item">
                                    <div class="kpi-risk-info">
                                        <strong>${App.escapeHtml(r.patientName)}</strong>
                                        <span class="text-small text-muted">${App.formatDate(r.date)} às ${r.time} · ${App.escapeHtml(r.type)}</span>
                                    </div>
                                    <div class="kpi-risk-reasons">
                                        ${r.reasons.map(reason => `<span class="kpi-risk-tag">${App.escapeHtml(reason)}</span>`).join('')}
                                    </div>
                                    <div class="kpi-risk-score">
                                        <div class="kpi-risk-bar">
                                            <div class="kpi-risk-bar-fill" style="width:${r.riskPercent}%;background:${r.riskPercent > 66 ? '#e17055' : r.riskPercent > 33 ? '#fdcb6e' : '#00b894'}"></div>
                                        </div>
                                        <span class="text-small" style="color:${r.riskPercent > 66 ? '#e17055' : r.riskPercent > 33 ? '#cc8e35' : '#00b894'}">${r.riskPercent}%</span>
                                    </div>
                                    <button class="btn btn-sm btn-outline" onclick="KPIs.confirmAppointment('${r.appointmentId}')" title="Confirmar">
                                        <span class="material-icons-outlined" style="font-size:14px">check_circle</span>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state" style="padding:40px">
                            <span class="material-icons-outlined" style="color:#00b894">verified</span>
                            <p>Nenhum risco de no-show detectado</p>
                            <p class="text-small text-muted">Todas as consultas futuras parecem seguras</p>
                        </div>
                    `}
                </div>

                <!-- Top Pacientes por Faturamento -->
                <div class="card">
                    <div class="card-header">
                        <h3><span class="material-icons-outlined">emoji_events</span> Top Pacientes por Faturamento</h3>
                    </div>
                    ${topPatients.length ? `
                        <div class="kpi-top-list">
                            ${topPatients.map((tp, i) => `
                                <div class="kpi-top-item">
                                    <div class="kpi-top-rank ${i < 3 ? 'kpi-top-rank-' + (i+1) : ''}">${i + 1}º</div>
                                    <div class="kpi-top-info">
                                        <strong>${App.escapeHtml(tp.name)}</strong>
                                        <span class="text-small text-muted">${tp.count} consulta${tp.count !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div class="kpi-top-value">R$ ${this._fmt(tp.total)}</div>
                                    <div class="kpi-top-bar">
                                        <div class="kpi-top-bar-fill" style="width:${(tp.total / topPatients[0].total * 100).toFixed(0)}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state" style="padding:40px">
                            <span class="material-icons-outlined">account_balance_wallet</span>
                            <p>Sem dados financeiros</p>
                            <p class="text-small text-muted">Registre transações para ver os top pacientes</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    // ── Cálculos ──

    _calcMetrics(patients, appointments, transactions, today) {
        const todayStr = today.toISOString().split('T')[0];
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        // Taxa de retorno: quantos pacientes tiveram 2+ consultas realizadas
        const pastAppts = appointments.filter(a => a.date <= todayStr && a.status !== 'cancelada');
        const byPatient = {};
        pastAppts.forEach(a => {
            if (!byPatient[a.patientId]) byPatient[a.patientId] = 0;
            byPatient[a.patientId]++;
        });
        const totalWithAppts = Object.keys(byPatient).length;
        const returned = Object.values(byPatient).filter(c => c >= 2).length;
        const returnRate = totalWithAppts ? Math.round((returned / totalWithAppts) * 100) : 0;

        // Faturamento do mês atual vs anterior
        const monthTx = transactions.filter(t => {
            const d = new Date(t.date + 'T12:00:00');
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear && t.type === 'receita' && t.status === 'pago';
        });
        const lastMonthTx = transactions.filter(t => {
            const d = new Date(t.date + 'T12:00:00');
            return d.getMonth() === lastMonth && d.getFullYear() === lastYear && t.type === 'receita' && t.status === 'pago';
        });
        const monthRevenue = monthTx.reduce((s, t) => s + t.amount, 0);
        const lastRevenue = lastMonthTx.reduce((s, t) => s + t.amount, 0);
        const revenueTrend = lastRevenue ? Math.round(((monthRevenue - lastRevenue) / lastRevenue) * 100) : 0;

        // Taxa de no-show (faltas)
        const totalPastAppts = pastAppts.length;
        const noShows = appointments.filter(a => a.date <= todayStr && a.status === 'faltou').length;
        const noShowRate = totalPastAppts ? Math.round((noShows / totalPastAppts) * 100) : 0;

        // Ticket médio
        const paidConsultas = transactions.filter(t => t.type === 'receita' && t.status === 'pago' && (t.category === 'Consulta' || t.category === 'Retorno'));
        const avgTicket = paidConsultas.length ? paidConsultas.reduce((s, t) => s + t.amount, 0) / paidConsultas.length : 0;

        // Média de dias entre consultas
        const intervals = [];
        Object.keys(byPatient).forEach(pid => {
            const pAppts = pastAppts.filter(a => a.patientId === pid).sort((a, b) => a.date.localeCompare(b.date));
            for (let i = 1; i < pAppts.length; i++) {
                const diff = (new Date(pAppts[i].date) - new Date(pAppts[i-1].date)) / 86400000;
                if (diff > 0) intervals.push(diff);
            }
        });
        const avgDaysBetween = intervals.length ? Math.round(intervals.reduce((s, v) => s + v, 0) / intervals.length) : '-';

        return { returnRate, returned, totalWithAppts, monthRevenue, revenueTrend, noShowRate, noShows, totalPastAppts, avgTicket, avgDaysBetween };
    },

    _calcMonthlyRevenue(transactions, today, months) {
        const MNAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        const data = [];
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const m = d.getMonth();
            const y = d.getFullYear();
            const total = transactions
                .filter(t => {
                    const td = new Date(t.date + 'T12:00:00');
                    return td.getMonth() === m && td.getFullYear() === y && t.type === 'receita' && t.status === 'pago';
                })
                .reduce((s, t) => s + t.amount, 0);
            data.push({ label: MNAMES[m] + '/' + String(y).slice(2), value: total });
        }
        return data;
    },

    _calcPatientActivity(patients, appointments, today) {
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - 90);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        const activeList = [];
        const inactiveList = [];

        patients.forEach(p => {
            const pAppts = appointments.filter(a => a.patientId === p.id && a.status !== 'cancelada');
            const lastAppt = pAppts.sort((a, b) => b.date.localeCompare(a.date))[0];
            if (lastAppt && lastAppt.date >= cutoffStr) {
                activeList.push(p);
            } else {
                inactiveList.push(p);
            }
        });

        return { active: activeList.length, inactive: inactiveList.length, activeList, inactiveList };
    },

    _calcNoShowRisk(appointments, patients, todayStr) {
        const future = appointments
            .filter(a => a.date >= todayStr && a.status !== 'cancelada' && a.status !== 'confirmada' && a.status !== 'realizada')
            .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
            .slice(0, 20);

        const risks = [];

        future.forEach(a => {
            const patient = patients.find(p => p.id === a.patientId);
            if (!patient) return;

            const reasons = [];
            let riskScore = 0;

            // Histórico de faltas do paciente
            const pastAppts = appointments.filter(ap => ap.patientId === a.patientId && ap.date < todayStr);
            const pastNoShows = pastAppts.filter(ap => ap.status === 'faltou').length;
            if (pastNoShows > 0) {
                reasons.push(`${pastNoShows} falta${pastNoShows > 1 ? 's' : ''} anterior${pastNoShows > 1 ? 'es' : ''}`);
                riskScore += Math.min(pastNoShows * 25, 50);
            }

            // Consulta não confirmada
            if (a.status === 'pendente') {
                reasons.push('Não confirmada');
                riskScore += 20;
            }

            // Consulta longe no futuro (> 7 dias) — pode esquecer
            const daysUntil = Math.round((new Date(a.date) - new Date(todayStr)) / 86400000);
            if (daysUntil > 7) {
                reasons.push(`Faltam ${daysUntil} dias`);
                riskScore += 10;
            }

            // Paciente sem telefone
            if (!patient.phone) {
                reasons.push('Sem telefone');
                riskScore += 15;
            }

            // Primeiro consulta (sem histórico)
            if (pastAppts.length === 0) {
                reasons.push('Primeira consulta');
                riskScore += 10;
            }

            const riskPercent = Math.min(riskScore, 100);

            if (riskPercent >= 20) {
                risks.push({
                    appointmentId: a.id,
                    patientName: patient.name,
                    date: a.date,
                    time: a.time,
                    type: a.type || 'Consulta',
                    reasons,
                    riskPercent
                });
            }
        });

        return risks.sort((a, b) => b.riskPercent - a.riskPercent).slice(0, 8);
    },

    _calcTopPatients(transactions, patients) {
        const byPatient = {};
        transactions
            .filter(t => t.type === 'receita' && t.status === 'pago' && t.patientId)
            .forEach(t => {
                if (!byPatient[t.patientId]) byPatient[t.patientId] = { total: 0, count: 0 };
                byPatient[t.patientId].total += t.amount;
                byPatient[t.patientId].count++;
            });

        return Object.entries(byPatient)
            .map(([pid, data]) => {
                const p = patients.find(pt => pt.id === pid);
                return { name: p ? p.name : 'Removido', total: data.total, count: data.count };
            })
            .sort((a, b) => b.total - a.total)
            .slice(0, 8);
    },

    // ── Ações ──

    changePeriod(val) {
        this.selectedPeriod = parseInt(val);
        App.renderPage('kpis');
    },

    confirmAppointment(id) {
        const a = DB.getAppointment(id);
        if (a) {
            a.status = 'confirmada';
            DB.updateAppointment(a);
            App.showToast('Consulta confirmada!', 'success');
            App.renderPage('kpis');
        }
    },

    contactInactive(patientId) {
        const p = DB.getPatient(patientId);
        if (!p) return;
        if (p.phone) {
            const msg = encodeURIComponent(`Olá ${p.name.split(' ')[0]}! Sentimos sua falta. Que tal agendarmos uma consulta de acompanhamento? 😊`);
            const phone = p.phone.replace(/\D/g, '');
            const full = phone.startsWith('55') ? phone : '55' + phone;
            window.open(`https://wa.me/${full}?text=${msg}`, '_blank');
        } else {
            App.showToast('Paciente sem telefone cadastrado', 'error');
        }
    },

    // ── Helpers ──

    _fmt(v) {
        return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
};
