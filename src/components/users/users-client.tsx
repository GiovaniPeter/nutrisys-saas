"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type UserRole = "OWNER" | "NUTRITIONIST" | "SECRETARY" | "ADMIN" | "PROFESSIONAL";

type TeamUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  crn: string | null;
  specialty: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type UsersResponse = {
  users: TeamUser[];
};

type UsersClientProps = {
  currentUserRole: string;
};

const roleLabels: Record<UserRole, string> = {
  OWNER: "Responsável / Diretor(a)",
  ADMIN: "Administrador(a)",
  NUTRITIONIST: "Nutricionista",
  SECRETARY: "Recepção / Secretária",
  PROFESSIONAL: "Profissional de Saúde"
};

const specialtyLabels: Record<string, string> = {
  "medico": "Médico(a) Clínico",
  "endocrinologista": "Endocrinologista / Nutrólogo(a)",
  "psicologo": "Psicólogo(a)",
  "fisioterapeuta": "Fisioterapeuta",
  "fonoaudiologo": "Fonoaudiólogo(a)",
  "dentista": "Dentista / Odontólogo(a)",
  "educador-fisico": "Prof. Educação Física",
  "enfermeiro": "Enfermeiro(a)",
  "terapeuta-ocupacional": "Terapeuta Ocupacional",
  "farmaceutico": "Farmacêutico(a)",
  "biomedico": "Biomédico(a)",
  "nutricionista": "Nutricionista"
};

const councilBySpecialty: Record<string, string> = {
  "medico": "CRM",
  "endocrinologista": "CRM / RQE",
  "psicologo": "CRP",
  "fisioterapeuta": "CREFITO",
  "fonoaudiologo": "CRFa",
  "dentista": "CRO",
  "educador-fisico": "CREF",
  "enfermeiro": "COREN",
  "terapeuta-ocupacional": "CREFITO",
  "farmaceutico": "CRF",
  "biomedico": "CRBM",
  "nutricionista": "CRN"
};

export function UsersClient({ currentUserRole }: UsersClientProps) {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const managementRoles = ["OWNER", "ADMIN", "NUTRITIONIST", "PROFESSIONAL"];
  const canManage = managementRoles.includes(currentUserRole);
  const activeUsers = useMemo(() => users.filter((user) => user.active).length, [users]);

  const [createRole, setCreateRole] = useState<UserRole>("PROFESSIONAL");
  const [createSpecialty, setCreateSpecialty] = useState<string>("medico");
  const [editRole, setEditRole] = useState<UserRole>("PROFESSIONAL");
  const [editSpecialty, setEditSpecialty] = useState<string>("medico");

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    if (editingUser) {
      setEditRole(editingUser.role);
      setEditSpecialty(editingUser.specialty || (editingUser.role === "NUTRITIONIST" ? "nutricionista" : "medico"));
    }
  }, [editingUser]);

  async function loadUsers() {
    setLoading(true);
    const response = await fetch("/api/users");
    const data = (await response.json()) as UsersResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível carregar usuários.");
      return;
    }

    setUsers(data.users);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role: form.get("role"),
        crn: form.get("crn"),
        specialty: form.get("specialty")
      })
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível criar usuário.");
      return;
    }

    formElement.reset();
    setCreateRole("PROFESSIONAL");
    setCreateSpecialty("medico");
    setMessage("Profissional / usuário criado com sucesso.");
    await loadUsers();
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    const form = new FormData(event.currentTarget);

    setSaving(true);
    setMessage(null);

    const response = await fetch(`/api/users/${editingUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        role: form.get("role"),
        crn: form.get("crn"),
        specialty: form.get("specialty"),
        active: form.get("active") === "on"
      })
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Não foi possível atualizar usuário.");
      return;
    }

    setEditingUser(null);
    setMessage("Acesso e especialidade atualizados com sucesso.");
    await loadUsers();
  }

  async function toggleActive(user: TeamUser) {
    setMessage(null);
    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active })
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Não foi possível alterar status.");
      return;
    }

    await loadUsers();
  }

  const createCouncilLabel =
    createRole === "NUTRITIONIST" ? "CRN" : councilBySpecialty[createSpecialty] || "Registro Profissional (CRM/CRP/CRN/CREFITO)";
  const editCouncilLabel =
    editRole === "NUTRITIONIST" ? "CRN" : councilBySpecialty[editSpecialty] || "Registro Profissional (CRM/CRP/CRN/CREFITO)";

  return (
    <section className="workspace-grid">
      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Corpo Clínico & Recepção</span>
            <h2>Equipe Multiprofissional da Clínica</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo da equipe">
            <span>{users.length} membros</span>
            <span>{activeUsers} ativos</span>
          </div>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Profissional / Usuário</th>
                <th>Papel & Especialidade</th>
                <th>Conselho</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={editingUser?.id === user.id ? "selected-row" : undefined}>
                  <td>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </td>
                  <td>
                    <strong>
                      {user.specialty && specialtyLabels[user.specialty]
                        ? specialtyLabels[user.specialty]
                        : roleLabels[user.role]}
                    </strong>
                    <span>{roleLabels[user.role]}</span>
                  </td>
                  <td>
                    <strong>{user.crn || "—"}</strong>
                    <span>
                      {user.specialty && councilBySpecialty[user.specialty]
                        ? councilBySpecialty[user.specialty]
                        : user.role === "NUTRITIONIST"
                          ? "CRN"
                          : "Registro"}
                    </span>
                  </td>
                  <td>
                    <span className={user.active ? "status-pill ok" : "status-pill"}>
                      {user.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="text-button"
                        type="button"
                        disabled={!canManage}
                        onClick={() => {
                          setEditingUser(user);
                          setMessage(null);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="text-button danger"
                        type="button"
                        disabled={!canManage}
                        onClick={() => void toggleActive(user)}
                      >
                        {user.active ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : null}

              {loading ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Carregando equipe...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">{editingUser ? "Edição de Membro" : "Novo Membro da Equipe"}</span>
        <h2>{editingUser ? "Editar profissional" : "Adicionar profissional"}</h2>

        {!canManage ? <p className="form-message error">Seu papel atual não permite gerenciar usuários.</p> : null}

        {editingUser ? (
          <form key={editingUser.id} className="form compact-form" onSubmit={handleEdit}>
            <label>
              Nome completo
              <input name="name" required minLength={2} defaultValue={editingUser.name} disabled={!canManage} />
            </label>
            <label>
              E-mail
              <input value={editingUser.email} disabled readOnly />
            </label>
            <label>
              Papel no sistema
              <select
                name="role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                disabled={!canManage || editingUser.role === "OWNER"}
              >
                <option value="OWNER">Responsável / Diretor(a)</option>
                <option value="ADMIN">Administrador(a)</option>
                <option value="PROFESSIONAL">Profissional de Saúde (Multiprofissional)</option>
                <option value="NUTRITIONIST">Nutricionista</option>
                <option value="SECRETARY">Recepção / Secretária</option>
              </select>
            </label>

            {editRole !== "SECRETARY" ? (
              <>
                <label>
                  Especialidade Clínica
                  <select
                    name="specialty"
                    value={editSpecialty}
                    onChange={(e) => setEditSpecialty(e.target.value)}
                    disabled={!canManage}
                  >
                    {Object.entries(specialtyLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Número do Conselho ({editCouncilLabel})
                  <input
                    name="crn"
                    defaultValue={editingUser.crn || ""}
                    placeholder={`Ex: ${editCouncilLabel} 12345/UF`}
                    disabled={!canManage}
                  />
                </label>
              </>
            ) : null}

            <label className="checkbox-label">
              <input name="active" type="checkbox" defaultChecked={editingUser.active} disabled={!canManage} />
              <span>Usuário ativo na clínica.</span>
            </label>
            <button className="button" type="submit" disabled={saving || !canManage}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            <button className="button secondary" type="button" onClick={() => setEditingUser(null)}>
              Cancelar edição
            </button>
          </form>
        ) : (
          <form className="form compact-form" onSubmit={handleCreate}>
            <label>
              Nome completo
              <input name="name" required minLength={2} placeholder="Dr(a). Nome Completo" disabled={!canManage} />
            </label>
            <label>
              E-mail profissional
              <input name="email" type="email" required placeholder="profissional@clinica.com" disabled={!canManage} />
            </label>
            <label>
              Senha temporária
              <input name="password" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" disabled={!canManage} />
            </label>
            <label>
              Papel no sistema
              <select
                name="role"
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value as UserRole)}
                disabled={!canManage}
              >
                <option value="PROFESSIONAL">Profissional de Saúde (Multiprofissional)</option>
                <option value="NUTRITIONIST">Nutricionista</option>
                <option value="ADMIN">Administrador(a)</option>
                <option value="SECRETARY">Recepção / Secretária</option>
              </select>
            </label>

            {createRole !== "SECRETARY" ? (
              <>
                <label>
                  Especialidade Clínica
                  <select
                    name="specialty"
                    value={createSpecialty}
                    onChange={(e) => setCreateSpecialty(e.target.value)}
                    disabled={!canManage}
                  >
                    {Object.entries(specialtyLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Número do Conselho ({createCouncilLabel})
                  <input
                    name="crn"
                    placeholder={`Ex: ${createCouncilLabel} 12345/UF`}
                    disabled={!canManage}
                  />
                </label>
              </>
            ) : null}

            <button className="button" type="submit" disabled={saving || !canManage}>
              {saving ? "Cadastrando..." : "Cadastrar membro da equipe"}
            </button>
          </form>
        )}
      </aside>
    </section>
  );
}
