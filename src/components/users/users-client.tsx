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
  OWNER: "Owner",
  ADMIN: "Admin",
  NUTRITIONIST: "Nutricionista",
  SECRETARY: "Secretaria",
  PROFESSIONAL: "Profissional"
};

const specialtyLabels: Record<string, string> = {
  "medico": "Médico(a)",
  "psicologo": "Psicólogo(a)",
  "fisioterapeuta": "Fisioterapeuta",
  "fonoaudiologo": "Fonoaudiólogo(a)",
  "dentista": "Dentista",
  "educador-fisico": "Ed. Físico(a)",
  "enfermeiro": "Enfermeiro(a)",
  "terapeuta-ocupacional": "Terapeuta Ocup.",
  "farmaceutico": "Farmacêutico(a)",
  "biomedico": "Biomédico(a)"
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

  // Form states for dynamic fields
  const [createRole, setCreateRole] = useState<UserRole>("NUTRITIONIST");
  const [editRole, setEditRole] = useState<UserRole>("NUTRITIONIST");

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    if (editingUser) {
      setEditRole(editingUser.role);
    }
  }, [editingUser]);

  async function loadUsers() {
    setLoading(true);
    const response = await fetch("/api/users");
    const data = (await response.json()) as UsersResponse & { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel carregar usuarios.");
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
      setMessage(data.error || "Nao foi possivel criar usuario.");
      return;
    }

    formElement.reset();
    setCreateRole("NUTRITIONIST"); // reset back
    setMessage("Usuario criado com sucesso.");
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
        active: form.get("active") === "on"
      })
    });
    const data = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel atualizar usuario.");
      return;
    }

    setEditingUser(null);
    setMessage("Usuario atualizado com sucesso.");
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
      setMessage(data.error || "Nao foi possivel alterar status.");
      return;
    }

    await loadUsers();
  }

  return (
    <section className="workspace-grid">
      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Acessos</span>
            <h2>Usuários da clínica</h2>
          </div>
          <div className="mini-stats" aria-label="Resumo da equipe">
            <span>{users.length} total</span>
            <span>{activeUsers} ativos</span>
          </div>
        </div>

        {message ? <p className="form-message neutral">{message}</p> : null}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Papel</th>
                <th>Status</th>
                <th>Criado em</th>
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
                    <strong>{roleLabels[user.role]}</strong>
                    <span>{user.role === "PROFESSIONAL" && user.specialty ? specialtyLabels[user.specialty] || user.specialty : (user.crn || "Registro não informado")}</span>
                  </td>
                  <td>
                    <span className={user.active ? "status-pill ok" : "status-pill"}>{user.active ? "Ativo" : "Inativo"}</span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
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
                    Nenhum usuario encontrado.
                  </td>
                </tr>
              ) : null}

              {loading ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Carregando usuarios...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="surface patient-form-panel">
        <span className="eyebrow">{editingUser ? "Edicao" : "Novo usuario"}</span>
        <h2>{editingUser ? "Editar acesso" : "Criar acesso"}</h2>

        {!canManage ? <p className="form-message error">Seu papel atual nao permite gerenciar usuarios.</p> : null}

        {editingUser ? (
          <form key={editingUser.id} className="form compact-form" onSubmit={handleEdit}>
            <label>
              Nome
              <input name="name" required minLength={2} defaultValue={editingUser.name} disabled={!canManage} />
            </label>
            <label>
              E-mail
              <input value={editingUser.email} disabled readOnly />
            </label>
            <label>
              Papel
              <select 
                 name="role" 
                 value={editRole} 
                 onChange={(e) => setEditRole(e.target.value as UserRole)}
                 disabled={!canManage || editingUser.role === "OWNER"}
              >
                <option value="OWNER">Owner</option>
                <option value="ADMIN">Admin</option>
                <option value="NUTRITIONIST">Nutricionista</option>
                <option value="SECRETARY">Secretaria</option>
                <option value="PROFESSIONAL">Profissional de Saúde</option>
              </select>
            </label>
            {editRole !== "SECRETARY" && editRole !== "PROFESSIONAL" && (
                <label>
                  CRN
                  <input name="crn" defaultValue={editingUser.crn || ""} disabled={!canManage} />
                </label>
            )}
            <label className="checkbox-label">
              <input name="active" type="checkbox" defaultChecked={editingUser.active} disabled={!canManage} />
              <span>Usuario ativo.</span>
            </label>
            <button className="button" type="submit" disabled={saving || !canManage}>
              {saving ? "Salvando..." : "Salvar alteracoes"}
            </button>
            <button className="button secondary" type="button" onClick={() => setEditingUser(null)}>
              Cancelar edicao
            </button>
          </form>
        ) : (
          <form className="form compact-form" onSubmit={handleCreate}>
            <label>
              Nome
              <input name="name" required minLength={2} placeholder="Nome completo" disabled={!canManage} />
            </label>
            <label>
              E-mail
              <input name="email" type="email" required placeholder="usuario@clinica.com" disabled={!canManage} />
            </label>
            <label>
              Senha temporaria
              <input name="password" type="password" required minLength={8} placeholder="Minimo 8 caracteres" disabled={!canManage} />
            </label>
            <label>
              Papel
              <select 
                 name="role" 
                 value={createRole} 
                 onChange={(e) => setCreateRole(e.target.value as UserRole)}
                 disabled={!canManage}
              >
                <option value="ADMIN">Admin</option>
                <option value="NUTRITIONIST">Nutricionista</option>
                <option value="SECRETARY">Secretaria</option>
                <option value="PROFESSIONAL">Profissional de Saúde</option>
              </select>
            </label>
            {createRole === "PROFESSIONAL" && (
                <label>
                  Especialidade
                  <select name="specialty" defaultValue="medico" disabled={!canManage}>
                    {Object.entries(specialtyLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </label>
            )}
            {createRole !== "SECRETARY" && createRole !== "PROFESSIONAL" && (
                <label>
                  CRN
                  <input name="crn" placeholder="CRN do profissional" disabled={!canManage} />
                </label>
            )}
            <button className="button" type="submit" disabled={saving || !canManage}>
              {saving ? "Criando..." : "Criar usuario"}
            </button>
          </form>
        )}
      </aside>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
