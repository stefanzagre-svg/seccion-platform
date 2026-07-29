import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SECCION Platform | Authentic Connections & Content",
    short_name: "SECCION",
    description:
      "1st Fusion Platform Dating App & Live Streaming Content Creators",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0c",
    theme_color: "#0a0a0c",
    orientation: "portrait",
    categories: ["social", "entertainment", "lifestyle"],
    icons: [
      {
        src: "/assets/logo/app-icon.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/assets/logo/app-icon.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/assets/logo/app-icon.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Community Feed",
        short_name: "Feed",
        description: "View latest member & creator updates",
        url: "/feed",
        icons: [{ src: "/assets/logo/app-icon.jpg", sizes: "192x192", type: "image/jpeg" }],
      },
      {
        name: "Live Streams",
        short_name: "Live",
        description: "Watch live creator streams",
        url: "/live",
        icons: [{ src: "/assets/logo/app-icon.jpg", sizes: "192x192", type: "image/jpeg" }],
      },
      {
        name: "Messages & AI Assistant",
        short_name: "Messages",
        description: "Chat with matches and AI Assistant",
        url: "/chat",
        icons: [{ src: "/assets/logo/app-icon.jpg", sizes: "192x192", type: "image/jpeg" }],
      },
    ],
  };
}
