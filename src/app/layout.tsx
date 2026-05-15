import type { Metadata, Viewport } from "next";
import { Inter, Tajawal } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { WelcomeModal } from "@/components/ui/WelcomeModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "مرشد عدن الطبي",
  description: "دليلك الطبي الشامل في محافظة عدن - يعمل بدون إنترنت",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Set default to Arabic (RTL) since it's the primary language
  return (
    <html lang="ar" dir="rtl" className={cn(inter.variable, tajawal.variable, "antialiased")}>
      <body className="min-h-screen font-arabic bg-background text-foreground flex flex-col">
        <LayoutShell>
          {children}
          <WelcomeModal />
        </LayoutShell>
      </body>
    </html>
  );
}

