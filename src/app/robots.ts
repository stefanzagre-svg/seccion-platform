import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/how-we-do",
          "/become-creator",
          "/creator-hub",
          "/vibe-radar",
          "/now-streaming",
          "/privacy",
          "/rules",
          "/hit-us-up",
          "/login",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/studio/",
          "/messages/",
          "/dashboard/",
          "/profile/member",
          "/onboarding/",
        ],
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: [
          "/",
          "/how-we-do",
          "/become-creator",
          "/creator-hub",
          "/vibe-radar",
          "/now-streaming",
          "/rules",
          "/privacy",
          "/llms.txt",
        ],
        disallow: ["/admin/", "/api/", "/studio/", "/messages/"],
      },
    ],
    sitemap: "https://seccion.ai/sitemap.xml",
  };
}
