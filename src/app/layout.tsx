import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { MainNav } from '@/components/layout/main-nav';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'MamaMtu - Maternal & Newborn Health Support',
  description: 'Comprehensive healthcare management for mothers and newborns',
  keywords: ['maternal health', 'newborn care', 'healthcare', 'Kenya', 'prenatal care'],
  authors: [{ name: 'MamaMtu Team' }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <SessionProvider>
          <WebSocketProvider>
            <div className="relative flex min-h-screen flex-col">
              <MainNav />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </WebSocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
