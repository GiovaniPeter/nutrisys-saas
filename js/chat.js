/* ============================================
   NutriSys - Chat & Videoconferência
   Sistema de mensagens + integração Jitsi Meet
   ============================================ */

const Chat = {
    selectedPatient: '',
    autoScroll: true,
    _vcInterval: null,
    _vcSeconds: 0,
    _vcRoom: '',

    render() {
        const patients = DB.getPatients();
        if (!this.selectedPatient && patients.length) this.selectedPatient = patients[0].id;

        const unreadMap = this._getUnreadCounts();

        return `
            <div class="chat-layout">
                <!-- Lista de pacientes -->
                <div class="chat-sidebar">
                    <div class="chat-sidebar-header">
                        <h4><span class="material-icons-outlined">chat</span> Conversas</h4>
                    </div>
                    <div class="chat-patient-list">
                        ${patients.map(p => {
                            const lastMsg = this._getLastMessage(p.id);
                            const unread = unreadMap[p.id] || 0;
                            return `
                            <div class="chat-patient-item ${p.id === this.selectedPatient ? 'active' : ''}" onclick="Chat.selectPatient('${p.id}')">
                                <div class="avatar-sm">${p.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
                                <div class="chat-patient-info">
                                    <strong>${App.escapeHtml(p.name)}</strong>
                                    <span class="text-small text-muted chat-last-msg">${lastMsg ? App.escapeHtml(lastMsg.text).substring(0, 35) + (lastMsg.text.length > 35 ? '...' : '') : 'Sem mensagens'}</span>
                                </div>
                                ${unread ? `<span class="chat-unread-badge">${unread}</span>` : ''}
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <!-- Área do chat -->
                <div class="chat-main">
                    ${this.selectedPatient ? this._renderChatArea() : '<div class="chat-empty"><span class="material-icons-outlined" style="font-size:64px;color:#dfe6e9">chat_bubble_outline</span><p>Selecione um paciente</p></div>'}
                </div>
            </div>
        `;
    },

    _renderChatArea() {
        const p = DB.getPatient(this.selectedPatient);
        if (!p) return '';
        const msgs = DB.getChatMessages().filter(m => m.patientId === p.id)
            .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

        return `
            <div class="chat-area-header">
                <div class="flex items-center gap-2">
                    <div class="avatar-sm">${p.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
                    <div>
                        <strong>${App.escapeHtml(p.name)}</strong>
                        <span class="text-small text-muted" style="display:block">${App.escapeHtml(p.phone || p.email || '')}</span>
                    </div>
                </div>
                <div class="flex items-center gap-1">
                    <button class="btn btn-sm btn-outline" onclick="Chat.startVideoCall()" title="Videochamada">
                        <span class="material-icons-outlined">videocam</span>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="Chat.sendWhatsApp()" title="WhatsApp">
                        <span class="material-icons-outlined">phone</span>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="Chat.clearChat()" title="Limpar conversa">
                        <span class="material-icons-outlined">delete_sweep</span>
                    </button>
                </div>
            </div>
            <div class="chat-messages" id="chat-messages">
                ${msgs.length ? this._renderMessages(msgs) : '<p class="text-center text-muted" style="padding:40px">Inicie uma conversa com o paciente</p>'}
            </div>
            <div class="chat-input-area">
                <button class="btn-icon" onclick="Chat.attachFile()" title="Anexar arquivo">
                    <span class="material-icons-outlined">attach_file</span>
                </button>
                <input type="text" id="chat-input" class="chat-text-input" placeholder="Digite uma mensagem..." onkeydown="if(event.key==='Enter')Chat.send()">
                <button class="btn-icon" onclick="Chat.send()" style="color:var(--primary)" title="Enviar">
                    <span class="material-icons-outlined">send</span>
                </button>
            </div>
        `;
    },

    _renderMessages(msgs) {
        let html = '';
        let lastDate = '';
        msgs.forEach(m => {
            const msgDate = m.createdAt ? m.createdAt.split('T')[0] : '';
            if (msgDate && msgDate !== lastDate) {
                lastDate = msgDate;
                html += `<div class="chat-date-sep">${App.formatDate(msgDate)}</div>`;
            }
            const isSent = m.sender === 'nutricionista';
            html += `<div class="chat-bubble ${isSent ? 'sent' : 'received'}">
                ${m.attachment ? `<div class="chat-attachment">${m.attachmentType === 'image' ? `<img src="${m.attachment}" class="chat-att-img">` : `<a href="${m.attachment}" target="_blank" class="text-small"><span class="material-icons-outlined">description</span> Arquivo anexo</a>`}</div>` : ''}
                <p>${App.escapeHtml(m.text)}</p>
                <span class="chat-time">${this._fmtTime(m.createdAt)}</span>
            </div>`;
        });
        return html;
    },

    _fmtTime(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },

    _getLastMessage(patientId) {
        const msgs = DB.getChatMessages().filter(m => m.patientId === patientId);
        if (!msgs.length) return null;
        return msgs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))[0];
    },

    _getUnreadCounts() {
        const msgs = DB.getChatMessages();
        const counts = {};
        msgs.forEach(m => {
            if (m.sender === 'paciente' && !m.read) {
                counts[m.patientId] = (counts[m.patientId] || 0) + 1;
            }
        });
        return counts;
    },

    selectPatient(id) {
        this.selectedPatient = id;
        // Mark as read
        const msgs = DB.getChatMessages().filter(m => m.patientId === id && m.sender === 'paciente' && !m.read);
        msgs.forEach(m => {
            m.read = true;
            const all = DB.getChatMessages();
            const idx = all.findIndex(a => a.id === m.id);
            if (idx >= 0) { all[idx] = m; localStorage.setItem(DB.KEYS.CHAT_MESSAGES, JSON.stringify(all)); }
        });
        App.renderPage('chat');
        setTimeout(() => this._scrollBottom(), 50);
    },

    send() {
        const input = document.getElementById('chat-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        DB.addChatMessage({
            patientId: this.selectedPatient,
            sender: 'nutricionista',
            text,
            read: true
        });
        input.value = '';
        App.renderPage('chat');
        setTimeout(() => this._scrollBottom(), 50);
    },

    attachFile() {
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*,.pdf';
        inp.onchange = () => {
            if (!inp.files[0]) return;
            const file = inp.files[0];
            if (file.size > 2 * 1024 * 1024) { App.showToast('Arquivo muito grande (máx 2MB)', 'error'); return; }
            const reader = new FileReader();
            reader.onload = (e) => {
                const isImage = file.type.startsWith('image/');
                DB.addChatMessage({
                    patientId: this.selectedPatient,
                    sender: 'nutricionista',
                    text: isImage ? '📷 Imagem' : '📎 Arquivo: ' + file.name,
                    attachment: e.target.result,
                    attachmentType: isImage ? 'image' : 'file',
                    read: true
                });
                App.renderPage('chat');
                setTimeout(() => this._scrollBottom(), 50);
            };
            reader.readAsDataURL(file);
        };
        inp.click();
    },

    startVideoCall() {
        const p = DB.getPatient(this.selectedPatient);
        if (!p) return;

        const room = 'nutrisys-' + this.selectedPatient.substring(0, 8);
        const url = 'https://meet.jit.si/' + room;
        this._vcRoom = url;

        // Preenche o overlay com dados do paciente
        const initials = p.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        document.getElementById('vc-avatar').textContent = initials;
        document.getElementById('vc-patient-name').textContent = p.name;
        document.getElementById('vc-room-url').textContent = url;

        // Carrega o Jitsi no iframe configurado
        const iframe = document.getElementById('vc-iframe');
        const jitsiUrl = `https://meet.jit.si/${room}#config.prejoinPageEnabled=false`
            + `&config.startWithAudioMuted=false`
            + `&config.startWithVideoMuted=false`
            + `&config.disableInviteFunctions=true`
            + `&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false`
            + `&interfaceConfig.SHOW_BRAND_WATERMARK=false`;
        iframe.src = jitsiUrl;

        // Exibe o overlay
        document.getElementById('videocall-overlay').classList.remove('hidden');

        // Inicia o timer
        this._vcSeconds = 0;
        clearInterval(this._vcInterval);
        this._vcInterval = setInterval(() => {
            this._vcSeconds++;
            const m = String(Math.floor(this._vcSeconds / 60)).padStart(2, '0');
            const s = String(this._vcSeconds % 60).padStart(2, '0');
            const el = document.getElementById('vc-timer');
            if (el) el.textContent = `${m}:${s}`;
        }, 1000);

        // Registra no chat
        DB.addChatMessage({
            patientId: this.selectedPatient,
            sender: 'nutricionista',
            text: `📹 Videochamada iniciada. Link da sala: ${url}`,
            read: true
        });

        App.renderPage('chat');
    },

    endVideoCall() {
        clearInterval(this._vcInterval);
        this._vcInterval = null;

        // Para o iframe e esconde o overlay
        const iframe = document.getElementById('vc-iframe');
        if (iframe) iframe.src = 'about:blank';
        document.getElementById('videocall-overlay').classList.add('hidden');

        // Registra duração no chat
        if (this._vcSeconds > 0) {
            const m = Math.floor(this._vcSeconds / 60);
            const s = this._vcSeconds % 60;
            const duracao = m > 0
                ? `${m} min ${s > 0 ? s + ' s' : ''}`.trim()
                : `${s} s`;
            DB.addChatMessage({
                patientId: this.selectedPatient,
                sender: 'nutricionista',
                text: `📹 Videochamada encerrada. Duração: ${duracao}.`,
                read: true
            });
            this._vcSeconds = 0;
            App.renderPage('chat');
        }

        App.showToast('Videochamada encerrada', 'success');
    },

    copyVideoLink() {
        if (!this._vcRoom) return;
        navigator.clipboard.writeText(this._vcRoom)
            .then(() => App.showToast('Link copiado!', 'success'))
            .catch(() => {
                // fallback para browsers sem clipboard API
                const ta = document.createElement('textarea');
                ta.value = this._vcRoom;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
                App.showToast('Link copiado!', 'success');
            });
    },

    shareVideoViaWhatsApp() {
        const p = DB.getPatient(this.selectedPatient);
        if (!p || !this._vcRoom) return;
        const phone = p.phone ? p.phone.replace(/\D/g, '') : '';
        const text = encodeURIComponent(
            `Olá ${p.name.split(' ')[0]}! Sua consulta online está pronta. Acesse: ${this._vcRoom}`
        );
        const waUrl = phone
            ? `https://wa.me/55${phone}?text=${text}`
            : `https://wa.me/?text=${text}`;
        window.open(waUrl, '_blank');
    },

    sendWhatsApp() {
        const p = DB.getPatient(this.selectedPatient);
        if (!p || !p.phone) { App.showToast('Paciente sem telefone cadastrado', 'error'); return; }
        const phone = p.phone.replace(/\D/g, '');
        const url = `https://wa.me/55${phone}`;
        window.open(url, '_blank');
    },

    clearChat() {
        if (!confirm('Limpar todas as mensagens com este paciente?')) return;
        const all = DB.getChatMessages().filter(m => m.patientId !== this.selectedPatient);
        localStorage.setItem(DB.KEYS.CHAT_MESSAGES, JSON.stringify(all));
        App.showToast('Conversa limpa', 'success');
        App.renderPage('chat');
    },

    _scrollBottom() {
        const el = document.getElementById('chat-messages');
        if (el) el.scrollTop = el.scrollHeight;
    }
};
