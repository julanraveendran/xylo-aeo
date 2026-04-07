import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const font = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://xyloaeo.com';

export const metadata: Metadata = {
  title: 'Xylo AEO — AI Search Visibility for SaaS Founders',
  description: "Find out if your SaaS appears when someone asks ChatGPT or Gemini for the best tool in your category.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: 'Xylo AEO — AI Search Visibility for SaaS Founders',
    description: "Find out if your SaaS appears when someone asks ChatGPT or Gemini for the best tool in your category.",
    url: APP_URL,
    siteName: 'Xylo AEO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xylo AEO — AI Search Visibility for SaaS Founders',
    description: "Find out if your SaaS appears when someone asks ChatGPT or Gemini for the best tool in your category.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body className={font.className}>{children}</body>
    </html>
  );
}
