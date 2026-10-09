import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const monaSans = localFont({
  src: "../public/fonts/mona-sans.woff2",
  variable: "--font-mona",
  weight: "200 900",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "../public/fonts/jetbrains-mono.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Accueil · AKNO Copilot",
  description: "Espace client AKNO — statistiques et performance de votre site",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${monaSans.variable} ${jetbrainsMono.variable}`}>
      <body className={monaSans.className}>{children}</body>
    </html>
  );
}
