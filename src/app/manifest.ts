import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Word Invaders — Neural Vocabulary Strike",
    short_name: "Word Invaders",
    description:
      "Neon sci-fi language defense game. 7 languages, 52,500 words, A1–C1, voice and speech practice.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#050814",
    theme_color: "#050814",
    categories: ["education", "games"],
    lang: "tr",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.png", sizes: "192x192", type: "image/png", purpose: "any" },
    ],
  };
}
