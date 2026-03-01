import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import type { ReactNode } from 'react';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Holiday Hub - Never Miss a Holiday',
  description: 'Customizable holiday notifications delivered via email',
  icons: {
    icon: [
      { url: '/trone-lts.svg' },
      { url: '/trone-lts.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/trone-lts.svg',
    apple: '/trone-lts.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' className='dark'>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
