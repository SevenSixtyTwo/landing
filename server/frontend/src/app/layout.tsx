import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ЭНЕРГОСФЕРА",
  description: "Ремонт электродвигателей и изготовление запасных частей",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}