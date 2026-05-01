import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GameVault - Beli Game Steam Murah & Otomatis",
  description: "Beli game Steam murah dengan proses otomatis. Download game favorit dalam hitungan menit setelah pembayaran.",
  keywords: ["game steam", "beli game murah", "game download", "steam key", "game digital"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
        style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
