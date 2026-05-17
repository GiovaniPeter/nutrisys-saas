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

export function middleware(request: NextRequest) {
  const role = readRole(request.cookies.get(SESSION_COOKIE)?.value);

  if (role !== "SECRETARY") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

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

function readRole(cookie?: string) {
  if (!cookie) {
    return null;
  }

  const [encoded] = cookie.split(".");

  if (!encoded) {
    return null;
  }

  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded)) as { role?: string };
    return payload.role || null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"]
};
