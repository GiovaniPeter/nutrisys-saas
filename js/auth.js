/* ============================================
   NutreClin - Módulo de Autenticação
   Multi-usuário com perfis (nutricionista / secretária)
   ============================================ */

const Auth = {
    // Páginas que a secretária pode acessar
    SECRETARY_PAGES: ['dashboard', 'patients', 'appointments', 'schedule', 'chat', 'whatsapp', 'kpis', 'shopping', 'reports'],

    init() {
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        document.getElementById('btn-logout').addEventListener('click', () => {
            this.handleLogout();
        });

        // Preenche e-mail salvo
        const saved = localStorage.getItem('nutrisys_saved_email');
        if (saved) {
            document.getElementById('login-email').value = saved;
            const cb = document.getElementById('login-remember');
            if (cb) cb.checked = true;
        }
    },

    handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const remember = document.getElementById('login-remember')?.checked;

        const users = DB.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Salvar e-mail se marcado
            if (remember) {
                localStorage.setItem('nutrisys_saved_email', email);
            } else {
                localStorage.removeItem('nutrisys_saved_email');
            }
            DB.setUser({ name: user.name, email: user.email, role: user.role, crn: user.crn || '' });
            App.showApp();
            App.showToast('Bem-vindo(a) ao NutreClin!', 'success');
        } else {
            App.showToast('E-mail ou senha incorretos', 'error');
        }
    },

    forgotPassword() {
        const users = DB.getUsers();
        const body = `
            <p style="color:var(--text-light);margin-bottom:16px">Selecione seu usuário para ver as credenciais de acesso:</p>
            <div style="display:flex;flex-direction:column;gap:10px">
                ${users.map(u => `
                <div style="background:var(--bg-light);border:1px solid var(--border);border-radius:8px;padding:14px 16px">
                    <div style="font-weight:600;color:var(--text)">${App.escapeHtml(u.name)}</div>
                    <div style="font-size:0.82rem;color:var(--text-muted);margin-top:2px">
                        <span style="font-weight:500">E-mail:</span> ${App.escapeHtml(u.email)}
                    </div>
                    <div style="font-size:0.82rem;color:var(--text-muted);margin-top:2px">
                        <span style="font-weight:500">Senha:</span> ${App.escapeHtml(u.password)}
                    </div>
                </div>`).join('')}
            </div>
            <p style="font-size:0.75rem;color:var(--text-muted);margin-top:16px;text-align:center">⚙️ Altere as senhas em Configurações após entrar.</p>
        `;
        App.openModal('Recuperar Acesso', body);
    },

    loginWithGoogle() {
        App.showToast('Login com Google disponível na versão completa', 'info');
    },

    handleLogout() {
        DB.clearUser();
        document.getElementById('app').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('login-password').value = '';
    },

    isLoggedIn() {
        return DB.getUser() !== null;
    },

    getCurrentUser() {
        return DB.getUser();
    },

    isNutritionist() {
        const u = this.getCurrentUser();
        return u && u.role === 'nutricionista';
    },

    isSecretary() {
        const u = this.getCurrentUser();
        return u && u.role === 'secretaria';
    },

    canAccess(page) {
        if (this.isNutritionist()) return true;
        return this.SECRETARY_PAGES.includes(page);
    }
};
