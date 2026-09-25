import { MetadataRoute } from "next";

const BASE_URL = "https://clinos.tec.br";

const DISALLOWED_PRIVATE_PATHS = [
  "/api/",
  "/dashboard",
  "/patients",
  "/appointments",
  "/foods",
  "/meal-plans",
  "/recipes",
  "/recalls",
  "/supplements",
  "/lab-exams",
  "/energy",
  "/body-records",
  "/food-diary",
  "/hydration",
  "/financial",
  "/chat",
  "/kpis",
  "/reports",
  "/settings",
  "/users",
  "/notifications",
  "/materials",
  "/schedule",
  "/shopping",
  "/whatsapp",
  "/billing",
  "/feedback",
  "/portal",
  "/login"
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt", "/llms-full.txt", "/software-para-nutricionistas", "/software-para-montar-cardapio-nutricionista", "/recursos"],
        disallow: DISALLOWED_PRIVATE_PATHS
      },
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Google-Extended", "Applebot-Extended"],
        allow: ["/", "/llms.txt", "/llms-full.txt", "/software-para-nutricionistas", "/software-para-montar-cardapio-nutricionista", "/recursos"],
        disallow: DISALLOWED_PRIVATE_PATHS
      }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL
  };
}
