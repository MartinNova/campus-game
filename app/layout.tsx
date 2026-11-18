import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { CurrentUserProvider } from "@/components/providers/CurrentUserProvider";
import { APP_DESCRIPTION, APP_NAME, APP_SHORT_NAME } from "@/lib/config/app";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_DESCRIPTION,
  // iPhone: open full screen from the home screen, with the app's short name under the icon.
  appleWebApp: { capable: true, title: APP_SHORT_NAME, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#151b26" },
  ],
};

/** App shell: header on top, page content in the middle, bottom navigation. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <CurrentUserProvider>
          <Header />
          <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-24">{children}</main>
          <BottomNav />
        </CurrentUserProvider>
      </body>
    </html>
  );
}
