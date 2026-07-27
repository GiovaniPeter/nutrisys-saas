"use client";

import { FormEvent, useState } from "react";

type FeedbackType = "FEATURE" | "BUG";

type FeedbackResponse = {
  success?: boolean;
  requestId?: string;
  error?: string;
};

export function FeedbackClient() {
  const [type, setType] = useState<FeedbackType>("FEATURE");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    setSending(true);
    setMessage(null);

    try {
      const includeTechnicalContext = form.get("includeTechnicalContext") === "on";
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: form.get("title"),
          area: form.get("area"),
          description: form.get("description"),
          stepsToReproduce: type === "BUG" ? form.get("stepsToReproduce") : "",
          expectedResult: type === "BUG" ? form.get("expectedResult") : "",
          userAgent: includeTechnicalContext ? window.navigator.userAgent : ""
        })
      });
      const data = (await response.json()) as FeedbackResponse;

      if (!response.ok) {
        setMessage({
          kind: "error",
          text: data.error || "Não foi possível enviar sua solicitação."
        });
        return;
      }

      formElement.reset();
      setType("FEATURE");
      setMessage({
        kind: "success",
        text: `Recebemos sua solicitação${data.requestId ? ` (${data.requestId.slice(0, 8)})` : ""}. Obrigado por ajudar a melhorar o ClinOS.`
      });
    } catch {
      setMessage({
        kind: "error",
        text: "Não foi possível conectar ao ClinOS. Verifique sua conexão e tente novamente."
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="feedback-layout">
      <div className="surface feedback-form-card">
        <form className="form feedback-form" onSubmit={handleSubmit}>
          <fieldset className="feedback-type-fieldset">
            <legend>O que você deseja enviar?</legend>
            <div className="feedback-type-grid">
              <label className={type === "FEATURE" ? "feedback-type-card selected" : "feedback-type-card"}>
                <input
                  type="radio"
                  name="type"
                  value="FEATURE"
                  checked={type === "FEATURE"}
                  onChange={() => setType("FEATURE")}
                />
                <span className="feedback-type-icon" aria-hidden="true">+</span>
                <span>
                  <strong>Solicitar função</strong>
                  <small>Sugira uma melhoria ou uma nova ferramenta.</small>
                </span>
              </label>

              <label className={type === "BUG" ? "feedback-type-card selected bug" : "feedback-type-card bug"}>
                <input
                  type="radio"
                  name="type"
                  value="BUG"
                  checked={type === "BUG"}
                  onChange={() => setType("BUG")}
                />
                <span className="feedback-type-icon" aria-hidden="true">!</span>
                <span>
                  <strong>Reportar bug</strong>
                  <small>Informe algo que não funcionou como esperado.</small>
                </span>
              </label>
            </div>
          </fieldset>

          <label>
            Título
            <input
              name="title"
              required
              minLength={5}
              maxLength={120}
              placeholder={type === "FEATURE" ? "Ex.: lembrete automático de retorno" : "Ex.: agenda não salva o horário"}
              autoComplete="off"
            />
          </label>

          <label>
            Tela ou área do sistema <span className="optional-label">opcional</span>
            <input name="area" maxLength={120} placeholder="Ex.: agenda, pacientes, plano alimentar" autoComplete="off" />
          </label>

          <label>
            {type === "FEATURE" ? "Como essa função ajudaria você?" : "O que aconteceu?"}
            <textarea
              name="description"
              required
              minLength={20}
              maxLength={4000}
              rows={6}
              placeholder={
                type === "FEATURE"
                  ? "Descreva a necessidade, quem usaria e qual resultado você espera."
                  : "Descreva o problema e, se possível, informe quando ele começou."
              }
            />
          </label>

          {type === "BUG" ? (
            <div className="feedback-bug-fields">
              <label>
                Passos para reproduzir <span className="optional-label">opcional</span>
                <textarea
                  name="stepsToReproduce"
                  maxLength={2000}
                  rows={4}
                  placeholder={"1. Acessei...\n2. Cliquei em...\n3. O erro apareceu..."}
                />
              </label>
              <label>
                O que deveria acontecer? <span className="optional-label">opcional</span>
                <textarea
                  name="expectedResult"
                  maxLength={1000}
                  rows={3}
                  placeholder="Conte qual era o resultado esperado."
                />
              </label>
            </div>
          ) : null}

          {type === "BUG" ? (
            <label className="feedback-context-option">
              <input name="includeTechnicalContext" type="checkbox" defaultChecked />
              <span>
                <strong>Incluir navegador e dispositivo</strong>
                <small>Essas informações ajudam a reproduzir o problema.</small>
              </span>
            </label>
          ) : null}

          <p className="feedback-privacy-note">
            Não inclua nomes, exames ou qualquer dado identificável de pacientes.
          </p>

          {message ? (
            <p
              className={message.kind === "error" ? "form-message error" : "form-message neutral"}
              role={message.kind === "error" ? "alert" : "status"}
            >
              {message.text}
            </p>
          ) : null}

          <button className="button feedback-submit" type="submit" disabled={sending}>
            {sending ? "Enviando..." : type === "FEATURE" ? "Enviar sugestão" : "Enviar relatório de bug"}
          </button>
        </form>
      </div>

      <aside className="surface feedback-guide">
        <span className="eyebrow">Como escrever um bom pedido</span>
        <h2>Quanto mais contexto, melhor.</h2>
        <ul>
          <li>
            <strong>Explique a necessidade</strong>
            <span>Conte qual tarefa você está tentando realizar.</span>
          </li>
          <li>
            <strong>Informe a área</strong>
            <span>Agenda, prontuário, financeiro ou outra tela.</span>
          </li>
          <li>
            <strong>Em bugs, descreva os passos</strong>
            <span>Assim conseguimos reproduzir e corrigir com mais rapidez.</span>
          </li>
        </ul>
        <div className="feedback-guide-callout">
          <strong>Precisa falar conosco?</strong>
          <a href="mailto:contato@clinos.tec.br">contato@clinos.tec.br</a>
        </div>
      </aside>
    </section>
  );
}
