import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mahirusaha — Platform AI untuk UMKM Indonesia",
  description: "AI Chatbot WhatsApp 24 jam, Toko Online siap pakai, dan Broadcast promo otomatis. Mulai gratis, tanpa coding. Solusi digital lengkap untuk UMKM Indonesia mulai Rp 99.000/bulan.",
  keywords: "chatbot whatsapp, toko online umkm, ai chatbot indonesia, bot whatsapp otomatis, platform digital umkm",
  verification: {
    other: {
      'facebook-domain-verification': 't9a0fmojp7asm8bttz1c8eqn16gh2e',
    },
  },
  openGraph: {
    title: "Mahirusaha — Platform AI untuk UMKM Indonesia",
    description: "AI Chatbot WhatsApp 24 jam, Toko Online siap pakai, dan Broadcast promo otomatis. Mulai gratis, tanpa coding.",
    url: "https://mahirusaha.com",
    siteName: "Mahirusaha",
    type: "website",
  },
  metadataBase: new URL("https://mahirusaha.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}