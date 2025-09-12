import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'VibeCaaS - Collaborative AI Development Platform',
  description: 'Build, deploy, and collaborate on AI applications with our cutting-edge platform. Experience seamless development with real-time collaboration and intelligent agents.',
  keywords: ['AI', 'development', 'collaboration', 'platform', 'agents', 'real-time'],
  authors: [{ name: 'VibeCaaS Team' }],
  creator: 'VibeCaaS',
  publisher: 'VibeCaaS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://vibecaas.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vibecaas.com',
    title: 'VibeCaaS - Collaborative AI Development Platform',
    description: 'Build, deploy, and collaborate on AI applications with our cutting-edge platform.',
    siteName: 'VibeCaaS',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VibeCaaS Platform Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibeCaaS - Collaborative AI Development Platform',
    description: 'Build, deploy, and collaborate on AI applications with our cutting-edge platform.',
    images: ['/og-image.jpg'],
    creator: '@vibecaas',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.vibecaas.com" />
        <link rel="dns-prefetch" href="https://cdn.vibecaas.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}