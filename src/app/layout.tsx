import type { Metadata } from "next";

// Stagewise 开发工具导入
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import { extractRouterConfig } from "uploadthing/server";

import { SEO_CONFIG } from "~/app";
import { ourFileRouter } from "~/app/api/uploadthing/core";
import { CartProvider } from "~/lib/hooks/use-cart";
import { LocaleProvider } from "~/lib/i18n/locale-provider";
import "~/css/globals.css";
import { MessagesProvider } from "~/lib/i18n/messages-provider";
import { Footer } from "~/ui/components/footer";
import { Header } from "~/ui/components/header/header";
import { ThemeProvider } from "~/ui/components/theme-provider";
import { Toaster } from "~/ui/primitives/sonner";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

// Stagewise 配置
const stagewiseConfig = {
  plugins: [],
};

export const metadata: Metadata = {
  description: `${SEO_CONFIG.description}`,
  title: `${SEO_CONFIG.fullName}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 确认是否为开发环境
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          min-h-screen bg-gradient-to-br from-white to-slate-100
          text-neutral-900 antialiased
          selection:bg-primary/80
          dark:from-neutral-950 dark:to-neutral-900 dark:text-neutral-100
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <LocaleProvider>
            <MessagesProvider>
              <CartProvider>
                <Header showAuth={true} />
                <main className={`flex min-h-screen flex-col`}>{children}</main>
                <Footer />
                <Toaster />
              </CartProvider>
            </MessagesProvider>
          </LocaleProvider>
          {/* 仅在开发环境中显示Stagewise工具栏 */}
          {isDevelopment && <StagewiseToolbar config={stagewiseConfig} />}
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
