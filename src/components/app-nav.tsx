"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AuthenticatedUser } from "@/lib/session";

export type AppNavKey =
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

type IconName =
  | "home"
  | "people"
  | "calendar"
  | "clock"
  | "plan"
  | "wallet"
  | "nutrition"
  | "clinical"
  | "communication"
  | "analytics"
  | "settings";

type NavItem = {
  key: AppNavKey;
  href: string;
  label: string;
  icon: IconName;
  mobileOptional?: boolean;
};

type AppNavProps = {
  active: AppNavKey;
  user: AuthenticatedUser;
};

const navItems: NavItem[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: "home" },
  { key: "patients", href: "/patients", label: "Pacientes", icon: "people" },
  { key: "appointments", href: "/appointments", label: "Agenda", icon: "calendar" },
  { key: "schedule", href: "/schedule", label: "Calendário", icon: "clock", mobileOptional: true },
  { key: "meal-plans", href: "/meal-plans", label: "Planos", icon: "plan", mobileOptional: true },
  { key: "financial", href: "/financial", label: "Financeiro", icon: "wallet", mobileOptional: true },
  { key: "recipes", href: "/recipes", label: "Receitas", icon: "nutrition" },
  { key: "shopping", href: "/shopping", label: "Compras", icon: "nutrition" },
  { key: "foods", href: "/foods", label: "Alimentos", icon: "nutrition" },
  { key: "body-records", href: "/body-records", label: "Evolução", icon: "clinical" },
  { key: "anamneses", href: "/anamneses", label: "Anamnese", icon: "clinical" },
  { key: "recalls", href: "/recalls", label: "Recordatório", icon: "clinical" },
  { key: "lab-exams", href: "/lab-exams", label: "Exames", icon: "clinical" },
  { key: "supplements", href: "/supplements", label: "Suplementos", icon: "nutrition" },
  { key: "food-diary", href: "/food-diary", label: "Diário alimentar", icon: "nutrition" },
  { key: "hydration", href: "/hydration", label: "Metas e hidratação", icon: "clinical" },
  { key: "energy", href: "/energy", label: "Cálculo energético", icon: "clinical" },
  { key: "chat", href: "/chat", label: "Chat", icon: "communication" },
  { key: "whatsapp", href: "/whatsapp", label: "WhatsApp", icon: "communication" },
  { key: "notifications", href: "/notifications", label: "Alertas", icon: "communication" },
  { key: "kpis", href: "/kpis", label: "KPIs", icon: "analytics" },
  { key: "reports", href: "/reports", label: "Relatórios", icon: "analytics" },
  { key: "materials", href: "/materials", label: "Materiais", icon: "analytics" },
  { key: "portal", href: "/portal/login", label: "Portal do paciente", icon: "people" },
  { key: "billing", href: "/billing", label: "Assinatura", icon: "wallet" },
  { key: "users", href: "/users", label: "Equipe", icon: "people" },
  { key: "settings", href: "/settings", label: "Configurações", icon: "settings" }
];

const primaryNavKeys = new Set<AppNavKey>([
  "dashboard",
  "patients",
  "appointments",
  "schedule",
  "meal-plans",
  "financial"
]);

const primaryNavKeysProfessional = new Set<AppNavKey>([
  "dashboard",
  "patients",
  "appointments",
  "schedule",
  "financial"
]);

const menuGroups: Array<{ label: string; keys: AppNavKey[] }> = [
  {
    label: "Nutrição e atendimento",
    keys: [
      "recipes",
      "shopping",
      "foods",
      "body-records",
      "anamneses",
      "recalls",
      "lab-exams",
      "supplements",
      "food-diary",
      "hydration",
      "energy"
    ]
  },
  {
    label: "Relacionamento",
    keys: ["chat", "whatsapp", "notifications", "portal"]
  },
  {
    label: "Gestão da clínica",
    keys: ["kpis", "reports", "materials", "billing", "users", "settings"]
  }
];

const menuGroupsProfessional: Array<{ label: string; keys: AppNavKey[] }> = [
  {
    label: "Atendimento clínico",
    keys: [
      "body-records",
      "anamneses",
      "lab-exams"
    ]
  },
  {
    label: "Relacionamento",
    keys: ["chat", "whatsapp", "notifications", "portal"]
  },
  {
    label: "Gestão da clínica",
    keys: ["kpis", "reports", "materials", "billing", "users", "settings"]
  }
];

const secretaryNavKeys = new Set<AppNavKey>([
  "dashboard",
  "patients",
  "appointments",
  "schedule",
  "chat",
  "whatsapp",
  "notifications"
]);

const professionalNavKeys = new Set<AppNavKey>([
  "dashboard",
  "patients",
  "appointments",
  "schedule",
  "financial",
  "body-records",
  "anamneses",
  "lab-exams",
  "chat",
  "whatsapp",
  "notifications",
  "kpis",
  "reports",
  "materials",
  "portal",
  "billing",
  "users",
  "settings"
]);

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

export function AppNav({ active, user }: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const prefetchedRoutes = useRef(new Set<string>());

  const isProfessional = user.role === "PROFESSIONAL";
  const isSecretary = user.role === "SECRETARY";

  const visibleNavItems = useMemo(
    () => {
      if (isSecretary) return navItems.filter((item) => secretaryNavKeys.has(item.key));
      if (isProfessional) return navItems.filter((item) => professionalNavKeys.has(item.key));
      return navItems;
    },
    [user.role, isSecretary, isProfessional]
  );
  const itemByKey = useMemo(
    () => new Map(visibleNavItems.map((item) => [item.key, item])),
    [visibleNavItems]
  );
  const activePrimaryKeys = isProfessional ? primaryNavKeysProfessional : primaryNavKeys;
  const primaryItems = visibleNavItems.filter((item) => activePrimaryKeys.has(item.key));
  const activeMenuGroups = isProfessional ? menuGroupsProfessional : menuGroups;
  const groupedItems = activeMenuGroups
    .map((group) => ({
      ...group,
      items: group.keys.map((key) => itemByKey.get(key)).filter((item): item is NavItem => Boolean(item))
    }))
    .filter((group) => group.items.length > 0);
  const mobileShortcuts = primaryItems.filter((item) => item.mobileOptional);
  const activeItem = itemByKey.get(active);
  const activeInMore = !activePrimaryKeys.has(active);
  const profileHref = isSecretary ? "/dashboard" : "/settings";

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    if (!pendingHref) return;

    const timeout = window.setTimeout(() => setPendingHref(null), 10000);
    return () => window.clearTimeout(timeout);
  }, [pendingHref]);

  useEffect(() => {
    function closeMenu(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        menuRef.current.removeAttribute("open");
      }
    }

    function closeMenuWithKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") menuRef.current?.removeAttribute("open");
    }

    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeMenuWithKeyboard);

    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeMenuWithKeyboard);
    };
  }, []);

  function warmRoute(href: string) {
    if (href === pathname || prefetchedRoutes.current.has(href)) return;

    prefetchedRoutes.current.add(href);
    router.prefetch(href);
  }

  function beginNavigation(href: string) {
    if (href !== pathname) setPendingHref(href);
  }

  function renderLink(item: NavItem, variant: "primary" | "menu") {
    const isActive = item.key === active;
    const isPending = item.href === pendingHref;

    return (
      <Link
        key={item.key}
        href={item.href}
        prefetch={false}
        aria-current={isActive ? "page" : undefined}
        className={[
          variant === "primary" ? "nav-link" : "nav-menu-link",
          item.mobileOptional ? "nav-link-mobile-optional" : "",
          isActive ? "active" : "",
          isPending ? "pending" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseEnter={() => warmRoute(item.href)}
        onFocus={() => warmRoute(item.href)}
        onClick={() => beginNavigation(item.href)}
      >
        <NavIcon name={item.icon} />
        <span>{item.label}</span>
        {isPending ? <span className="nav-link-spinner" aria-hidden="true" /> : null}
      </Link>
    );
  }

  return (
    <header className="app-header">
      <div className={pendingHref ? "app-navigation-progress active" : "app-navigation-progress"} aria-hidden="true">
        <span />
      </div>

      <Link
        href="/dashboard"
        prefetch={false}
        className="brand app-brand"
        onMouseEnter={() => warmRoute("/dashboard")}
        onFocus={() => warmRoute("/dashboard")}
        onClick={() => beginNavigation("/dashboard")}
      >
        <span className="brand-mark"><BrandLeafIcon /></span>
        <span className="app-brand-copy">
          <strong>NutreClin</strong>
          <small>{isProfessional ? "Gestão clínica" : "Gestão nutricional"}</small>
        </span>
      </Link>

      <nav className="app-nav" aria-label="Navegação principal">
        {primaryItems.map((item) => renderLink(item, "primary"))}

        <details
          ref={menuRef}
          className={[
            "nav-more",
            activeInMore ? "active" : "",
            activeItem?.mobileOptional ? "mobile-active" : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <summary>
            <NavIcon name="settings" />
            <span>Mais</span>
            <ChevronDownIcon />
          </summary>

          <div className="nav-more-panel">
            {mobileShortcuts.length ? (
              <div className="nav-menu-group nav-menu-mobile-shortcuts">
                <span className="nav-menu-label">Atalhos</span>
                <div>{mobileShortcuts.map((item) => renderLink(item, "menu"))}</div>
              </div>
            ) : null}

            {groupedItems.map((group) => (
              <div className="nav-menu-group" key={group.label}>
                <span className="nav-menu-label">{group.label}</span>
                <div>{group.items.map((item) => renderLink(item, "menu"))}</div>
              </div>
            ))}
          </div>
        </details>
      </nav>

      <Link
        href={profileHref}
        prefetch={false}
        className="user-profile-link"
        title={`${user.name} - ${user.email}`}
        onMouseEnter={() => warmRoute(profileHref)}
        onFocus={() => warmRoute(profileHref)}
        onClick={() => beginNavigation(profileHref)}
      >
        <span className="user-pill">{initials(user.name)}</span>
        <span className="user-profile-copy">
          <strong>{firstName(user.name)}</strong>
          <small>{formatRole(user.role, user.specialty)}</small>
        </span>
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

function firstName(name: string) {
  return name.split(" ").filter(Boolean)[0] || "Perfil";
}

function formatRole(role: string, specialty?: string) {
  if (role === "PROFESSIONAL" && specialty) {
    return specialtyLabels[specialty] || "Profissional";
  }

  const roles: Record<string, string> = {
    OWNER: "Responsável",
    ADMIN: "Administrador",
    NUTRITIONIST: "Nutricionista",
    SECRETARY: "Secretária",
    PROFESSIONAL: "Profissional"
  };

  return roles[role] || "Profissional";
}

function BrandLeafIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32">
      <path d="M7 19C7 11 13 6 25 6c0 11-5 17-13 17-2 0-3.8-.5-5-1.5Z" />
      <path d="M9 22c4-7 9-11 16-14M16 22v5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="nav-chevron" aria-hidden="true" viewBox="0 0 20 20">
      <path d="m6 8 4 4 4-4" />
    </svg>
  );
}

function NavIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m4 11 8-7 8 7" /><path d="M6 10v10h12V10M10 20v-6h4v6" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-4 2.5-7 6-7s6 3 6 7M17 11a3 3 0 1 0 0-6M16 14c3 .2 5 2.4 5 6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v5M16 3v5M3 10h18M8 14h3M14 14h2M8 18h2" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    plan: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    wallet: <><path d="M4 7h14a2 2 0 0 1 2 2v10H4V7Z" /><path d="M4 7V5h12v2M15 12h6v4h-6a2 2 0 0 1 0-4Z" /></>,
    nutrition: <><path d="M7 4v7M11 4v7M9 4v17M17 4c4 3 4 9 0 12v5" /></>,
    clinical: <><path d="M6 20V8l6-4 6 4v12" /><path d="M9 20v-5h6v5M12 8v4M10 10h4" /></>,
    communication: <><path d="M4 5h16v12H9l-5 4V5Z" /><path d="M8 9h8M8 13h5" /></>,
    analytics: <><path d="M4 20h16M7 17v-5M12 17V7M17 17v-9" /><path d="m5 9 5-4 4 3 5-5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>
  };

  return (
    <svg className="nav-icon" aria-hidden="true" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
