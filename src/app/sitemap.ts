import { MetadataRoute } from "next";

const BASE_URL = "https://clinos.tec.br";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date("2026-10-18T12:00:00-03:00"),
      changeFrequency: "weekly",
      priority: 1.0
    },
    {
      url: `${BASE_URL}/software-para-nutricionistas`,
      lastModified: new Date("2026-10-15T12:00:00-03:00"),
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${BASE_URL}/software-para-montar-cardapio-nutricionista`,
      lastModified: new Date("2026-10-15T12:00:00-03:00"),
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${BASE_URL}/tabela-taco`,
      lastModified: new Date("2026-10-14T12:00:00-03:00"),
      changeFrequency: "monthly",
      priority: 0.9
    },
    {
      url: `${BASE_URL}/recursos`,
      lastModified: new Date("2026-10-14T12:00:00-03:00"),
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${BASE_URL}/sistema-para-clinicas`,
      lastModified: new Date("2026-10-10T12:00:00-03:00"),
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${BASE_URL}/termos-de-uso`,
      lastModified: new Date("2026-09-01T00:00:00-03:00"),
      changeFrequency: "yearly",
      priority: 0.3
    },
    {
      url: `${BASE_URL}/politica-de-privacidade`,
      lastModified: new Date("2026-09-01T00:00:00-03:00"),
      changeFrequency: "yearly",
      priority: 0.3
    },
    {
      url: `${BASE_URL}/exclusao-de-conta`,
      lastModified: new Date("2026-09-01T00:00:00-03:00"),
      changeFrequency: "yearly",
      priority: 0.2
    }
  ];
}
