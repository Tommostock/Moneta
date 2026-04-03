import type { Metadata, Viewport } from "next";
import { DM_Sans, Roboto_Mono, Inter } from "next/font/google";
import BottomNav from "@/components/shared/BottomNav";
import ThemeProvider from "@/components/shared/ThemeProvider";
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

const inter = Inter({
  variable: "--font-inter",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        {/* Inline script to prevent flash — applies theme class before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=JSON.parse(localStorage.getItem("moneta:settings")||"{}").theme;if(t==="light")document.documentElement.classList.add("light")}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${robotoMono.variable} ${inter.variable} font-sans bg-bg-primary text-text-primary antialiased`}
      >
        <ThemeProvider />
        <main className="pb-16">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
