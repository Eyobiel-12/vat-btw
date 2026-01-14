import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

// Optimize fonts with display swap for better performance
const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-geist",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only load when needed
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "BTW Assist - Nederlandse Boekhoudondersteuning",
  description: "Professionele BTW berekening en grootboek beheer voor Nederlandse boekhouders",
  generator: "v0.app",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://vat-btw.vercel.app"),
  openGraph: {
    title: "BTW Assist - Nederlandse Boekhoudondersteuning",
    description: "Professionele BTW berekening en grootboek beheer voor Nederlandse boekhouders",
    type: "website",
    locale: "nl_NL",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  // Performance optimizations
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <body className={`${geist.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          defaultTheme="system"
          storageKey="btw-assist-theme"
          attribute="class"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
