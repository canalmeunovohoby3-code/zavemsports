import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo";
import "@fontsource-variable/inter";
import "./globals.css";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "ZEVEN SPORTS — Essenciais em movimento",
    template: "%s | ZEVEN SPORTS",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "ZEVEN SPORTS",
    "camisetas básicas",
    "camisetas plus size",
    "bermudas plus size",
    "roupas infantis",
    "moda esportiva",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: siteConfig.name,
    title: "ZEVEN SPORTS — Essenciais em movimento",
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "ZEVEN SPORTS — Essenciais em movimento",
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
