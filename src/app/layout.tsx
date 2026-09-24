import type { Metadata } from "next";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  metadataBase: new URL("https://clinos.tec.br"),
  applicationName: "NutriPlan ClinOS",
  title: "Software para Nutricionistas — Planos Alimentares, TACO e Portal do Paciente | NutriPlan",
  description:
    "O software completo para nutricionistas: monte cardápios calculados em minutos com tabela TACO e medidas caseiras, gere substituições equivalentes, calcule GEB/GET e fidelize pacientes com diário alimentar e portal exclusivo.",
  keywords: [
    "software para nutricionistas",
    "programa para montar cardápio nutricionista",
    "sistema para nutricionista",
    "software de nutrição",
    "plano alimentar com medidas caseiras",
    "tabela TACO online nutricionista",
    "app para nutricionista e paciente",
    "prontuário nutricional eletrônico",
    "cálculo energético GEB GET nutrição",
    "avaliação antropométrica nutricionista",
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
    title: "Software para Nutricionistas — Cardápios, Prontuário e App do Paciente | NutriPlan",
    description:
      "Monte planos alimentares em minutos com medidas caseiras reais, substituições automáticas, cálculo de GEB/GET, prontuário nutricional e Portal do Paciente.",
    url: "/",
    siteName: "NutriPlan ClinOS",
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
    title: "Software para Nutricionistas — Cardápios, TACO e Portal do Paciente",
    description:
      "Monte planos alimentares com medidas caseiras, substituições equivalentes, prontuário nutricional e app do paciente em uma única plataforma.",
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
