/* ============================================
   NutriSys - Módulo Principal da Aplicação
   ============================================ */

const App = {
    currentPage: 'dashboard',

    init() {
        // Seed dados iniciais
        DB.seed();

        // Inicializar autenticação
        Auth.init();

        // Verificar login
        if (Auth.isLoggedIn()) {
            this.showApp();
        }

        // Navegação
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.navigate(page);
            });
        });

        // Toggle sidebar mobile
        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Fechar sidebar ao clicar fora (mobile)
        document.querySelector('.main-content').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
        });

        // Modal close
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modal-overlay')) this.closeModal();
        });

        // Data de hoje
        this.updateDate();

        // Toast container
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);

        // Dark mode
        DarkMode.init();
    },

    showApp() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');

        const user = Auth.getCurrentUser();
        if (user) {
            document.getElementById('user-name').textContent = user.name;
            // Filtrar nav por perfil
            document.querySelectorAll('.nav-item').forEach(item => {
                const page = item.getAttribute('data-page');
                item.style.display = Auth.canAccess(page) ? '' : 'none';
            });
            // Mostra badge de perfil
            const badge = document.getElementById('user-role-badge');
            if (badge) badge.textContent = user.role === 'secretaria' ? 'Secretária' : 'Nutricionista';
        }

        // Notificações
        Notifications.init();

        this.navigate('dashboard');
    },

    navigate(page) {
        // Verificar permissão
        if (!Auth.canAccess(page)) {
            App.showToast('Você não tem permissão para acessar esta página', 'error');
            page = 'dashboard';
        }

        // Reset subviews
        if (page === 'patients') {
            Patients.currentView = 'list';
            Patients.currentPatientId = null;
        }
        if (page === 'mealplans') {
            MealPlans.currentView = 'list';
            MealPlans.currentPlanId = null;
        }
        if (page === 'evolution') {
            BodyEvolution.currentView = 'list';
            BodyEvolution.currentPatientId = null;
        }
        if (page === 'recipes') {
            Recipes.currentView = 'list';
            Recipes.currentRecipeId = null;
        }
        if (page === 'recall') {
            Recall.currentView = 'list';
            Recall.currentRecallId = null;
        }

        this.currentPage = page;

        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-page') === page);
        });

        // Update title
        const titles = {
            dashboard: 'Dashboard',
            patients: 'Pacientes',
            mealplans: 'Cardápios',
            appointments: 'Consultas',
            foods: 'Alimentos',
            energy: 'Gasto Energético',
            anamnesis: 'Anamnese',
            labexams: 'Exames Laboratoriais',
            supplements: 'Suplementos e Fitoterápicos',
            evolution: 'Evolução Corporal',
            settings: 'Configurações',
            schedule: 'Agenda Inteligente',
            financial: 'Controle Financeiro',
            kpis: 'Retenção & KPIs',
            recipes: 'Receitas',
            shopping: 'Lista de Compras',
            recall: 'Recordatório 24h',
            reports: 'Relatórios PDF',
            portal: 'Portal do Paciente',
            diario: 'Diário Alimentar',
            hidratacao: 'Hidratação & Metas',
            chat: 'Chat & Videoconferência',
            whatsapp: 'WhatsApp',
            canva: 'Materiais Educativos'
        };
        document.getElementById('page-title').textContent = titles[page] || page;

        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');

        this.renderPage(page);
    },

    renderPage(page) {
        const content = document.getElementById('content-area');
        let html = '';

        switch (page || this.currentPage) {
            case 'dashboard':
                html = Dashboard.render();
                break;
            case 'patients':
                html = Patients.render();
                break;
            case 'mealplans':
                html = MealPlans.render();
                break;
            case 'appointments':
                html = Appointments.render();
                break;
            case 'foods':
                html = Foods.render();
                break;
            case 'energy':
                html = EnergyExpenditure.render();
                break;
            case 'anamnesis':
                html = Anamnesis.render();
                break;
            case 'labexams':
                html = LabExams.render();
                break;
            case 'supplements':
                html = Supplements.render();
                break;
            case 'evolution':
                html = BodyEvolution.render();
                break;
            case 'settings':
                html = Settings.render();
                break;
            case 'schedule':
                html = Schedule.render();
                break;
            case 'financial':
                html = Financial.render();
                break;
            case 'kpis':
                html = KPIs.render();
                break;
            case 'recipes':
                html = Recipes.render();
                break;
            case 'shopping':
                html = ShoppingList.render();
                break;
            case 'recall':
                html = Recall.render();
                break;
            case 'reports':
                html = Reports.render();
                break;
            case 'portal':
                html = PatientPortal.render();
                break;
            case 'diario':
                html = FoodDiary.render();
                break;
            case 'hidratacao':
                html = Hydration.render();
                break;
            case 'chat':
                html = Chat.render();
                break;
            case 'whatsapp':
                html = WhatsApp.render();
                break;
            case 'canva':
                html = Canva.render();
                break;
            default:
                html = '<p>Página não encontrada</p>';
        }

        content.innerHTML = html;

        // Pós-render hooks
        if ((page || this.currentPage) === 'evolution') BodyEvolution._afterRender();
        if ((page || this.currentPage) === 'settings') Settings.initUploadArea();
        if ((page || this.currentPage) === 'schedule' && Schedule.selectedDate) {
            Schedule.selectDay(Schedule.selectedDate);
        }
        if ((page || this.currentPage) === 'chat') {
            setTimeout(() => Chat._scrollBottom(), 50);
        }
    },

    // ---------- MODAL ----------
    openModal(title, bodyHtml, sizeClass = '') {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHtml;
        const modal = document.getElementById('modal');
        modal.className = 'modal' + (sizeClass ? ' ' + sizeClass : '');
        document.getElementById('modal-overlay').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.body.style.overflow = '';
    },

    // ---------- TOAST ----------
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = { success: 'check_circle', error: 'error', info: 'info' };
        toast.innerHTML = `<span class="material-icons-outlined" style="font-size:20px">${icons[type] || 'info'}</span> ${this.escapeHtml(message)}`;

        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // ---------- HELPERS ----------
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00'));
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    updateDate() {
        const el = document.getElementById('today-date');
        if (el) {
            el.textContent = new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    }
};

// ─── Dark Mode ─────────────────────────────────────────
const DarkMode = {
    STORAGE_KEY: 'nutrisys_dark_mode',

    init() {
        const enabled = localStorage.getItem(this.STORAGE_KEY) === 'true';
        if (enabled) this._apply(true);

        const btn = document.getElementById('dark-mode-toggle');
        if (btn) btn.addEventListener('click', () => this.toggle());
    },

    toggle() {
        const enabled = document.documentElement.getAttribute('data-theme') === 'dark';
        this._apply(!enabled);
        localStorage.setItem(this.STORAGE_KEY, String(!enabled));
    },

    _apply(dark) {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        const icon = document.getElementById('dark-mode-icon');
        if (icon) icon.textContent = dark ? 'light_mode' : 'dark_mode';
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => App.init());
