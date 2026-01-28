import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Lora } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SettingsProvider } from '@/components/settings-provider'
import { LanguageProvider } from '@/components/language-provider'
import { ReadingHistoryProvider } from '@/components/reading-history-provider'
import { PWARegister } from '@/components/pwa-register'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _lora = Lora({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Scripture - Bible Reader',
  description: 'A minimal, modern Bible reading app focused on clean reading experience',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Scripture',
  },
  icons: {
    icon: [
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon-precomposed.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <SettingsProvider>
              <ReadingHistoryProvider>
                {children}
              </ReadingHistoryProvider>
            </SettingsProvider>
            <PWAInstallPrompt />
          </LanguageProvider>
        </ThemeProvider>
        <PWARegister />
        <Analytics />
      </body>
    </html>
  )
}
