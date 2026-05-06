import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

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
    <html lang="pt-BR">
      <body className={theme}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
