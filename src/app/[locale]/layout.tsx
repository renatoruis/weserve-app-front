import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";
import ThemeProvider from "@/components/ThemeProvider";
import InstallPWA from "@/components/InstallPWA";
import NotificationBanner from "@/components/NotificationBanner";
import "../globals.css";

export const metadata: Metadata = {
  title: "Open Heavens",
  description: "Open Heavens App",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Igreja App",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#242121",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "pt" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased bg-[var(--color-bg)]">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <SplashScreen>
              <main className="min-h-screen max-w-lg mx-auto">
                {children}
              </main>
              <InstallPWA />
              <NotificationBanner />
              <BottomNav />
            </SplashScreen>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
