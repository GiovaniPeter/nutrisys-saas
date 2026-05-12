import { redirect } from "next/navigation";
import { PortalLoginForm } from "@/components/portal/portal-login-form";
import { getCurrentPortalPatient } from "@/lib/patient-session";

export default async function PortalLoginPage() {
  const patient = await getCurrentPortalPatient();

  if (patient) {
    redirect("/portal");
  }

  return (
    <main className="shell portal-shell">
      <section className="portal-login-layout">
        <div>
          <span className="eyebrow">Portal do paciente</span>
          <h1>Acesse seu portal</h1>
          <p>Use o e-mail ou telefone cadastrado na clinica junto com o codigo enviado pelo profissional.</p>
        </div>
        <div className="surface">
          <PortalLoginForm />
        </div>
      </section>
    </main>
  );
}
