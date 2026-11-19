"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COOKIE_CONSENT_EVENT, COOKIE_CONSENT_KEY } from "@/components/analytics/consent-analytics";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== "all" && consent !== "essential") {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  function saveChoice(choice: "essential" | "all") {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
    setIsVisible(false);
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label="Preferências de cookies">
      <div className="cookie-banner-content">
        <p>
          Utilizamos <strong>cookies essenciais</strong> (autenticação e segurança) e, mediante seu consentimento,{" "}
          <strong>cookies analíticos</strong> (Google Analytics) para melhorar a plataforma, conforme nossa{" "}
          <Link href="/politica-de-privacidade">Política de Privacidade (LGPD)</Link>. Você pode recusar cookies não
          essenciais sem prejuízo ao uso do sistema.
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flexShrink: 0 }}>
          <button
            className="button"
            type="button"
            onClick={() => saveChoice("essential")}
            style={{ background: "transparent", color: "#f8fafc", border: "1px solid rgba(248,250,252,0.45)" }}
          >
            Somente essenciais
          </button>
          <button className="button" type="button" onClick={() => saveChoice("all")}>
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  );
}
