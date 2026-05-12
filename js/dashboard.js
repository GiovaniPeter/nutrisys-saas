/* ============================================
   NutriSys - Dashboard
   ============================================ */

const Dashboard = {
    render() {
        const patients = DB.getPatients();
        const appointments = DB.getAppointments();
        const mealplans = DB.getMealPlans();
        const today = new Date().toISOString().split('T')[0];

        const todayAppts = appointments
            .filter(a => a.date === today)
            .sort((a, b) => a.time.localeCompare(b.time));

        const upcomingAppts = appointments
            .filter(a => a.date >= today)
            .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
            .slice(0, 8);

        const recentPatients = patients
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon green">
                        <span class="material-icons-outlined">people</span>
                    </div>
                    <div class="stat-info">
                        <h4>${patients.length}</h4>
                        <p>Pacientes</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <span class="material-icons-outlined">calendar_today</span>
                    </div>
                    <div class="stat-info">
                        <h4>${todayAppts.length}</h4>
                        <p>Consultas Hoje</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon purple">
                        <span class="material-icons-outlined">restaurant_menu</span>
                    </div>
                    <div class="stat-info">
                        <h4>${mealplans.length}</h4>
                        <p>Cardápios</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon pink">
                        <span class="material-icons-outlined">pending_actions</span>
                    </div>
                    <div class="stat-info">
                        <h4>${appointments.filter(a => a.status === 'pendente' && a.date >= today).length}</h4>
                        <p>Pendentes</p>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <h3>Próximas Consultas</h3>
                        <button class="btn btn-sm btn-outline" onclick="App.navigate('appointments')">Ver todas</button>
                    </div>
                    ${upcomingAppts.length > 0 ? `
                        <ul class="appointment-list">
                            ${upcomingAppts.map(a => {
                                const patient = DB.getPatient(a.patientId);
                                const isToday = a.date === today;
                                return `
                                    <li class="appointment-item">
                                        <div class="appointment-time">${a.time}</div>
                                        <div class="appointment-info">
                                            <h4>${patient ? App.escapeHtml(patient.name) : 'Paciente removido'}</h4>
                                            <p>${isToday ? 'Hoje' : App.formatDate(a.date)} · ${App.escapeHtml(a.type)}</p>
                                        </div>
                                        <span class="badge ${a.status === 'confirmada' ? 'badge-success' : 'badge-warning'}">${a.status}</span>
                                    </li>
                                `;
                            }).join('')}
                        </ul>
                    ` : `
                        <div class="empty-state">
                            <span class="material-icons-outlined">event_busy</span>
                            <p>Nenhuma consulta agendada</p>
                        </div>
                    `}
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>Pacientes Recentes</h3>
                        <button class="btn btn-sm btn-outline" onclick="App.navigate('patients')">Ver todos</button>
                    </div>
                    ${recentPatients.length > 0 ? `
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Objetivo</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentPatients.map(p => `
                                        <tr>
                                            <td><strong>${App.escapeHtml(p.name)}</strong></td>
                                            <td><span class="badge badge-info">${App.escapeHtml(p.goal || '-')}</span></td>
                                            <td>
                                                <button class="btn btn-sm btn-outline" onclick="Patients.viewPatient('${p.id}')">
                                                    <span class="material-icons-outlined" style="font-size:16px">visibility</span> Ver
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="empty-state">
                            <span class="material-icons-outlined">person_off</span>
                            <p>Nenhum paciente cadastrado</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
};
