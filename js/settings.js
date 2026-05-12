/* ============================================
   NutriSys - Módulo de Configurações (White-label)
   Logo, cores, nome da clínica
   ============================================ */

const Settings = {
    render() {
        const s = DB.getSettings();
        return `
            <div class="card mb-3">
                <h3 class="mb-2">Identidade Visual da Clínica</h3>
                <p class="text-muted mb-3">Personalize os PDFs e impressões com a marca da sua clínica</p>

                <div class="form-row">
                    <div class="form-group">
                        <label>Nome da Clínica</label>
                        <input type="text" id="setting-clinic-name" maxlength="100" value="${App.escapeHtml(s.clinicName || '')}" placeholder="Ex: Clínica NutriVida">
                    </div>
                    <div class="form-group">
                        <label>Nome do Profissional</label>
                        <input type="text" id="setting-prof-name" maxlength="100" value="${App.escapeHtml(s.professionalName || '')}" placeholder="Ex: Dra. Maria Silva - CRN 12345">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Cor Principal</label>
                        <div class="color-picker-group">
                            <input type="color" id="setting-primary-color" value="${s.primaryColor || '#00b894'}" style="width:50px;height:38px;border:none;cursor:pointer;border-radius:6px">
                            <input type="text" id="setting-primary-color-text" value="${s.primaryColor || '#00b894'}" maxlength="7" style="width:100px" oninput="document.getElementById('setting-primary-color').value=this.value">
                            <div class="color-presets">
                                ${['#00b894','#6c5ce7','#0984e3','#e17055','#00cec9','#fdcb6e','#e84393','#2d3436'].map(c =>
                                    `<button type="button" class="color-preset" style="background:${c}" onclick="Settings.setColor('${c}')" title="${c}"></button>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Cor Secundária</label>
                        <div class="color-picker-group">
                            <input type="color" id="setting-secondary-color" value="${s.secondaryColor || '#6c5ce7'}" style="width:50px;height:38px;border:none;cursor:pointer;border-radius:6px">
                            <input type="text" id="setting-secondary-color-text" value="${s.secondaryColor || '#6c5ce7'}" maxlength="7" style="width:100px">
                        </div>
                    </div>
                </div>

                <div class="form-group mt-2">
                    <label>Logo da Clínica</label>
                    <div class="logo-upload-area" id="logo-upload-area">
                        ${s.logo
                            ? `<img src="${s.logo}" id="logo-preview" style="max-height:80px;border-radius:8px" alt="Logo">
                               <button class="btn btn-sm btn-outline mt-2" onclick="Settings.removeLogo()">Remover Logo</button>`
                            : `<span class="material-icons-outlined" style="font-size:48px;color:var(--text-muted)">add_photo_alternate</span>
                               <p class="text-muted text-small">Clique ou arraste uma imagem</p>`}
                        <input type="file" id="logo-input" accept="image/png,image/jpeg,image/svg+xml" style="display:none" onchange="Settings.handleLogoUpload(event)">
                    </div>
                </div>

                <div class="form-group mt-2">
                    <label>Telefone / WhatsApp</label>
                    <input type="text" id="setting-phone" maxlength="20" value="${App.escapeHtml(s.phone || '')}" placeholder="(11) 99999-9999">
                </div>

                <div class="form-group mt-2">
                    <label>Endereço</label>
                    <input type="text" id="setting-address" maxlength="200" value="${App.escapeHtml(s.address || '')}" placeholder="Rua, número, bairro, cidade">
                </div>
            </div>

            <!-- PREVIEW -->
            <div class="card mb-3">
                <h3 class="mb-2">Pré-visualização do Cabeçalho PDF</h3>
                <div id="pdf-preview" class="pdf-preview-box">
                    ${this._renderPreview(s)}
                </div>
                <button class="btn btn-sm btn-outline mt-2" onclick="Settings.refreshPreview()">
                    <span class="material-icons-outlined" style="font-size:16px">refresh</span> Atualizar Preview
                </button>
            </div>

            <div class="flex justify-end gap-2">
                <button class="btn btn-outline" onclick="Settings.resetDefaults()">Restaurar Padrão</button>
                <button class="btn btn-primary" onclick="Settings.save()">
                    <span class="material-icons-outlined">save</span> Salvar Configurações
                </button>
            </div>`;
    },

    _renderPreview(s) {
        const color = s.primaryColor || '#00b894';
        return `
            <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid ${color};padding-bottom:12px;font-family:Segoe UI,Arial,sans-serif">
                <div>
                    ${s.logo ? `<img src="${s.logo}" style="max-height:50px;border-radius:4px" alt="Logo">` : `<div style="font-size:20px;font-weight:700;color:${color}">${App.escapeHtml(s.clinicName || 'NutriSys')}</div>`}
                </div>
                <div style="text-align:right">
                    <div style="font-size:16px;font-weight:600;color:${color}">Plano Alimentar</div>
                    <div style="font-size:11px;color:#888">${App.escapeHtml(s.professionalName || 'Nutricionista')} · ${new Date().toLocaleDateString('pt-BR')}</div>
                </div>
            </div>`;
    },

    setColor(color) {
        document.getElementById('setting-primary-color').value = color;
        document.getElementById('setting-primary-color-text').value = color;
    },

    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 500000) {
            App.showToast('Imagem muito grande. Máximo: 500KB', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            const area = document.getElementById('logo-upload-area');
            area.innerHTML = `
                <img src="${dataUrl}" id="logo-preview" style="max-height:80px;border-radius:8px" alt="Logo">
                <button class="btn btn-sm btn-outline mt-2" onclick="Settings.removeLogo()">Remover Logo</button>
                <input type="file" id="logo-input" accept="image/png,image/jpeg,image/svg+xml" style="display:none" onchange="Settings.handleLogoUpload(event)">`;
            area._logoData = dataUrl;
        };
        reader.readAsDataURL(file);
    },

    removeLogo() {
        const area = document.getElementById('logo-upload-area');
        area.innerHTML = `
            <span class="material-icons-outlined" style="font-size:48px;color:var(--text-muted)">add_photo_alternate</span>
            <p class="text-muted text-small">Clique ou arraste uma imagem</p>
            <input type="file" id="logo-input" accept="image/png,image/jpeg,image/svg+xml" style="display:none" onchange="Settings.handleLogoUpload(event)">`;
        area._logoData = null;
    },

    refreshPreview() {
        const s = this._collectFormData();
        document.getElementById('pdf-preview').innerHTML = this._renderPreview(s);
    },

    _collectFormData() {
        const area = document.getElementById('logo-upload-area');
        const existing = DB.getSettings();
        const preview = document.getElementById('logo-preview');
        return {
            clinicName: document.getElementById('setting-clinic-name').value.trim(),
            professionalName: document.getElementById('setting-prof-name').value.trim(),
            primaryColor: document.getElementById('setting-primary-color').value,
            secondaryColor: document.getElementById('setting-secondary-color').value,
            phone: document.getElementById('setting-phone').value.trim(),
            address: document.getElementById('setting-address').value.trim(),
            logo: area._logoData || (preview ? preview.src : existing.logo) || null,
        };
    },

    save() {
        const data = this._collectFormData();
        DB.saveSettings(data);
        App.showToast('Configurações salvas com sucesso!', 'success');
    },

    resetDefaults() {
        App.openModal('Restaurar Padrão', `
            <p>Restaurar todas as configurações para os valores padrão?</p>
            <div class="modal-footer" style="padding:16px 0 0;border-top:1px solid var(--border);margin-top:16px">
                <button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-danger" onclick="Settings.doReset()">Restaurar</button>
            </div>`);
    },

    doReset() {
        DB.saveSettings({ clinicName: 'NutriSys', primaryColor: '#00b894', secondaryColor: '#6c5ce7', logo: null });
        App.closeModal();
        App.renderPage('settings');
        App.showToast('Configurações restauradas', 'info');
    },

    // Inicializar click no upload area
    initUploadArea() {
        const area = document.getElementById('logo-upload-area');
        if (area) {
            area.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
                    document.getElementById('logo-input').click();
                }
            });
        }
    }
};
