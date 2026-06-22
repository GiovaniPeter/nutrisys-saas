import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "nutrisys_session";

const secretaryAllowedPages = [
  "/dashboard",
  "/appointments",
  "/schedule",
  "/patients",
  "/chat",
  "/notifications",
  "/whatsapp"
];

const secretaryAllowedApis = [
  "/api/auth",
  "/api/appointments",
  "/api/patients",
  "/api/chat",
  "/api/notifications",
  "/api/public-booking",
  "/api/health",
  "/api/portal"
];

const professionalBlockedPages = [
  "/meal-plans",
  "/recipes",
  "/shopping",
  "/foods",
  "/supplements",
  "/food-diary",
  "/hydration",
  "/energy",
  "/recalls"
];

const professionalBlockedApis = [
  "/api/meal-plans",
  "/api/recipes",
  "/api/shopping",
  "/api/foods",
  "/api/supplements",
  "/api/food-diary",
  "/api/hydration",
  "/api/energy",
  "/api/recalls"
];

export function middleware(request: NextRequest) {
  const { role } = readSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!role || (role !== "SECRETARY" && role !== "PROFESSIONAL")) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (role === "PROFESSIONAL") {
    if (pathname.startsWith("/api/")) {
      if (professionalBlockedApis.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
        return NextResponse.json({ error: "Funcionalidade exclusiva para nutricionistas." }, { status: 403 });
      }

      return NextResponse.next();
    }

    if (professionalBlockedPages.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // SECRETARY restrictions
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
