import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/termos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
