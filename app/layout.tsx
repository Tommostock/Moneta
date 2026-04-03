import type { Metadata, Viewport } from "next";
import { DM_Sans, Roboto_Mono } from "next/font/google";
import BottomNav from "@/components/shared/BottomNav";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MONETA",
  description: "Currency converter and rate tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MONETA",
  },
  applicationName: "MONETA",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0C0C0C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`${dmSans.variable} ${robotoMono.variable} font-sans bg-bg-primary text-text-primary antialiased`}
      >
        <main className="pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
