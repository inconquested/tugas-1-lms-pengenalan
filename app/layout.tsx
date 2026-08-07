import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Nunito, Outfit, Space_Mono } from "next/font/google";
import "./global.css";
import { Providers } from "@/components/providers";

const fontSans = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontDisplay = Outfit({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Portal Sekolah - LMS & E-Rapor",
    template: "%s · Portal Sekolah",
  },
  description:
    "Sistem manajemen pembelajaran dan E-Rapor: kelola kelas, tugas, penilaian, dan rapor dalam satu portal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} font-sans antialiased`}
      > 
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}