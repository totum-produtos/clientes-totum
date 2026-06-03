import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

// Tipografia editorial. Carregada via next/font, exposta como CSS vars.
// Uso em Tailwind: `font-display` (Fraunces) e `font-mono` (JetBrains Mono).
// Cereal/Inter continua sendo o body padrão (font-cereal).
const fontDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Central do Cliente Totum",
  description: "Portal exclusivo para clientes da Totum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = process.env.NEXT_PUBLIC_THEME || "theme-totum";
  return (
    <html lang="pt-BR" className={`${fontDisplay.variable} ${fontMono.variable}`}>
      <body className={theme}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
