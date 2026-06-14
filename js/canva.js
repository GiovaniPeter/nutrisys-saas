/* ============================================
   NutreClin - Canva & Materiais Educativos
   Templates e criação de materiais para pacientes
   ============================================ */

const Canva = {
    render() {
        const settings = DB.getSettings();
        const clinic = settings.clinicName || 'NutreClin';

        return `
            <div class="page-header mb-3">
                <div>
                    <h3>Materiais Educativos</h3>
                    <p class="text-muted">Crie materiais visuais para seus pacientes com o Canva</p>
                </div>
                <a href="https://www.canva.com" target="_blank" class="btn btn-primary" style="background:#7B2FF2;border-color:#7B2FF2">
                    <span class="material-icons-outlined">open_in_new</span> Abrir Canva
                </a>
            </div>

            <!-- Templates sugeridos -->
            <div class="canva-grid">
                ${this._getTemplates().map(cat => `
                    <div class="canva-category">
                        <h4 class="canva-cat-title">
                            <span class="material-icons-outlined">${cat.icon}</span> ${cat.title}
                        </h4>
                        <div class="canva-templates">
                            ${cat.items.map(item => `
                                <div class="canva-template-card" onclick="Canva.openTemplate('${item.search}')">
                                    <div class="canva-template-icon" style="background:${item.color}">
                                        <span class="material-icons-outlined">${item.icon}</span>
                                    </div>
                                    <div class="canva-template-info">
                                        <strong>${App.escapeHtml(item.title)}</strong>
                                        <span class="text-small text-muted">${App.escapeHtml(item.desc)}</span>
                                    </div>
                                    <span class="material-icons-outlined" style="color:#dfe6e9;font-size:20px">arrow_forward_ios</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Galeria de materiais salvos -->
            <div class="mt-4">
                <div class="flex items-center justify-between mb-2">
                    <h4><span class="material-icons-outlined">photo_library</span> Meus Materiais</h4>
                    <button class="btn btn-sm btn-primary" onclick="Canva.addMaterial()">
                        <span class="material-icons-outlined">add</span> Adicionar Material
                    </button>
                </div>
                <div class="canva-gallery">
                    ${this._getMaterials().length ? this._getMaterials().map(m => `
                        <div class="canva-gallery-item">
                            ${m.image ? `<img src="${m.image}" alt="${App.escapeHtml(m.title)}">` : `<div class="canva-gallery-placeholder"><span class="material-icons-outlined">image</span></div>`}
                            <div class="canva-gallery-info">
                                <strong class="text-small">${App.escapeHtml(m.title)}</strong>
                                <span class="text-small text-muted">${App.formatDate(m.createdAt)}</span>
                            </div>
                            <div class="canva-gallery-actions">
                                <button class="btn-icon" onclick="Canva.shareMaterial('${m.id}')" title="Compartilhar"><span class="material-icons-outlined">share</span></button>
                                <button class="btn-icon text-danger" onclick="Canva.removeMaterial('${m.id}')" title="Remover"><span class="material-icons-outlined">delete</span></button>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-state" style="padding:40px;grid-column:1/-1">
                            <span class="material-icons-outlined">collections</span>
                            <p>Nenhum material salvo</p>
                            <p class="text-small text-muted">Adicione materiais criados no Canva para compartilhar com pacientes</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    _getTemplates() {
        return [
            {
                title: 'Postagens para Redes Sociais',
                icon: 'share',
                items: [
                    { title: 'Dicas de Alimentação Saudável', desc: 'Post para Instagram/Facebook', icon: 'eco', color: '#27ae60', search: 'healthy+eating+tips+nutrition' },
                    { title: 'Receitas Fit', desc: 'Carrossel de receitas', icon: 'restaurant', color: '#e67e22', search: 'healthy+recipe+card' },
                    { title: 'Mitos e Verdades', desc: 'Post educativo', icon: 'quiz', color: '#3498db', search: 'nutrition+myths+facts' },
                ]
            },
            {
                title: 'Materiais para Pacientes',
                icon: 'person',
                items: [
                    { title: 'Guia de Substituições', desc: 'Tabela de trocas alimentares', icon: 'swap_horiz', color: '#00b894', search: 'food+substitution+guide' },
                    { title: 'Lista de Compras', desc: 'Modelo de lista semanal', icon: 'shopping_cart', color: '#6c5ce7', search: 'grocery+shopping+list+template' },
                    { title: 'Diário Alimentar Impresso', desc: 'Template para preencher', icon: 'edit_note', color: '#fd79a8', search: 'food+diary+template+printable' },
                    { title: 'Infográfico Prato Saudável', desc: 'Visual do prato ideal', icon: 'pie_chart', color: '#e74c3c', search: 'healthy+plate+infographic' },
                ]
            },
            {
                title: 'Consultório',
                icon: 'business',
                items: [
                    { title: 'Cartão de Visita', desc: 'Design profissional', icon: 'badge', color: '#2d3436', search: 'nutritionist+business+card' },
                    { title: 'Banner de Consultório', desc: 'Faixa para redes sociais', icon: 'panorama', color: '#0984e3', search: 'nutrition+clinic+banner' },
                    { title: 'Certificado / Diploma', desc: 'Template de formação', icon: 'workspace_premium', color: '#fdcb6e', search: 'certificate+diploma+template' },
                ]
            }
        ];
    },

    openTemplate(search) {
        window.open(`https://www.canva.com/search/templates?q=${search}`, '_blank');
    },

    _getMaterials() {
        try {
            return JSON.parse(localStorage.getItem('nutrisys_materials') || '[]');
        } catch { return []; }
    },

    _saveMaterials(materials) {
        localStorage.setItem('nutrisys_materials', JSON.stringify(materials));
    },

    addMaterial() {
        App.openModal('Adicionar Material', `
            <form id="material-form" onsubmit="Canva.saveMaterial(event)">
                <div class="form-group">
                    <label>Título *</label>
                    <input type="text" name="title" required placeholder="Nome do material" maxlength="100">
                </div>
                <div class="form-group">
                    <label>Categoria</label>
                    <select name="category">
                        <option>Postagem</option>
                        <option>Material para Paciente</option>
                        <option>Consultório</option>
                        <option>Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Imagem (opcional)</label>
                    <input type="file" accept="image/*" id="material-image-input" onchange="Canva.previewImage(this)">
                    <div id="material-image-preview"></div>
                </div>
                <div class="form-group">
                    <label>Link do Canva (opcional)</label>
                    <input type="url" name="link" placeholder="https://www.canva.com/design/...">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        `);
    },

    _tempImage: null,

    previewImage(input) {
        if (!input.files[0]) return;
        const file = input.files[0];
        if (file.size > 1024 * 1024) { App.showToast('Imagem muito grande (máx 1MB)', 'error'); input.value = ''; return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            this._tempImage = e.target.result;
            document.getElementById('material-image-preview').innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:150px;border-radius:8px;margin-top:8px">`;
        };
        reader.readAsDataURL(file);
    },

    saveMaterial(e) {
        e.preventDefault();
        const f = document.getElementById('material-form');
        const materials = this._getMaterials();
        materials.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            title: f.title.value.trim(),
            category: f.category.value,
            image: this._tempImage || null,
            link: f.link.value.trim() || null,
            createdAt: new Date().toISOString().split('T')[0]
        });
        this._saveMaterials(materials);
        this._tempImage = null;
        App.closeModal();
        App.showToast('Material adicionado!', 'success');
        App.renderPage('canva');
    },

    removeMaterial(id) {
        if (!confirm('Remover este material?')) return;
        const materials = this._getMaterials().filter(m => m.id !== id);
        this._saveMaterials(materials);
        App.showToast('Material removido', 'success');
        App.renderPage('canva');
    },

    shareMaterial(id) {
        const m = this._getMaterials().find(mt => mt.id === id);
        if (!m) return;

        const patients = DB.getPatients();
        App.openModal('Compartilhar Material', `
            <div class="form-group">
                <label>Selecione os pacientes</label>
                ${patients.map(p => `
                    <label class="check-label" style="display:flex;align-items:center;gap:8px;padding:6px 0">
                        <input type="checkbox" class="share-patient-check" value="${p.id}">
                        ${App.escapeHtml(p.name)} ${p.phone ? `<span class="text-small text-muted">(${p.phone})</span>` : ''}
                    </label>
                `).join('')}
            </div>
            <div class="form-group">
                <label>Mensagem</label>
                <textarea id="share-msg" rows="2" maxlength="500">Olá! Preparei um material especial para você: ${m.title} 📚</textarea>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-success" onclick="Canva.doShare('${id}')" style="background:#25d366;border-color:#25d366">
                    <span class="material-icons-outlined">send</span> Enviar via WhatsApp
                </button>
            </div>
        `);
    },

    doShare(id) {
        const m = this._getMaterials().find(mt => mt.id === id);
        if (!m) return;
        const msg = document.getElementById('share-msg').value.trim();
        const checks = document.querySelectorAll('.share-patient-check:checked');
        if (!checks.length) { App.showToast('Selecione ao menos um paciente', 'error'); return; }

        checks.forEach(c => {
            const p = DB.getPatient(c.value);
            if (p && p.phone) {
                const phone = p.phone.replace(/\D/g, '');
                const fullPhone = phone.startsWith('55') ? phone : '55' + phone;
                const text = m.link ? msg + '\n\n' + m.link : msg;
                window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`, '_blank');
            }
        });
        App.closeModal();
        App.showToast('Links do WhatsApp abertos!', 'success');
    }
};
