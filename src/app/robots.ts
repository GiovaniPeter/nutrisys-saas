import { MetadataRoute } from "next";

const BASE_URL = "https://clinos.tec.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/patients", "/appointments", "/foods", "/meal-plans/", "/recipes", "/recalls", "/supplements", "/lab-exams", "/energy", "/body-records", "/food-diary", "/hydration", "/financial", "/chat", "/kpis", "/reports", "/settings", "/users", "/notifications", "/materials", "/schedule", "/shopping", "/whatsapp", "/billing", "/portal"]
      }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`
  };
}
