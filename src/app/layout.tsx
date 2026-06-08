import type { Metadata, Viewport } from 'next';
import { AppConfigProvider } from '@/components/providers/app-config-provider';
import { MarketplaceProvider } from '@/components/providers/marketplace';
import './globals.css';

const appTitle = process.env.APP_EVENT_TITLE ?? 'AI Photo Booth';
const appDescription =
  process.env.APP_META_DESCRIPTION ??
  'Capture, transform, and share AI-powered event photos';

export const metadata: Metadata = {
  title: appTitle,
  description: appDescription,
  keywords: ['Photo Booth', 'AI', 'Event', 'Gemini'],
  openGraph: {
    title: appTitle,
    description: appDescription,
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
        <MarketplaceProvider>
          <AppConfigProvider>{children}</AppConfigProvider>
        </MarketplaceProvider>
      </body>
    </html>
  );
}
