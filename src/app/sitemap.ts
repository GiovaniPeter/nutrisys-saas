import { MetadataRoute } from "next";

const BASE_URL = "https://clinos.tec.br";
const CONTENT_UPDATED_AT = new Date("2026-07-18T00:00:00-04:00");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${BASE_URL}/software-para-nutricionistas`,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.9
    },
    {
      url: `${BASE_URL}/sistema-para-clinicas`,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.9
    },
    {
      url: `${BASE_URL}/recursos`,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.85
    },
    {
      url: `${BASE_URL}/termos-de-uso`,
      lastModified: new Date("2026-06-27T00:00:00-04:00"),
      changeFrequency: "yearly",
      priority: 0.3
    },
    {
      url: `${BASE_URL}/politica-de-privacidade`,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.3
    },
    {
      url: `${BASE_URL}/exclusao-de-conta`,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.2
    }
  ];
}
