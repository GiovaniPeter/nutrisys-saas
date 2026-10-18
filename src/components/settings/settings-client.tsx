"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatDocument, isValidDocument } from "@/lib/brazilian-document";

type OrganizationSettings = {
  id: string;
  name: string;
  slug: string;
  document: string | null;
  phone: string | null;
  address: string | null;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  updatedAt: string;
};

type SettingsResponse = {
  organization: OrganizationSettings;
};

export function SettingsClient({ currentUserRole }: { currentUserRole: string }) {
  const canEdit = ["OWNER", "ADMIN"].includes(currentUserRole);
  const [organization, setOrganization] = useState<OrganizationSettings | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/settings/organization");
      const data = (await response.json()) as SettingsResponse & { error?: string };

      if (!response.ok) {
        setMessage(data.error || "Nao foi possivel carregar configuracoes.");
        return;
      }

      setOrganization(data.organization);
    } catch {
      setMessage("Não foi possível conectar. Tente carregar as configurações novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const document = String(form.get("document") || "").trim();
    if (!canEdit) return;
    if (document && !isValidDocument(document)) {
      setMessage("Informe um CPF ou CNPJ válido, incluindo os dígitos verificadores.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/settings/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          document,
          phone: form.get("phone"),
          address: form.get("address"),
          primaryColor: form.get("primaryColor"),
          secondaryColor: form.get("secondaryColor"),
          logoUrl: form.get("logoUrl")
        })
      });
      const data = (await response.json()) as SettingsResponse & { error?: string };

      if (!response.ok) {
        setMessage(data.error || "Nao foi possivel salvar configuracoes.");
        return;
      }

      setOrganization(data.organization);
      setMessage("Configuracoes salvas com sucesso.");
    } catch {
      setMessage("Não foi possível conectar. Suas alterações não foram salvas. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !organization) {
    return <p className="empty-card">Carregando configuracoes...</p>;
  }

  if (!organization) {
    return <div className="surface">
      <p role="alert">{message || "Não foi possível carregar as configurações."}</p>
      <button type="button" className="button" onClick={() => void loadSettings()}>Tentar novamente</button>
    </div>;
  }

  return (
    <section className="settings-layout">
      <div className="surface">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Dados da clinica</span>
            <h2>Identidade</h2>
          </div>
          <span className="status-pill">{organization?.slug || "clinica"}</span>
        </div>

        {message ? <p className="form-message neutral" role="status">{message}</p> : null}
        {!canEdit ? <p className="billing-note">Apenas o titular ou administrador pode alterar a identidade da clínica.</p> : null}

        <form key={organization?.id || "settings"} className="form compact-form" onSubmit={handleSubmit}>
          <fieldset disabled={!canEdit || saving} className="form compact-form" style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <label>
            Nome da clinica
            <input name="name" required minLength={2} defaultValue={organization?.name || ""} />
          </label>
          <div className="form-row">
            <label>
              CPF ou CNPJ da clínica
              <input name="document" placeholder="CPF ou CNPJ" maxLength={18} autoCapitalize="characters" spellCheck={false}
                defaultValue={formatDocument(organization?.document || "")}
                onBlur={(event) => { event.currentTarget.value = formatDocument(event.currentTarget.value); }} />
            </label>
            <label>
              Telefone
              <input name="phone" placeholder="(00) 00000-0000" defaultValue={organization?.phone || ""} />
            </label>
          </div>
          <label>
            Endereco
            <input name="address" placeholder="Rua, numero, cidade" defaultValue={organization?.address || ""} />
          </label>
          <label>
            Logo URL
            <input name="logoUrl" type="url" placeholder="https://..." defaultValue={organization?.logoUrl || ""} />
          </label>
          <div className="form-row">
            <label>
              Cor primaria
              <input name="primaryColor" type="color" defaultValue={organization?.primaryColor || "#0f8f72"} />
            </label>
            <label>
              Cor secundaria
              <input name="secondaryColor" type="color" defaultValue={organization?.secondaryColor || "#6c5ce7"} />
            </label>
          </div>
          <button className="button" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar configuracoes"}
          </button>
          </fieldset>
        </form>
      </div>

      <aside className="surface brand-preview">
        <span className="eyebrow">Previa</span>
        <div
          className="preview-card"
          style={{
            borderColor: organization?.primaryColor || "#0f8f72"
          }}
        >
          <div
            className="preview-mark"
            style={{
              background: organization?.primaryColor || "#0f8f72"
            }}
          >
            {organization?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" src={organization.logoUrl} />
            ) : (
              initials(organization?.name || "Clinica")
            )}
          </div>
          <div>
            <h3>{organization?.name || "Clinica"}</h3>
            {organization?.document ? <p>CPF/CNPJ: {formatDocument(organization.document)}</p> : null}
            <p>{organization?.phone || "Telefone nao informado"}</p>
            <p>{organization?.address || "Endereco nao informado"}</p>
          </div>
          <div
            className="preview-band"
            style={{
              background: `linear-gradient(90deg, ${organization?.primaryColor || "#0f8f72"}, ${
                organization?.secondaryColor || "#6c5ce7"
              })`
            }}
          />
        </div>
        <p className="billing-note">
          Essas informacoes serao reaproveitadas em PDFs, portal do paciente, perfil publico e comunicacoes.
        </p>
      </aside>
    </section>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
