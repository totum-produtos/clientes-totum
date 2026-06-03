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
  return (
    <html lang="pt-BR" className="dark">
      <body className="theme-totum-red">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
