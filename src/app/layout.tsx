import type { Metadata } from "next";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: "ClinOS — O sistema operacional da sua clínica",
  description: "Agenda, prontuário, pacientes, financeiro e acompanhamento em uma única plataforma.",
  keywords: ["sistema para clínicas", "software médico", "prontuário eletrônico", "gestão de clínicas", "agendamento médico", "sistema operacional clínico"],
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    title: "ClinOS — O sistema operacional da sua clínica",
    description: "Agenda, prontuário, pacientes, financeiro e acompanhamento em uma única plataforma.",
    images: [
      {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "ClinOS - O sistema operacional da sua clínica."
      }
    ],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ClinOS — O sistema operacional da sua clínica",
    description: "Agenda, prontuário, pacientes, financeiro e acompanhamento em uma única plataforma.",
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
      </body>
    </html>
  );
}
