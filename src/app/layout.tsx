import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
