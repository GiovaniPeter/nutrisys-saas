/* ============================================
   NutreClin - Controle Financeiro
   ============================================ */

const Financial = {
    currentFilter: 'all',
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),

    INCOME_CATS: ['Consulta', 'Retorno', 'Plano Alimentar', 'Avaliação', 'Outro'],
    EXPENSE_CATS: ['Aluguel', 'Material', 'Equipamentos', 'Software', 'Marketing', 'Impostos', 'Outros'],
    PAY_METHODS: [
        { v: 'dinheiro', l: 'Dinheiro' },
        { v: 'pix', l: 'PIX' },
        { v: 'cartao_credito', l: 'Cartão de Crédito' },
        { v: 'cartao_debito', l: 'Cartão de Débito' },
        { v: 'transferencia', l: 'Transferência' }
    ],
    MONTHS: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
             'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],

    render() {
        const all = DB.getFinancialTransactions();

        // Resumo do mês selecionado
        const mtx = all.filter(t => {
            const d = new Date(t.date + 'T12:00:00');
            return d.getMonth() === this.currentMonth && d.getFullYear() === this.currentYear;
        });

        const income  = mtx.filter(t => t.type === 'receita' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
        const expense = mtx.filter(t => t.type === 'despesa' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
        const balance = income - expense;
        const pending = mtx.filter(t => t.status === 'pendente').reduce((s, t) => s + t.amount, 0);

        // Lista filtrada
        let list = all;
        if (this.currentFilter !== 'all') list = list.filter(t => t.type === this.currentFilter);
        list.sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));

        const fmt = v => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

        return `
            <!-- Período -->
            <div class="schedule-toolbar mb-3">
                <div class="schedule-nav">
                    <button class="btn-icon" onclick="Financial.prevMonth()">
                        <span class="material-icons-outlined">chevron_left</span>
                    </button>
                    <h3 class="schedule-title">${this.MONTHS[this.currentMonth]} ${this.currentYear}</h3>
                    <button class="btn-icon" onclick="Financial.nextMonth()">
                        <span class="material-icons-outlined">chevron_right</span>
                    </button>
                </div>
                <div class="schedule-actions">
                    <button class="btn btn-sm" style="background:var(--success);color:#fff" onclick="Financial.openAddModal('receita')">
                        <span class="material-icons-outlined">add</span> Receita
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="Financial.openAddModal('despesa')">
                        <span class="material-icons-outlined">remove</span> Despesa
                    </button>
                </div>
            </div>

            <!-- Cards -->
            <div class="stats-grid mb-3">
                <div class="stat-card">
                    <div class="stat-icon green"><span class="material-icons-outlined">trending_up</span></div>
                    <div class="stat-info"><h4>${fmt(income)}</h4><p>Receitas</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:#fdedec"><span class="material-icons-outlined" style="color:var(--danger)">trending_down</span></div>
                    <div class="stat-info"><h4>${fmt(expense)}</h4><p>Despesas</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon ${balance >= 0 ? 'blue' : ''}" ${balance < 0 ? 'style="background:#fdedec"' : ''}>
                        <span class="material-icons-outlined" ${balance < 0 ? 'style="color:var(--danger)"' : ''}>account_balance</span>
                    </div>
                    <div class="stat-info">
                        <h4 ${balance < 0 ? 'style="color:var(--danger)"' : ''}>${fmt(balance)}</h4><p>Saldo</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon purple"><span class="material-icons-outlined">schedule</span></div>
                    <div class="stat-info"><h4>${fmt(pending)}</h4><p>Pendente</p></div>
                </div>
            </div>

            <!-- Tabela -->
            <div class="card">
                <div class="card-header">
                    <h3>Transações</h3>
                    <div class="btn-group">
                        <button class="btn btn-sm ${this.currentFilter==='all'?'btn-primary':'btn-outline'}" onclick="Financial.setFilter('all')">Todas</button>
                        <button class="btn btn-sm ${this.currentFilter==='receita'?'btn-primary':'btn-outline'}" onclick="Financial.setFilter('receita')">Receitas</button>
                        <button class="btn btn-sm ${this.currentFilter==='despesa'?'btn-primary':'btn-outline'}" onclick="Financial.setFilter('despesa')">Despesas</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Pagamento</th>
                                <th>Status</th>
                                <th>Valor</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${list.length ? list.map(t => this._row(t)).join('') :
                              '<tr><td colspan="7" class="text-center text-muted" style="padding:30px">Nenhuma transação registrada</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    _row(t) {
        const inc = t.type === 'receita';
        const sb = { pago:'badge-success', pendente:'badge-warning', cancelado:'badge-danger' };
        const ml = { dinheiro:'Dinheiro', pix:'PIX', cartao_credito:'C. Crédito', cartao_debito:'C. Débito', transferencia:'Transf.' };
        return `<tr>
            <td>${App.formatDate(t.date)}</td>
            <td>
                <span class="material-icons-outlined" style="font-size:16px;vertical-align:middle;color:${inc?'var(--success)':'var(--danger)'}">
                    ${inc ? 'arrow_upward' : 'arrow_downward'}
                </span>
                ${App.escapeHtml(t.description)}
            </td>
            <td><span class="badge badge-info">${App.escapeHtml(t.category)}</span></td>
            <td>${ml[t.paymentMethod] || t.paymentMethod || '-'}</td>
            <td><span class="badge ${sb[t.status]||''}">${t.status}</span></td>
            <td style="font-weight:600;color:${inc?'var(--success)':'var(--danger)'}">
                ${inc ? '+' : '-'} R$ ${t.amount.toLocaleString('pt-BR', {minimumFractionDigits:2})}
            </td>
            <td>
                <div class="actions">
                    ${inc && t.status === 'pago' ? `<button class="btn-icon" title="Recibo" onclick="Financial.generateReceipt('${t.id}')"><span class="material-icons-outlined">receipt</span></button>` : ''}
                    ${t.status === 'pendente' ? `<button class="btn-icon" title="Marcar pago" onclick="Financial.markPaid('${t.id}')"><span class="material-icons-outlined" style="color:var(--success)">check_circle</span></button>` : ''}
                    <button class="btn-icon" title="Editar" onclick="Financial.openEditModal('${t.id}')"><span class="material-icons-outlined">edit</span></button>
                    <button class="btn-icon" title="Excluir" onclick="Financial.confirmDelete('${t.id}')"><span class="material-icons-outlined">delete</span></button>
                </div>
            </td>
        </tr>`;
    },

    /* ---- Navegação ---- */
    prevMonth() { this.currentMonth--; if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; } App.renderPage('financial'); },
    nextMonth() { this.currentMonth++; if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; } App.renderPage('financial'); },
    setFilter(f) { this.currentFilter = f; App.renderPage('financial'); },

    markPaid(id) {
        DB.updateFinancialTransaction(id, { status: 'pago' });
        App.showToast('Marcado como pago!', 'success');
        App.renderPage('financial');
    },

    /* ---- CRUD ---- */
    openAddModal(type) {
        App.openModal(type === 'receita' ? 'Nova Receita' : 'Nova Despesa', this._form({ type }));
    },

    openEditModal(id) {
        const t = DB.getFinancialTransaction(id);
        if (!t) return;
        App.openModal('Editar Transação', this._form(t));
    },

    _form(t = {}) {
        const cats = t.type === 'receita' ? this.INCOME_CATS : this.EXPENSE_CATS;
        const patients = DB.getPatients();
        const today = new Date().toISOString().split('T')[0];
        return `
        <form id="fin-form" onsubmit="Financial.handleSave(event,'${t.id||''}','${t.type}')">
            <div class="form-row">
                <div class="form-group">
                    <label>Categoria *</label>
                    <select name="category" required>
                        ${cats.map(c => `<option value="${c}" ${t.category===c?'selected':''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Valor (R$) *</label>
                    <input type="number" name="amount" step="0.01" min="0.01" required value="${t.amount||''}">
                </div>
            </div>
            <div class="form-group">
                <label>Descrição *</label>
                <input type="text" name="description" required maxlength="200" value="${App.escapeHtml(t.description||'')}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Data</label>
                    <input type="date" name="date" value="${t.date||today}">
                </div>
                <div class="form-group">
                    <label>Forma de Pagamento</label>
                    <select name="paymentMethod">
                        ${this.PAY_METHODS.map(m => `<option value="${m.v}" ${t.paymentMethod===m.v?'selected':''}>${m.l}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="pago" ${(!t.status||t.status==='pago')?'selected':''}>Pago</option>
                        <option value="pendente" ${t.status==='pendente'?'selected':''}>Pendente</option>
                        <option value="cancelado" ${t.status==='cancelado'?'selected':''}>Cancelado</option>
                    </select>
                </div>
                ${t.type === 'receita' ? `
                <div class="form-group">
                    <label>Paciente (opcional)</label>
                    <select name="patientId">
                        <option value="">Nenhum</option>
                        ${patients.map(p => `<option value="${p.id}" ${t.patientId===p.id?'selected':''}>${App.escapeHtml(p.name)}</option>`).join('')}
                    </select>
                </div>` : '<div></div>'}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>`;
    },

    handleSave(e, id, type) {
        e.preventDefault();
        const f = document.getElementById('fin-form');
        const data = {
            type,
            category: f.category.value,
            amount: parseFloat(f.amount.value),
            description: f.description.value.trim(),
            date: f.date.value,
            paymentMethod: f.paymentMethod.value,
            status: f.status.value,
            patientId: f.patientId ? f.patientId.value || null : null
        };
        if (id) {
            DB.updateFinancialTransaction(id, data);
            App.showToast('Transação atualizada!', 'success');
        } else {
            DB.addFinancialTransaction(data);
            App.showToast(type === 'receita' ? 'Receita registrada!' : 'Despesa registrada!', 'success');
        }
        App.closeModal();
        App.renderPage('financial');
    },

    confirmDelete(id) {
        App.openModal('Confirmar Exclusão', `
            <p>Tem certeza que deseja excluir esta transação?</p>
            <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
                <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-danger" onclick="Financial.doDelete('${id}')">Excluir</button>
            </div>
        `);
    },

    doDelete(id) {
        DB.removeFinancialTransaction(id);
        App.closeModal();
        App.renderPage('financial');
        App.showToast('Transação excluída', 'info');
    },

    /* ---- Emissão de Recibo ---- */
    generateReceipt(id) {
        const t = DB.getFinancialTransaction(id);
        if (!t) return;

        const s = DB.getSettings();
        const clinic = s.clinicName || 'NutreClin';
        const prof = s.professionalName || 'Nutricionista';
        const phone = s.phone || '';
        const addr = s.address || '';
        const pc = s.primaryColor || '#00b894';
        const patient = t.patientId ? DB.getPatient(t.patientId) : null;
        const rcNum = 'REC-' + (t.id || '').substring(0, 8).toUpperCase();
        const meth = { dinheiro:'Dinheiro', pix:'PIX', cartao_credito:'Cartão de Crédito', cartao_debito:'Cartão de Débito', transferencia:'Transferência Bancária' };

        const w = window.open('', '_blank', 'width=700,height=600');
        if (!w) return;

        w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Recibo ${rcNum}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',Arial,sans-serif;padding:40px;color:#2d3436;max-width:600px;margin:0 auto}
.rh{border-bottom:3px solid ${pc};padding-bottom:16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-start}
.rh h1{color:${pc};font-size:1.3rem}
.rh small{color:#636e72;display:block;margin-top:2px}
.rr{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
.rr label{font-weight:600;color:#636e72;font-size:.9rem}
.rt{font-size:1.5rem;font-weight:700;color:${pc};text-align:right;margin:20px 0;padding:16px;background:#f5f6fa;border-radius:8px}
.rs{margin-top:60px;text-align:center}
.rs .line{border-top:1px solid #2d3436;width:250px;margin:0 auto 8px}
.rf{margin-top:40px;text-align:center;color:#636e72;font-size:.8rem;border-top:1px solid #eee;padding-top:16px}
@media print{body{padding:20px}}
</style></head><body>
<div class="rh"><div><h1>${App.escapeHtml(clinic)}</h1><small>${App.escapeHtml(prof)}</small>
${phone?'<small>'+App.escapeHtml(phone)+'</small>':''}${addr?'<small>'+App.escapeHtml(addr)+'</small>':''}</div>
<div style="text-align:right"><strong>RECIBO</strong><div style="font-size:.85rem;color:#636e72">${rcNum}</div>
<div style="font-size:.85rem;color:#636e72">Data: ${App.formatDate(t.date)}</div></div></div>
<div class="rr"><label>Descrição</label><span>${App.escapeHtml(t.description)}</span></div>
<div class="rr"><label>Categoria</label><span>${App.escapeHtml(t.category)}</span></div>
${patient?'<div class="rr"><label>Paciente</label><span>'+App.escapeHtml(patient.name)+'</span></div>':''}
<div class="rr"><label>Forma de Pagamento</label><span>${meth[t.paymentMethod]||t.paymentMethod}</span></div>
<div class="rt">R$ ${t.amount.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
<div class="rs"><div class="line"></div><p>${App.escapeHtml(prof)}</p></div>
<div class="rf"><p>Documento gerado por ${App.escapeHtml(clinic)}</p></div>
<script>window.print();<\/script></body></html>`);
        w.document.close();
    }
};
