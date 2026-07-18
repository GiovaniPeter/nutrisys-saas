import type { Metadata } from "next";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://clinos.tec.br"),
  applicationName: "ClinOS",
  title: "ClinOS — Software para nutricionistas e clínicas multiprofissionais",
  description: "Prontuário, agenda, financeiro, planos alimentares e portal do paciente — tudo em uma única plataforma para nutricionistas e profissionais de saúde.",
  keywords: ["software para nutricionistas", "sistema para clínicas", "prontuário eletrônico", "plano alimentar", "gestão de clínicas", "agenda online nutricionista", "recordatório 24h", "tabela TACO", "portal do paciente", "sistema multiprofissional", "software clínica nutrição", "software para profissionais de saúde", "sistema de gestão clínica online", "agenda de pacientes online", "prontuário digital"],
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "ClinOS — Software para nutricionistas e clínicas multiprofissionais",
    description: "Prontuário, agenda, financeiro, planos alimentares e portal do paciente — tudo em uma única plataforma para nutricionistas e profissionais de saúde.",
    url: "/",
    siteName: "ClinOS",
    images: [
      {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "ClinOS - Software completo para nutricionistas e clínicas multiprofissionais."
      }
    ],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ClinOS — Software para nutricionistas e clínicas multiprofissionais",
    description: "Prontuário, agenda, financeiro, planos alimentares e portal do paciente — tudo em uma única plataforma.",
    images: ["/social-card.png"]
  }
};

import { GoogleAnalytics } from "@next/third-parties/google";

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
