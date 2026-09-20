import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Exo_2, Lexend, Rubik, Share_Tech_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const exo = Exo_2({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-rubik",
  display: "swap",
});

const mono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin", "latin-ext"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Word Invaders — Neural Vocabulary Strike",
  description:
    "Neon sci-fi language trainer. Shoot, speak and memorize words across 7 languages from A1 to C1.",
  applicationName: "Word Invaders",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Word Invaders",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050814" },
    { media: "(prefers-color-scheme: light)", color: "#050814" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={`${exo.variable} ${rubik.variable} ${mono.variable} ${lexend.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
