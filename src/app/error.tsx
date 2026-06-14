"use client";

import Link from "next/link";
import { useEffect } from "react";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="shell app-error-shell">
      <section className="app-error-card" role="alert">
        <span className="app-error-mark" aria-hidden="true">
          !
        </span>
        <span className="eyebrow">Algo nao saiu como esperado</span>
        <h1>Nao foi possivel abrir esta pagina</h1>
        <p>
          Tente carregar novamente. Se o problema continuar, use a referencia abaixo ao falar com o suporte.
        </p>
        <div className="app-error-actions">
          <button className="button" type="button" onClick={reset}>
            Tentar novamente
          </button>
          <Link className="button secondary" href="/dashboard">
            Ir para o dashboard
          </Link>
        </div>
        {error.digest ? <small>Referencia: {error.digest}</small> : null}
      </section>
    </main>
  );
}
