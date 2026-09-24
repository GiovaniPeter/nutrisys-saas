import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NutriPlan — Software para Nutricionistas & Portal do Paciente",
    short_name: "NutriPlan",
    description:
      "Software completo para nutricionistas com Tabela TACO (+1.000 itens), prescrição por medidas caseiras, antropometria Pollock/Guedes e Portal do Paciente.",
    start_url: "/portal",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#059669",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };
}
