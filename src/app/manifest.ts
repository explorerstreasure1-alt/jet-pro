import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Word Invaders",
    short_name: "Invaders",
    description: "Neon arcade language defense: shoot, speak and memorize words in 7 languages.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#050814",
    theme_color: "#050814",
    categories: ["education", "games"],
    lang: "tr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
