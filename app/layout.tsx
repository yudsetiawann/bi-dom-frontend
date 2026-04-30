import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/ui/LayoutWrapper';
import Providers from './providers'; // Import Providers React Query
import { Toaster } from 'sonner';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'DOM Social Hub | BI Dashboard',
  description:
    'Dashboard Analisis Penjualan & Business Intelligence DOM Social Hub',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${montserrat.className} bg-white text-black antialiased`}
      >
        {/* React Query Provider membungkus seluruh layout aplikasi */}
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster
            position="top-right"
            richColors
            theme="light"
            toastOptions={{
              style: {
                borderRadius: '0px',
                border: '2px solid black',
                fontFamily: 'var(--font-montserrat)',
                boxShadow: '4px 4px 0px #000000',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
