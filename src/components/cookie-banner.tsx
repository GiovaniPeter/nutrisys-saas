"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const hasConsented = localStorage.getItem("clinos-cookie-consent");
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  function handleAccept() {
    localStorage.setItem("clinos-cookie-consent", "true");
    setIsVisible(false);
  }

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <p>
          Utilizamos cookies essenciais e tecnologias semelhantes de acordo com a nossa{" "}
          <Link href="/politica-de-privacidade">Política de Privacidade</Link>. 
          Ao continuar navegando, você concorda com estas condições.
        </p>
        <button className="button" type="button" onClick={handleAccept}>
          Entendi
        </button>
      </div>
    </div>
  );
}
