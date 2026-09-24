import type { Metadata, Viewport } from "next";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1
};

export const metadata: Metadata = {
  metadataBase: new URL("https://clinos.tec.br"),
  applicationName: "NutriPlan",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NutriPlan"
  },
  title: "NutriPlan | Software para Nutricionistas — Cardápios TACO, Pollock/Guedes e Portal do Paciente",
  description:
    "O software completo para nutricionistas: monte cardápios calculados em minutos com tabela TACO (+1.000 itens) e medidas caseiras, dobras cutâneas Pollock 3/7 e Guedes, Cunningham/Tinsley, PDF com CRN e Portal do Paciente instalável.",
  keywords: [
    "software para nutricionistas",
    "programa para montar cardápio nutricionista",
    "sistema para nutricionista",
    "software de nutrição",
    "plano alimentar com medidas caseiras",
    "tabela TACO online nutricionista",
    "app para nutricionista e paciente",
    "prontuário nutricional eletrônico",
    "cálculo energético Cunningham Tinsley",
    "avaliação antropométrica Pollock 3 e 7 dobras",
    "recordatório 24h online",
    "diário alimentar com fotos",
    "prescrição de suplementos nutricionista"
  ],
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "NutriPlan | Software para Nutricionistas — Cardápios TACO, Pollock e App do Paciente",
    description:
      "Monte planos alimentares em minutos com medidas caseiras reais, templates prontos, dobras cutâneas Pollock/Guedes, PDF com CRN e Portal do Paciente.",
    url: "/",
    siteName: "NutriPlan",
    images: [
      {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "NutriPlan - Software completo para nutricionistas e consultórios de nutrição."
      }
    ],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriPlan | Software para Nutricionistas — Cardápios TACO e Portal do Paciente",
    description:
      "Monte planos alimentares com medidas caseiras, substituições equivalentes, dobras Pollock/Guedes e app do paciente em uma única plataforma.",
    images: ["/social-card.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <CookieBanner />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        ) : null}
      </body>
    </html>
  );
}
