import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sitecore Silver • 25 Years of Innovation',
  description: 'Create your AI-powered memory at the Sitecore Silver 25-year anniversary celebration in Copenhagen',
  keywords: ['Sitecore', 'Silver', 'Anniversary', 'Copenhagen', 'AI', 'Photo Booth'],
  authors: [{ name: 'Sitecore' }],
  openGraph: {
    title: 'Sitecore Silver Photo Booth',
    description: 'Celebrate 25 years of Sitecore innovation',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/logo.jpg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-sc-bg text-sc-text antialiased font-sitecore min-h-screen">
        {children}
      </body>
    </html>
  );
}
