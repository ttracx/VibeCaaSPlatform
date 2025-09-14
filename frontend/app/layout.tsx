import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VibeCaaS - Multi-Agent AI Development Platform',
  description: 'Watch AI agents plan, code, test, and deploy your applications in real-time. Experience the future of development with our intelligent orchestration system.',
  keywords: ['AI', 'development', 'platform', 'agents', 'coding', 'automation', 'deployment'],
  authors: [{ name: 'VibeCaaS Team' }],
  openGraph: {
    title: 'VibeCaaS - Multi-Agent AI Development Platform',
    description: 'Watch AI agents plan, code, test, and deploy your applications in real-time.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibeCaaS - Multi-Agent AI Development Platform',
    description: 'Watch AI agents plan, code, test, and deploy your applications in real-time.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}