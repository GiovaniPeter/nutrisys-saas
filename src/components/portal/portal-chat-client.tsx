"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatSender = "PROFESSIONAL" | "PATIENT";

type ChatMessage = {
  id: string;
  sender: ChatSender;
  text: string;
  attachmentUrl: string | null;
  createdAt: string;
};

type MessagesResponse = {
  messages: ChatMessage[];
};

export function PortalChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void loadMessages();
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    const response = await fetch("/api/portal/chat");
    const data = (await response.json()) as MessagesResponse & { error?: string };

    if (!response.ok) {
      setNotice(data.error || "Nao foi possivel carregar o chat.");
      return;
    }

    setMessages(data.messages);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.trim()) return;

    setSending(true);
    setNotice(null);
    const response = await fetch("/api/portal/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: draft })
    });
    const data = (await response.json()) as { error?: string };
    setSending(false);

    if (!response.ok) {
      setNotice(data.error || "Nao foi possivel enviar sua mensagem.");
      return;
    }

    setDraft("");
    await loadMessages();
  }

  return (
    <div className="portal-chat">
      <div className="portal-chat-thread" ref={threadRef}>
        {messages.map((item) => (
          <article className={item.sender === "PATIENT" ? "chat-bubble sent" : "chat-bubble received"} key={item.id}>
            <p>{item.text}</p>
            {item.attachmentUrl ? (
              <a href={item.attachmentUrl} target="_blank" rel="noreferrer">
                Abrir anexo
              </a>
            ) : null}
            <span>{formatTime(item.createdAt)}</span>
          </article>
        ))}
        {messages.length === 0 ? <p className="empty-card">Envie uma mensagem para sua nutricionista.</p> : null}
      </div>

      <form className="chat-compose compact" onSubmit={(event) => void handleSubmit(event)}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Sua mensagem..." />
        <button className="button" type="submit" disabled={sending || !draft.trim()}>
          {sending ? "..." : "Enviar"}
        </button>
      </form>

      {notice ? <p className="form-message neutral">{notice}</p> : null}
    </div>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
