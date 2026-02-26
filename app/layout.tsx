import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Holiday Hub - Never Miss a Holiday',
  description:
    'Customizable holiday notifications delivered via email and push notifications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className='dark'>
      <head>
        {/*
          Dev-time compatibility shim: Some browser extensions or injected dev helpers
          sometimes insert scripts that assume CommonJS globals (`exports`/`module`).
          When those injected snippets run in the page they can throw
          `ReferenceError: exports is not defined` and prevent client scripts from
          initializing (click handlers, HMR, etc.).

          This tiny shim safely creates minimal `exports`/`module` objects when
          they are missing so such injected scripts don't crash the page.
          It is intentionally non-invasive and only defines the objects.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(typeof window!=='undefined'){if(typeof exports==='undefined'){window.exports={};}if(typeof module==='undefined'){window.module={exports:window.exports};}if(typeof module.exports==='undefined'){module.exports=window.exports;}}}catch(e){/* ignore */}})();`,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
