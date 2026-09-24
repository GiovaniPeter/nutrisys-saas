import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "nutrisys_session";

const secretaryAllowedPages = [
  "/dashboard",
  "/appointments",
  "/schedule",
  "/patients",
  "/chat",
  "/notifications",
  "/whatsapp",
  "/feedback"
];

const secretaryAllowedApis = [
  "/api/auth",
  "/api/appointments",
  "/api/patients",
  "/api/chat",
  "/api/notifications",
  "/api/public-booking",
  "/api/health",
  "/api/portal",
  "/api/feedback"
];

// Prescrição dietética e montagem de cardápios/planos alimentares são atividades privativas do Nutricionista (Lei Federal nº 8.234/91)
const nutritionistExclusivePages = [
  "/meal-plans",
  "/recipes",
  "/shopping",
  "/foods",
  "/food-diary",
  "/recalls"
];

const nutritionistExclusiveApis = [
  "/api/meal-plans",
  "/api/recipes",
  "/api/shopping",
  "/api/foods",
  "/api/food-diary",
  "/api/recalls"
];

export function middleware(request: NextRequest) {
  const { role, specialty } = readSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!role || (role !== "SECRETARY" && role !== "PROFESSIONAL")) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Restrição para outros Profissionais de Saúde (Médicos, Psicólogos, Fisios, etc.):
  // Têm acesso a Prontuário, Evolução, Exames, Prescrições, Metas e Gasto Energético,
  // mas a Prescrição de Dietas / Planos Alimentares é restrita e privativa de Nutricionistas.
  if (role === "PROFESSIONAL" && specialty !== "nutricionista") {
    if (pathname.startsWith("/api/")) {
      if (nutritionistExclusiveApis.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
        return NextResponse.json(
          { error: "A prescrição de dietas e planos alimentares é privativa do Nutricionista (Lei nº 8.234/91)." },
          { status: 403 }
        );
      }

      return NextResponse.next();
    }

    if (nutritionistExclusivePages.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Restrição para SECRETÁRIA (apenas módulos administrativos e de recepção)
  if (role === "SECRETARY") {
    if (pathname.startsWith("/api/")) {
      if (secretaryAllowedApis.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
        return NextResponse.next();
      }

      return NextResponse.json({ error: "Acesso bloqueado para o modo secretária." }, { status: 403 });
    }

    if (
      pathname === "/" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/portal") ||
      secretaryAllowedPages.some((path) => pathname === path || pathname.startsWith(`${path}/`))
    ) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

function readSession(cookie?: string): { role: string | null; specialty: string | null } {
  if (!cookie) {
    return { role: null, specialty: null };
  }

  const [encoded] = cookie.split(".");

  if (!encoded) {
    return { role: null, specialty: null };
  }

  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded)) as { role?: string; specialty?: string };
    return { role: payload.role || null, specialty: payload.specialty || null };
  } catch {
    return { role: null, specialty: null };
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"]
};
