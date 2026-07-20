import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AASOS | SatWeb Scout",
  description: "Prospección comercial inteligente para SatWeb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
