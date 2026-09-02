import type { Metadata } from 'next';
import { Inter, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-condensed',
});

export const metadata: Metadata = {
  title: 'SKILLTRACK AI — Performance Engineering & Career Readiness',
  description:
    'AI-powered skill development and placement-readiness platform for engineering students.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${barlowCondensed.variable} font-sans bg-black text-white antialiased selection:bg-[#FFD400] selection:text-black`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <ReactQueryProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                theme="dark"
                toastOptions={{
                  style: {
                    background: '#0A0A0A',
                    border: '1px solid rgba(255, 212, 0, 0.3)',
                    color: '#FFFFFF',
                  },
                }}
                closeButton
              />
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

