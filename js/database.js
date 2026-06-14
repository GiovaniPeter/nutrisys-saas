/* ============================================
   NutreClin - Módulo de Banco de Dados (localStorage)
   ============================================ */

const DB = {
    // Chaves do localStorage
    KEYS: {
        USER: 'nutrisys_user',
        PATIENTS: 'nutrisys_patients',
        MEALPLANS: 'nutrisys_mealplans',
        APPOINTMENTS: 'nutrisys_appointments',
        FOODS: 'nutrisys_foods',
        ENERGY_CALCULATIONS: 'nutrisys_energy_calculations',
        ANAMNESIS: 'nutrisys_anamnesis',
        LAB_EXAMS: 'nutrisys_lab_exams',
        SUPPLEMENT_PRESCRIPTIONS: 'nutrisys_supplement_prescriptions',
        SETTINGS: 'nutrisys_settings',
        BODY_EVOLUTION: 'nutrisys_body_evolution',
        FINANCIAL_TRANSACTIONS: 'nutrisys_financial',
        USERS: 'nutrisys_users',
        SCHEDULE_CONFIG: 'nutrisys_schedule_config',
        FOOD_DIARY: 'nutrisys_food_diary',
        CHAT_MESSAGES: 'nutrisys_chat',
        PATIENT_GOALS: 'nutrisys_goals',
        HYDRATION_LOGS: 'nutrisys_hydration',
        RECIPES: 'nutrisys_recipes',
        RECALL: 'nutrisys_recall',
    },

    // --- Helpers ---
    _get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    _set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    // --- Usuário ---
    getUser() {
        return this._get(this.KEYS.USER);
    },
    setUser(user) {
        this._set(this.KEYS.USER, user);
    },
    clearUser() {
        localStorage.removeItem(this.KEYS.USER);
    },

    // --- CRUD Genérico ---
    getAll(key) {
        return this._get(key) || [];
    },
    getById(key, id) {
        const items = this.getAll(key);
        return items.find(item => item.id === id);
    },
    add(key, item) {
        const items = this.getAll(key);
        item.id = this._generateId();
        item.createdAt = new Date().toISOString();
        items.push(item);
        this._set(key, items);
        return item;
    },
    update(key, id, updates) {
        const items = this.getAll(key);
        const idx = items.findIndex(item => item.id === id);
        if (idx !== -1) {
            items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
            this._set(key, items);
            return items[idx];
        }
        return null;
    },
    remove(key, id) {
        let items = this.getAll(key);
        items = items.filter(item => item.id !== id);
        this._set(key, items);
    },

    // --- Atalhos ---
    getPatients() { return this.getAll(this.KEYS.PATIENTS); },
    getPatient(id) { return this.getById(this.KEYS.PATIENTS, id); },
    addPatient(p) { return this.add(this.KEYS.PATIENTS, p); },
    updatePatient(id, p) { return this.update(this.KEYS.PATIENTS, id, p); },
    removePatient(id) { this.remove(this.KEYS.PATIENTS, id); },

    getMealPlans() { return this.getAll(this.KEYS.MEALPLANS); },
    getMealPlan(id) { return this.getById(this.KEYS.MEALPLANS, id); },
    addMealPlan(m) { return this.add(this.KEYS.MEALPLANS, m); },
    updateMealPlan(id, m) { return this.update(this.KEYS.MEALPLANS, id, m); },
    removeMealPlan(id) { this.remove(this.KEYS.MEALPLANS, id); },

    getAppointments() { return this.getAll(this.KEYS.APPOINTMENTS); },
    addAppointment(a) { return this.add(this.KEYS.APPOINTMENTS, a); },
    updateAppointment(id, a) { return this.update(this.KEYS.APPOINTMENTS, id, a); },
    removeAppointment(id) { this.remove(this.KEYS.APPOINTMENTS, id); },

    getFoods() { return this.getAll(this.KEYS.FOODS); },
    addFood(f) { return this.add(this.KEYS.FOODS, f); },
    updateFood(id, f) { return this.update(this.KEYS.FOODS, id, f); },
    removeFood(id) { this.remove(this.KEYS.FOODS, id); },

    // Gasto Energético
    getEnergyCalculations() { return this.getAll(this.KEYS.ENERGY_CALCULATIONS); },
    getEnergyCalculation(id) { return this.getById(this.KEYS.ENERGY_CALCULATIONS, id); },
    addEnergyCalculation(c) { return this.add(this.KEYS.ENERGY_CALCULATIONS, c); },
    removeEnergyCalculation(id) { this.remove(this.KEYS.ENERGY_CALCULATIONS, id); },

    // Anamnese
    getAnamnesisRecords() { return this.getAll(this.KEYS.ANAMNESIS); },
    getAnamnesisRecord(id) { return this.getById(this.KEYS.ANAMNESIS, id); },
    addAnamnesisRecord(r) { return this.add(this.KEYS.ANAMNESIS, r); },
    updateAnamnesisRecord(id, r) { return this.update(this.KEYS.ANAMNESIS, id, r); },
    removeAnamnesisRecord(id) { this.remove(this.KEYS.ANAMNESIS, id); },

    // Exames Laboratoriais
    getLabExams() { return this.getAll(this.KEYS.LAB_EXAMS); },
    getLabExam(id) { return this.getById(this.KEYS.LAB_EXAMS, id); },
    addLabExam(e) { return this.add(this.KEYS.LAB_EXAMS, e); },
    removeLabExam(id) { this.remove(this.KEYS.LAB_EXAMS, id); },

    // Prescrição de Suplementos
    getSupplementPrescriptions() { return this.getAll(this.KEYS.SUPPLEMENT_PRESCRIPTIONS); },
    getSupplementPrescription(id) { return this.getById(this.KEYS.SUPPLEMENT_PRESCRIPTIONS, id); },
    addSupplementPrescription(s) { return this.add(this.KEYS.SUPPLEMENT_PRESCRIPTIONS, s); },
    updateSupplementPrescription(id, s) { return this.update(this.KEYS.SUPPLEMENT_PRESCRIPTIONS, id, s); },
    removeSupplementPrescription(id) { this.remove(this.KEYS.SUPPLEMENT_PRESCRIPTIONS, id); },

    // Configurações (Branding)
    getSettings() { return this._get(this.KEYS.SETTINGS) || {}; },
    saveSettings(s) { this._set(this.KEYS.SETTINGS, s); },

    // Evolução Corporal
    getBodyEvolutions() { return this.getAll(this.KEYS.BODY_EVOLUTION); },
    getBodyEvolution(id) { return this.getById(this.KEYS.BODY_EVOLUTION, id); },
    addBodyEvolution(e) { return this.add(this.KEYS.BODY_EVOLUTION, e); },
    updateBodyEvolution(id, e) { return this.update(this.KEYS.BODY_EVOLUTION, id, e); },
    removeBodyEvolution(id) { this.remove(this.KEYS.BODY_EVOLUTION, id); },

    // Financeiro
    getFinancialTransactions() { return this.getAll(this.KEYS.FINANCIAL_TRANSACTIONS); },
    getFinancialTransaction(id) { return this.getById(this.KEYS.FINANCIAL_TRANSACTIONS, id); },
    addFinancialTransaction(t) { return this.add(this.KEYS.FINANCIAL_TRANSACTIONS, t); },
    updateFinancialTransaction(id, t) { return this.update(this.KEYS.FINANCIAL_TRANSACTIONS, id, t); },
    removeFinancialTransaction(id) { this.remove(this.KEYS.FINANCIAL_TRANSACTIONS, id); },

    // Usuários
    getUsers() { return this.getAll(this.KEYS.USERS); },
    getUserByEmail(email) { return this.getUsers().find(u => u.email === email); },
    addUser(u) { return this.add(this.KEYS.USERS, u); },

    // Configuração de Agenda
    getScheduleConfig() { return this._get(this.KEYS.SCHEDULE_CONFIG) || {}; },
    saveScheduleConfig(c) { this._set(this.KEYS.SCHEDULE_CONFIG, c); },

    // Diário Alimentar
    getFoodDiaryEntries() { return this.getAll(this.KEYS.FOOD_DIARY); },
    addFoodDiaryEntry(e) { return this.add(this.KEYS.FOOD_DIARY, e); },
    updateFoodDiaryEntry(id, e) { return this.update(this.KEYS.FOOD_DIARY, id, e); },
    removeFoodDiaryEntry(id) { this.remove(this.KEYS.FOOD_DIARY, id); },

    // Chat
    getChatMessages() { return this.getAll(this.KEYS.CHAT_MESSAGES); },
    addChatMessage(m) { return this.add(this.KEYS.CHAT_MESSAGES, m); },

    // Metas do Paciente
    getPatientGoals() { return this.getAll(this.KEYS.PATIENT_GOALS); },
    addPatientGoal(g) { return this.add(this.KEYS.PATIENT_GOALS, g); },
    updatePatientGoal(id, g) { return this.update(this.KEYS.PATIENT_GOALS, id, g); },
    removePatientGoal(id) { this.remove(this.KEYS.PATIENT_GOALS, id); },

    // Hidratação
    getHydrationLogs() { return this.getAll(this.KEYS.HYDRATION_LOGS); },
    addHydrationLog(h) { return this.add(this.KEYS.HYDRATION_LOGS, h); },

    // --- Seed Data (dados iniciais) ---
    seed() {
        // Alimentos base — Tabela TACO/IBGE com medidas caseiras
        if (this.getFoods().length === 0) {
            const foods = [
                // === CEREAIS E DERIVADOS ===
                { name: 'Arroz branco cozido', portion: '100g', householdMeasure: '4 colheres de sopa', calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, fiber: 1.6, category: 'Cereais', source: 'TACO' },
                { name: 'Arroz integral cozido', portion: '100g', householdMeasure: '4 colheres de sopa', calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0, fiber: 2.7, category: 'Cereais', source: 'TACO' },
                { name: 'Aveia em flocos', portion: '30g', householdMeasure: '3 colheres de sopa', calories: 105, protein: 4.4, carbs: 18, fat: 2.3, fiber: 2.7, category: 'Cereais', source: 'TACO' },
                { name: 'Pão francês', portion: '50g', householdMeasure: '1 unidade', calories: 150, protein: 4.0, carbs: 31.1, fat: 1.1, fiber: 1.1, category: 'Cereais', source: 'TACO' },
                { name: 'Pão integral', portion: '25g', householdMeasure: '1 fatia', calories: 62, protein: 2.3, carbs: 11.3, fat: 1.0, fiber: 1.6, category: 'Cereais', source: 'TACO' },
                { name: 'Pão de forma branco', portion: '25g', householdMeasure: '1 fatia', calories: 71, protein: 2.0, carbs: 13.0, fat: 1.0, fiber: 0.6, category: 'Cereais', source: 'TACO' },
                { name: 'Macarrão cozido', portion: '100g', householdMeasure: '1 escumadeira', calories: 102, protein: 3.4, carbs: 19.9, fat: 0.6, fiber: 1.5, category: 'Cereais', source: 'TACO' },
                { name: 'Macarrão integral cozido', portion: '100g', householdMeasure: '1 escumadeira', calories: 111, protein: 4.4, carbs: 20.6, fat: 1.1, fiber: 2.9, category: 'Cereais', source: 'TACO' },
                { name: 'Granola', portion: '40g', householdMeasure: '1/2 xícara', calories: 180, protein: 3.6, carbs: 28, fat: 6, fiber: 2.5, category: 'Cereais', source: 'TACO' },
                { name: 'Milho verde cozido', portion: '100g', householdMeasure: '1 espiga', calories: 96, protein: 3.4, carbs: 18.6, fat: 1.4, fiber: 2.5, category: 'Cereais', source: 'TACO' },
                { name: 'Cuscuz de milho cozido', portion: '100g', householdMeasure: '1 fatia média', calories: 113, protein: 2.4, carbs: 23.2, fat: 0.8, fiber: 1.4, category: 'Cereais', source: 'TACO' },
                { name: 'Tapioca (goma)', portion: '30g', householdMeasure: '2 colheres de sopa', calories: 108, protein: 0.0, carbs: 26.4, fat: 0.1, fiber: 0.3, category: 'Cereais', source: 'TACO' },
                { name: 'Farinha de mandioca', portion: '20g', householdMeasure: '1 colher de sopa', calories: 70, protein: 0.3, carbs: 17.1, fat: 0.1, fiber: 1.3, category: 'Cereais', source: 'TACO' },
                { name: 'Quinoa cozida', portion: '100g', householdMeasure: '4 colheres de sopa', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, category: 'Cereais', source: 'IBGE' },

                // === LEGUMINOSAS ===
                { name: 'Feijão preto cozido', portion: '100g', householdMeasure: '1 concha', calories: 77, protein: 4.5, carbs: 14, fat: 0.5, fiber: 8.4, category: 'Leguminosas', source: 'TACO' },
                { name: 'Feijão carioca cozido', portion: '100g', householdMeasure: '1 concha', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 5.5, category: 'Leguminosas', source: 'TACO' },
                { name: 'Lentilha cozida', portion: '100g', householdMeasure: '1 concha', calories: 93, protein: 6.3, carbs: 16.3, fat: 0.5, fiber: 7.9, category: 'Leguminosas', source: 'TACO' },
                { name: 'Grão-de-bico cozido', portion: '100g', householdMeasure: '1 concha', calories: 130, protein: 6.7, carbs: 18.4, fat: 2.9, fiber: 5.1, category: 'Leguminosas', source: 'TACO' },
                { name: 'Ervilha cozida', portion: '100g', householdMeasure: '4 colheres de sopa', calories: 63, protein: 4.9, carbs: 10.6, fat: 0.3, fiber: 5.1, category: 'Leguminosas', source: 'TACO' },
                { name: 'Soja cozida', portion: '100g', householdMeasure: '4 colheres de sopa', calories: 151, protein: 14.0, carbs: 7.5, fat: 7.7, fiber: 5.6, category: 'Leguminosas', source: 'TACO' },

                // === CARNES ===
                { name: 'Peito de frango grelhado', portion: '100g', householdMeasure: '1 filé médio', calories: 159, protein: 32, carbs: 0, fat: 3.2, fiber: 0, category: 'Carnes', source: 'TACO' },
                { name: 'Coxa de frango assada', portion: '100g', householdMeasure: '1 coxa', calories: 215, protein: 27.2, carbs: 0, fat: 11.3, fiber: 0, category: 'Carnes', source: 'TACO' },
                { name: 'Patinho bovino grelhado', portion: '100g', householdMeasure: '1 bife médio', calories: 219, protein: 35.9, carbs: 0, fat: 7.3, fiber: 0, category: 'Carnes', source: 'TACO' },
                { name: 'Alcatra grelhada', portion: '100g', householdMeasure: '1 bife médio', calories: 212, protein: 32.4, carbs: 0, fat: 8.0, fiber: 0, category: 'Carnes', source: 'TACO' },
                { name: 'Carne moída refogada', portion: '100g', householdMeasure: '4 colheres de sopa', calories: 212, protein: 26.7, carbs: 0, fat: 11.2, fiber: 0, category: 'Carnes', source: 'TACO' },
                { name: 'Fígado bovino grelhado', portion: '100g', householdMeasure: '1 bife médio', calories: 225, protein: 29.4, carbs: 4.3, fat: 9.0, fiber: 0, category: 'Carnes', source: 'TACO' },
                { name: 'Lombo suíno assado', portion: '100g', householdMeasure: '1 fatia grossa', calories: 210, protein: 28.9, carbs: 0, fat: 9.9, fiber: 0, category: 'Carnes', source: 'TACO' },
                { name: 'Peru (peito) assado', portion: '100g', householdMeasure: '2 fatias grossas', calories: 145, protein: 29.3, carbs: 0, fat: 2.5, fiber: 0, category: 'Carnes', source: 'TACO' },
                { name: 'Carne seca desfiada', portion: '100g', householdMeasure: '4 colheres de sopa', calories: 250, protein: 33.0, carbs: 0, fat: 12.5, fiber: 0, category: 'Carnes', source: 'IBGE' },

                // === PEIXES E FRUTOS DO MAR ===
                { name: 'Salmão grelhado', portion: '100g', householdMeasure: '1 filé pequeno', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, category: 'Peixes', source: 'TACO' },
                { name: 'Tilápia grelhada', portion: '100g', householdMeasure: '1 filé médio', calories: 128, protein: 26, carbs: 0, fat: 2.7, fiber: 0, category: 'Peixes', source: 'TACO' },
                { name: 'Atum enlatado em água', portion: '100g', householdMeasure: '1 lata drenada', calories: 116, protein: 25.5, carbs: 0, fat: 0.8, fiber: 0, category: 'Peixes', source: 'TACO' },
                { name: 'Sardinha assada', portion: '100g', householdMeasure: '2 unidades', calories: 164, protein: 24.6, carbs: 0, fat: 7.0, fiber: 0, category: 'Peixes', source: 'TACO' },
                { name: 'Merluza cozida', portion: '100g', householdMeasure: '1 filé médio', calories: 122, protein: 19.3, carbs: 0, fat: 4.7, fiber: 0, category: 'Peixes', source: 'TACO' },
                { name: 'Camarão cozido', portion: '100g', householdMeasure: '10 unidades médias', calories: 90, protein: 18.4, carbs: 0, fat: 1.5, fiber: 0, category: 'Peixes', source: 'TACO' },

                // === OVOS ===
                { name: 'Ovo cozido', portion: '50g', householdMeasure: '1 unidade', calories: 72, protein: 6.3, carbs: 0.4, fat: 5, fiber: 0, category: 'Ovos', source: 'TACO' },
                { name: 'Ovo mexido', portion: '60g', householdMeasure: '1 unidade', calories: 88, protein: 6.0, carbs: 0.7, fat: 6.8, fiber: 0, category: 'Ovos', source: 'TACO' },
                { name: 'Clara de ovo cozida', portion: '33g', householdMeasure: '1 unidade', calories: 16, protein: 3.6, carbs: 0.3, fat: 0, fiber: 0, category: 'Ovos', source: 'TACO' },

                // === FRUTAS ===
                { name: 'Banana prata', portion: '86g', householdMeasure: '1 unidade', calories: 98, protein: 1.3, carbs: 26, fat: 0.1, fiber: 2, category: 'Frutas', source: 'TACO' },
                { name: 'Maçã fuji', portion: '130g', householdMeasure: '1 unidade', calories: 78, protein: 0.3, carbs: 20, fat: 0, fiber: 1.3, category: 'Frutas', source: 'TACO' },
                { name: 'Mamão papaya', portion: '100g', householdMeasure: '1/2 unidade', calories: 40, protein: 0.5, carbs: 10.4, fat: 0.1, fiber: 1, category: 'Frutas', source: 'TACO' },
                { name: 'Morango', portion: '100g', householdMeasure: '8 unidades', calories: 30, protein: 0.9, carbs: 6.8, fat: 0.3, fiber: 1.7, category: 'Frutas', source: 'TACO' },
                { name: 'Abacate', portion: '100g', householdMeasure: '4 colheres de sopa', calories: 96, protein: 1.2, carbs: 6, fat: 8.4, fiber: 6.3, category: 'Frutas', source: 'TACO' },
                { name: 'Laranja pera', portion: '137g', householdMeasure: '1 unidade', calories: 56, protein: 1.0, carbs: 13.2, fat: 0.1, fiber: 1.0, category: 'Frutas', source: 'TACO' },
                { name: 'Manga tommy', portion: '110g', householdMeasure: '1/2 unidade', calories: 72, protein: 0.4, carbs: 19.4, fat: 0.2, fiber: 1.6, category: 'Frutas', source: 'TACO' },
                { name: 'Melancia', portion: '100g', householdMeasure: '1 fatia pequena', calories: 33, protein: 0.9, carbs: 8.1, fat: 0, fiber: 0.1, category: 'Frutas', source: 'TACO' },
                { name: 'Abacaxi', portion: '100g', householdMeasure: '1 fatia média', calories: 48, protein: 0.9, carbs: 12.3, fat: 0.1, fiber: 1.0, category: 'Frutas', source: 'TACO' },
                { name: 'Uva itália', portion: '100g', householdMeasure: '10 bagos', calories: 53, protein: 0.7, carbs: 13.6, fat: 0.2, fiber: 0.9, category: 'Frutas', source: 'TACO' },
                { name: 'Pera williams', portion: '133g', householdMeasure: '1 unidade', calories: 67, protein: 0.5, carbs: 17.6, fat: 0.1, fiber: 3.0, category: 'Frutas', source: 'TACO' },
                { name: 'Kiwi', portion: '76g', householdMeasure: '1 unidade', calories: 42, protein: 0.9, carbs: 10.3, fat: 0.2, fiber: 1.9, category: 'Frutas', source: 'TACO' },
                { name: 'Melão', portion: '100g', householdMeasure: '1 fatia média', calories: 29, protein: 0.7, carbs: 7.5, fat: 0, fiber: 0.3, category: 'Frutas', source: 'TACO' },
                { name: 'Goiaba vermelha', portion: '100g', householdMeasure: '1 unidade', calories: 54, protein: 1.1, carbs: 13.0, fat: 0.4, fiber: 6.2, category: 'Frutas', source: 'TACO' },
                { name: 'Açaí (polpa)', portion: '100g', householdMeasure: '1/2 copo', calories: 58, protein: 0.8, carbs: 6.2, fat: 3.9, fiber: 2.6, category: 'Frutas', source: 'TACO' },

                // === VERDURAS E LEGUMES ===
                { name: 'Brócolis cozido', portion: '100g', householdMeasure: '4 colheres de sopa', calories: 25, protein: 2.1, carbs: 4, fat: 0.3, fiber: 3.4, category: 'Verduras', source: 'TACO' },
                { name: 'Alface americana', portion: '100g', householdMeasure: '6 folhas', calories: 11, protein: 1.2, carbs: 1.7, fat: 0.2, fiber: 1, category: 'Verduras', source: 'TACO' },
                { name: 'Tomate', portion: '100g', householdMeasure: '4 fatias', calories: 15, protein: 1.1, carbs: 3.1, fat: 0.2, fiber: 1.2, category: 'Verduras', source: 'TACO' },
                { name: 'Cenoura crua', portion: '100g', householdMeasure: '1 unidade média', calories: 34, protein: 1.3, carbs: 7.7, fat: 0.2, fiber: 3.2, category: 'Verduras', source: 'TACO' },
                { name: 'Abobrinha cozida', portion: '100g', householdMeasure: '3 colheres de sopa', calories: 15, protein: 0.6, carbs: 3.0, fat: 0.1, fiber: 1.6, category: 'Verduras', source: 'TACO' },
                { name: 'Berinjela cozida', portion: '100g', householdMeasure: '3 colheres de sopa', calories: 19, protein: 0.7, carbs: 4.4, fat: 0.1, fiber: 2.5, category: 'Verduras', source: 'TACO' },
                { name: 'Espinafre cozido', portion: '100g', householdMeasure: '3 colheres de sopa', calories: 22, protein: 2.0, carbs: 3.6, fat: 0.1, fiber: 2.1, category: 'Verduras', source: 'TACO' },
                { name: 'Couve refogada', portion: '100g', householdMeasure: '3 colheres de sopa', calories: 90, protein: 2.9, carbs: 7.1, fat: 5.6, fiber: 4.3, category: 'Verduras', source: 'TACO' },
                { name: 'Rúcula', portion: '100g', householdMeasure: '1 prato', calories: 17, protein: 2.6, carbs: 2.2, fat: 0.3, fiber: 1.6, category: 'Verduras', source: 'TACO' },
                { name: 'Pepino', portion: '100g', householdMeasure: '6 fatias', calories: 10, protein: 0.8, carbs: 2.0, fat: 0.1, fiber: 1.1, category: 'Verduras', source: 'TACO' },
                { name: 'Chuchu cozido', portion: '100g', householdMeasure: '3 colheres de sopa', calories: 17, protein: 0.4, carbs: 3.8, fat: 0.1, fiber: 1.6, category: 'Verduras', source: 'TACO' },
                { name: 'Beterraba cozida', portion: '100g', householdMeasure: '3 fatias', calories: 32, protein: 1.2, carbs: 7.2, fat: 0.1, fiber: 1.9, category: 'Verduras', source: 'TACO' },
                { name: 'Vagem cozida', portion: '100g', householdMeasure: '5 colheres de sopa', calories: 25, protein: 1.6, carbs: 5.5, fat: 0.1, fiber: 3.2, category: 'Verduras', source: 'TACO' },
                { name: 'Repolho cru', portion: '100g', householdMeasure: '4 colheres de sopa', calories: 17, protein: 0.9, carbs: 3.9, fat: 0.1, fiber: 1.5, category: 'Verduras', source: 'TACO' },

                // === TUBÉRCULOS ===
                { name: 'Batata doce cozida', portion: '100g', householdMeasure: '1 unidade pequena', calories: 77, protein: 0.6, carbs: 18.4, fat: 0.1, fiber: 2.2, category: 'Tubérculos', source: 'TACO' },
                { name: 'Batata inglesa cozida', portion: '100g', householdMeasure: '1 unidade pequena', calories: 52, protein: 1.2, carbs: 11.9, fat: 0.1, fiber: 1.3, category: 'Tubérculos', source: 'TACO' },
                { name: 'Mandioca cozida', portion: '100g', householdMeasure: '2 pedaços', calories: 125, protein: 0.6, carbs: 30.1, fat: 0.3, fiber: 1.6, category: 'Tubérculos', source: 'TACO' },
                { name: 'Inhame cozido', portion: '100g', householdMeasure: '2 fatias', calories: 97, protein: 2.1, carbs: 23.2, fat: 0.1, fiber: 1.7, category: 'Tubérculos', source: 'TACO' },
                { name: 'Cará cozido', portion: '100g', householdMeasure: '2 fatias', calories: 77, protein: 1.6, carbs: 18.3, fat: 0.1, fiber: 1.5, category: 'Tubérculos', source: 'TACO' },

                // === LATICÍNIOS ===
                { name: 'Leite desnatado', portion: '200ml', householdMeasure: '1 copo', calories: 67, protein: 6.6, carbs: 10, fat: 0.4, fiber: 0, category: 'Laticínios', source: 'TACO' },
                { name: 'Leite integral', portion: '200ml', householdMeasure: '1 copo', calories: 114, protein: 6.0, carbs: 9.0, fat: 6.2, fiber: 0, category: 'Laticínios', source: 'TACO' },
                { name: 'Iogurte natural desnatado', portion: '170g', householdMeasure: '1 pote', calories: 64, protein: 6.1, carbs: 8.5, fat: 0.3, fiber: 0, category: 'Laticínios', source: 'TACO' },
                { name: 'Iogurte natural integral', portion: '170g', householdMeasure: '1 pote', calories: 88, protein: 5.6, carbs: 10, fat: 2.6, fiber: 0, category: 'Laticínios', source: 'TACO' },
                { name: 'Queijo cottage', portion: '100g', householdMeasure: '3 colheres de sopa', calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3, fiber: 0, category: 'Laticínios', source: 'TACO' },
                { name: 'Queijo minas frescal', portion: '30g', householdMeasure: '1 fatia', calories: 73, protein: 5.2, carbs: 0.9, fat: 5.5, fiber: 0, category: 'Laticínios', source: 'TACO' },
                { name: 'Queijo muçarela', portion: '30g', householdMeasure: '1 fatia', calories: 95, protein: 7.2, carbs: 0.5, fat: 7.0, fiber: 0, category: 'Laticínios', source: 'TACO' },
                { name: 'Requeijão light', portion: '30g', householdMeasure: '1 colher de sopa', calories: 45, protein: 2.4, carbs: 1.5, fat: 3.2, fiber: 0, category: 'Laticínios', source: 'TACO' },
                { name: 'Cream cheese light', portion: '30g', householdMeasure: '1 colher de sopa', calories: 48, protein: 2.0, carbs: 2.5, fat: 3.5, fiber: 0, category: 'Laticínios', source: 'IBGE' },
                { name: 'Ricota', portion: '30g', householdMeasure: '1 fatia', calories: 42, protein: 3.8, carbs: 0.9, fat: 2.7, fiber: 0, category: 'Laticínios', source: 'TACO' },

                // === OLEAGINOSAS ===
                { name: 'Castanha do Pará', portion: '10g', householdMeasure: '2 unidades', calories: 66, protein: 1.4, carbs: 1.2, fat: 6.7, fiber: 0.8, category: 'Oleaginosas', source: 'TACO' },
                { name: 'Amêndoas', portion: '30g', householdMeasure: '12 unidades', calories: 172, protein: 6, carbs: 6, fat: 15, fiber: 3.5, category: 'Oleaginosas', source: 'TACO' },
                { name: 'Nozes', portion: '20g', householdMeasure: '4 metades', calories: 131, protein: 3.0, carbs: 2.7, fat: 13.1, fiber: 1.3, category: 'Oleaginosas', source: 'TACO' },
                { name: 'Castanha de caju', portion: '20g', householdMeasure: '7 unidades', calories: 114, protein: 3.6, carbs: 5.6, fat: 9.3, fiber: 0.6, category: 'Oleaginosas', source: 'TACO' },
                { name: 'Amendoim torrado', portion: '30g', householdMeasure: '1 colher de sopa cheia', calories: 176, protein: 8.0, carbs: 4.8, fat: 14.4, fiber: 2.2, category: 'Oleaginosas', source: 'TACO' },
                { name: 'Pasta de amendoim', portion: '15g', householdMeasure: '1 colher de sopa', calories: 93, protein: 4.0, carbs: 2.3, fat: 8.0, fiber: 1.0, category: 'Oleaginosas', source: 'IBGE' },
                { name: 'Semente de chia', portion: '15g', householdMeasure: '1 colher de sopa', calories: 69, protein: 2.5, carbs: 6.4, fat: 4.6, fiber: 5.1, category: 'Oleaginosas', source: 'IBGE' },
                { name: 'Semente de linhaça', portion: '15g', householdMeasure: '1 colher de sopa', calories: 76, protein: 2.7, carbs: 4.3, fat: 6.3, fiber: 4.1, category: 'Oleaginosas', source: 'TACO' },

                // === ÓLEOS E GORDURAS ===
                { name: 'Azeite de oliva', portion: '13ml', householdMeasure: '1 colher de sopa', calories: 108, protein: 0, carbs: 0, fat: 12, fiber: 0, category: 'Óleos', source: 'TACO' },
                { name: 'Óleo de coco', portion: '13ml', householdMeasure: '1 colher de sopa', calories: 108, protein: 0, carbs: 0, fat: 12, fiber: 0, category: 'Óleos', source: 'IBGE' },
                { name: 'Manteiga', portion: '10g', householdMeasure: '1 colher de chá', calories: 72, protein: 0.1, carbs: 0, fat: 8.1, fiber: 0, category: 'Óleos', source: 'TACO' },
                { name: 'Creme de leite', portion: '30g', householdMeasure: '1 colher de sopa', calories: 56, protein: 0.6, carbs: 1.0, fat: 5.6, fiber: 0, category: 'Óleos', source: 'TACO' },

                // === PROTEÍNAS VEGETAIS ===
                { name: 'Tofu firme', portion: '100g', householdMeasure: '3 fatias', calories: 64, protein: 6.6, carbs: 2.2, fat: 3.5, fiber: 0.2, category: 'Proteínas Vegetais', source: 'IBGE' },
                { name: 'Proteína de soja texturizada (PTS)', portion: '30g', householdMeasure: '3 colheres de sopa (seca)', calories: 99, protein: 15.2, carbs: 9.3, fat: 0.3, fiber: 4.5, category: 'Proteínas Vegetais', source: 'TACO' },
                { name: 'Edamame cozido', portion: '100g', householdMeasure: '1/2 xícara', calories: 122, protein: 11.9, carbs: 8.9, fat: 5.2, fiber: 5.2, category: 'Proteínas Vegetais', source: 'IBGE' },

                // === SUPLEMENTOS ===
                { name: 'Whey protein', portion: '30g', householdMeasure: '1 scoop', calories: 120, protein: 24, carbs: 3, fat: 1, fiber: 0, category: 'Suplementos', source: 'IBGE' },
                { name: 'Albumina em pó', portion: '30g', householdMeasure: '2 colheres de sopa', calories: 108, protein: 24, carbs: 1.5, fat: 0.3, fiber: 0, category: 'Suplementos', source: 'IBGE' },
                { name: 'Creatina monohidratada', portion: '5g', householdMeasure: '1 colher de chá', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, category: 'Suplementos', source: 'IBGE' },
                { name: 'Maltodextrina', portion: '30g', householdMeasure: '2 colheres de sopa', calories: 114, protein: 0, carbs: 28.5, fat: 0, fiber: 0, category: 'Suplementos', source: 'IBGE' },

                // === OUTROS ===
                { name: 'Mel', portion: '15g', householdMeasure: '1 colher de sopa', calories: 49, protein: 0, carbs: 12.3, fat: 0, fiber: 0, category: 'Outros', source: 'TACO' },
                { name: 'Açúcar cristal', portion: '5g', householdMeasure: '1 colher de chá', calories: 19, protein: 0, carbs: 5, fat: 0, fiber: 0, category: 'Outros', source: 'TACO' },
                { name: 'Chocolate amargo 70%', portion: '25g', householdMeasure: '2 quadradinhos', calories: 132, protein: 2.0, carbs: 12.0, fat: 9.0, fiber: 2.8, category: 'Outros', source: 'IBGE' },
                { name: 'Gelatina diet (pronta)', portion: '100g', householdMeasure: '1 taça', calories: 10, protein: 2.0, carbs: 0.5, fat: 0, fiber: 0, category: 'Outros', source: 'IBGE' },
                { name: 'Caldo em po sabor carne [Knorr]', portion: '100g', householdMeasure: '21 porcoes de 4,75g', calories: 316, protein: 0, carbs: 29.47, fat: 21.05, fiber: 0, category: 'Temperos', source: 'Rotulo Knorr' },
            ];
            foods.forEach(f => this.addFood(f));
        }

        // Dados de configuração (branding)
        if (!this._get(this.KEYS.SETTINGS)) {
            this._set(this.KEYS.SETTINGS, {
                clinicName: '',
                logo: '',
                primaryColor: '#00b894',
                secondaryColor: '#6c5ce7',
            });
        }

        // Pacientes demo
        if (this.getPatients().length === 0) {
            const patients = [
                { name: 'Maria Silva', email: 'maria@email.com', phone: '(11) 99999-0001', birthDate: '1990-05-15', gender: 'F', height: 165, weight: 68, goal: 'Emagrecimento', notes: 'Intolerância a lactose' },
                { name: 'João Santos', email: 'joao@email.com', phone: '(11) 99999-0002', birthDate: '1985-11-22', gender: 'M', height: 178, weight: 92, goal: 'Emagrecimento', notes: 'Hipertensão controlada' },
                { name: 'Ana Oliveira', email: 'ana@email.com', phone: '(11) 99999-0003', birthDate: '1995-03-08', gender: 'F', height: 160, weight: 55, goal: 'Ganho de massa', notes: 'Pratica musculação 5x/semana' },
                { name: 'Carlos Ferreira', email: 'carlos@email.com', phone: '(11) 99999-0004', birthDate: '1978-09-30', gender: 'M', height: 175, weight: 85, goal: 'Manutenção', notes: 'Diabetes tipo 2' },
                { name: 'Lucia Mendes', email: 'lucia@email.com', phone: '(11) 99999-0005', birthDate: '2000-01-14', gender: 'F', height: 170, weight: 62, goal: 'Reeducação alimentar', notes: '' },
            ];
            patients.forEach(p => this.addPatient(p));
        }

        // Consultas demo
        if (this.getAppointments().length === 0) {
            const patients = this.getPatients();
            const today = new Date();
            const appointments = [
                { patientId: patients[0].id, date: this._formatDate(today, 0), time: '09:00', type: 'Retorno', status: 'confirmada', notes: '' },
                { patientId: patients[1].id, date: this._formatDate(today, 0), time: '10:30', type: 'Primeira consulta', status: 'confirmada', notes: '' },
                { patientId: patients[2].id, date: this._formatDate(today, 1), time: '14:00', type: 'Retorno', status: 'pendente', notes: '' },
                { patientId: patients[3].id, date: this._formatDate(today, 2), time: '11:00', type: 'Retorno', status: 'pendente', notes: '' },
                { patientId: patients[4].id, date: this._formatDate(today, 3), time: '16:00', type: 'Primeira consulta', status: 'pendente', notes: '' },
            ];
            appointments.forEach(a => this.addAppointment(a));
        }

        // Usuários do sistema
        if (this.getUsers().length === 0) {
            this.addUser({ name: 'Dr(a). Nutricionista', email: 'nutricionista@nutreclin.com', password: '123456', role: 'nutricionista', crn: 'CRN-3 12345' });
            this.addUser({ name: 'Secretária', email: 'secretaria@nutreclin.com', password: '123456', role: 'secretaria', crn: '' });
        }

        // Configuração de agenda
        if (!this._get(this.KEYS.SCHEDULE_CONFIG)) {
            this._set(this.KEYS.SCHEDULE_CONFIG, {
                workDays: [1, 2, 3, 4, 5],
                startTime: '08:00',
                endTime: '18:00',
                slotDuration: 30,
                lunchStart: '12:00',
                lunchEnd: '13:00',
                bookingEnabled: true
            });
        }

        // Transações financeiras demo
        if (this.getFinancialTransactions().length === 0) {
            const pts = this.getPatients();
            const t = new Date();
            const txs = [
                { type: 'receita', category: 'Consulta', description: 'Consulta - ' + (pts[0]?.name || 'Paciente'), amount: 250, date: this._formatDate(t, -5), patientId: pts[0]?.id || null, paymentMethod: 'pix', status: 'pago' },
                { type: 'receita', category: 'Retorno', description: 'Retorno - ' + (pts[1]?.name || 'Paciente'), amount: 180, date: this._formatDate(t, -3), patientId: pts[1]?.id || null, paymentMethod: 'cartao_credito', status: 'pago' },
                { type: 'despesa', category: 'Aluguel', description: 'Aluguel do consultório - Março', amount: 2500, date: this._formatDate(t, -10), patientId: null, paymentMethod: 'transferencia', status: 'pago' },
                { type: 'despesa', category: 'Material', description: 'Material de impressão', amount: 85, date: this._formatDate(t, -7), patientId: null, paymentMethod: 'pix', status: 'pago' },
                { type: 'receita', category: 'Consulta', description: 'Consulta - ' + (pts[2]?.name || 'Paciente'), amount: 250, date: this._formatDate(t, -1), patientId: pts[2]?.id || null, paymentMethod: 'dinheiro', status: 'pago' },
                { type: 'receita', category: 'Avaliação', description: 'Avaliação - ' + (pts[3]?.name || 'Paciente'), amount: 300, date: this._formatDate(t, 0), patientId: pts[3]?.id || null, paymentMethod: 'pix', status: 'pendente' },
            ];
            txs.forEach(tx => this.addFinancialTransaction(tx));
        }
    },

    _formatDate(date, addDays) {
        const d = new Date(date);
        d.setDate(d.getDate() + addDays);
        return d.toISOString().split('T')[0];
    }
};
