import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
});

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
    <html lang="en" className={dmSans.variable}>
      <body className="bg-black text-white antialiased font-dm-sans">
        <div className="photo-booth-container min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
