import Link from "next/link";
import type { AuthenticatedUser } from "@/lib/session";

type AppNavProps = {
  active:
    | "dashboard"
    | "patients"
    | "appointments"
    | "schedule"
    | "meal-plans"
    | "recipes"
    | "shopping"
    | "foods"
    | "body-records"
    | "anamneses"
    | "recalls"
    | "lab-exams"
    | "supplements"
    | "food-diary"
    | "hydration"
    | "energy"
    | "chat"
    | "whatsapp"
    | "notifications"
    | "kpis"
    | "reports"
    | "materials"
    | "financial"
    | "portal"
    | "billing"
    | "settings"
    | "users";
  user: AuthenticatedUser;
};

const navItems = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard" },
  { key: "patients", href: "/patients", label: "Pacientes" },
  { key: "appointments", href: "/appointments", label: "Agenda" },
  { key: "schedule", href: "/schedule", label: "Calendario" },
  { key: "meal-plans", href: "/meal-plans", label: "Planos" },
  { key: "recipes", href: "/recipes", label: "Receitas" },
  { key: "shopping", href: "/shopping", label: "Compras" },
  { key: "foods", href: "/foods", label: "Alimentos" },
  { key: "body-records", href: "/body-records", label: "Evolucao" },
  { key: "anamneses", href: "/anamneses", label: "Anamnese" },
  { key: "recalls", href: "/recalls", label: "Recordatorio" },
  { key: "lab-exams", href: "/lab-exams", label: "Exames" },
  { key: "supplements", href: "/supplements", label: "Suplementos" },
  { key: "food-diary", href: "/food-diary", label: "Diario" },
  { key: "hydration", href: "/hydration", label: "Metas" },
  { key: "energy", href: "/energy", label: "Energia" },
  { key: "chat", href: "/chat", label: "Chat" },
  { key: "whatsapp", href: "/whatsapp", label: "WhatsApp" },
  { key: "notifications", href: "/notifications", label: "Alertas" },
  { key: "kpis", href: "/kpis", label: "KPIs" },
  { key: "reports", href: "/reports", label: "Relatorios" },
  { key: "materials", href: "/materials", label: "Materiais" },
  { key: "financial", href: "/financial", label: "Financeiro" },
  { key: "portal", href: "/portal/login", label: "Portal" },
  { key: "billing", href: "/billing", label: "Assinatura" },
  { key: "users", href: "/users", label: "Equipe" },
  { key: "settings", href: "/settings", label: "Config." }
] as const;

export function AppNav({ active, user }: AppNavProps) {
  return (
    <header className="app-header">
      <Link href="/dashboard" className="brand app-brand">
        <span className="brand-mark">N</span>
        <span>NutriPlan Pro</span>
      </Link>

      <nav className="app-nav" aria-label="Navegacao principal">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={item.key === active ? "nav-link active" : "nav-link"}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link href="/api/auth/me" className="user-pill" title={user.email}>
        {initials(user.name)}
      </Link>
    </header>
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
