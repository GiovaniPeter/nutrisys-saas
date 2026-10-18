import { NextRequest, NextResponse } from "next/server";
import { readVerifiedSession } from "./lib/middleware-session";

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicPages = ["/", "/login", "/register", "/recuperar-senha", "/portal", "/recursos",
    "/termos-de-uso", "/politica-de-privacidade", "/exclusao-de-conta", "/editor-cardapio",
    "/software-para-nutricionistas", "/software-para-montar-cardapio-nutricionista", "/sistema-para-clinicas", "/tabela-taco"];
  if (publicPages.includes(pathname) || pathname.startsWith("/portal/") || pathname.startsWith("/book/") ||
    pathname === "/manifest.webmanifest" || pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return NextResponse.next();
  }
  const authorization = request.headers.get("authorization");
  const token = request.cookies.get(SESSION_COOKIE)?.value ||
    (authorization?.startsWith("Bearer ") ? authorization.split(" ")[1] : undefined);
  const { role, specialty } = await readVerifiedSession(token);

  if (!role || (role !== "SECRETARY" && role !== "PROFESSIONAL")) {
    return NextResponse.next();
  }

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

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"]
};
