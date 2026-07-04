import { MetadataRoute } from "next";

const BASE_URL = "https://clinos.tec.br";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${BASE_URL}/termos-de-uso`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3
    },
    {
      url: `${BASE_URL}/politica-de-privacidade`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3
    },
    {
      url: `${BASE_URL}/exclusao-de-conta`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2
    }
  ];
}
