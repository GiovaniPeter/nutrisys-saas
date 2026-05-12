import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriSys SaaS",
  description: "Plataforma SaaS para nutricionistas, clínicas e pacientes."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
