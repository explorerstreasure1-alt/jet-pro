import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Word Invaders",
    short_name: "Invaders",
    description: "Arcade language defense trainer",
    start_url: "/",
    display: "standalone",
    background_color: "#050814",
    theme_color: "#050814",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
