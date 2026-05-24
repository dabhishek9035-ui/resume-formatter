import type { Metadata } from 'next';
import { Inter, Libre_Baskerville } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const headingFont = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Resume Builder',
  description: 'A locally powered, ATS-friendly resume builder with polished layout controls.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(bodyFont.variable, headingFont.variable, 'min-h-screen bg-background font-sans text-foreground')}>
        {children}
      </body>
    </html>
  );
}